-- Longvy: Schema 0.1. Jeder Nutzer sieht nur eigene Zeilen (Row Level Security auf jeder Tabelle).
-- Region des Projekts: EU (Frankfurt). Ausführen mit `supabase db push` (docs/SETUP.md).

create extension if not exists pgcrypto;

-- Profil: Programm und Startdatum, Sprache. Eine Zeile pro Nutzer.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  program_id text,
  program_start date,
  locale text not null default 'de',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Einwilligungen (Art. 9 DSGVO): pro ID Fassung, Erteilung, Widerruf. IDs aus content/rechtliches: gesundheitsdaten,
-- foto-auswertung, nutzungsstatistik; dazu age18. Erteilung = neue Zeile, Widerruf = revoked_at setzen.
create table public.consents (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_id text not null,
  text_version text not null,
  granted_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index consents_user_idx on public.consents (user_id, consent_id);

-- Wöchentliche Check-ins. photo_path zeigt in den privaten Bucket "checkins" (Pfad <user_id>/<checkin_id>.jpg).
create table public.checkins (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  week_index integer not null,
  weight_kg numeric(5,2) check (weight_kg is null or (weight_kg >= 20 and weight_kg <= 400)),
  grip_kg numeric(5,2) check (grip_kg is null or (grip_kg >= 0 and grip_kg <= 150)),
  grip_hand text check (grip_hand is null or grip_hand in ('links', 'rechts')),
  waist_cm numeric(5,1) check (waist_cm is null or (waist_cm >= 30 and waist_cm <= 250)),
  note text,
  photo_path text,
  photo_width integer,
  photo_height integer,
  duration_s integer,
  extra jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);
create index checkins_user_updated_idx on public.checkins (user_id, updated_at);
create index checkins_user_date_idx on public.checkins (user_id, date);

-- Foto-Schätzung (Beta). Schreibt nur die Edge Function mit Service-Role; Nutzer lesen ihre eigenen Zeilen.
-- raw enthält die strukturierte Modellantwort für den späteren Abgleich mit einer Bioimpedanzwaage (Entscheidung 3).
create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  provider text not null,
  model text,
  body_fat_low numeric(4,1),
  body_fat_high numeric(4,1),
  body_fat_mid numeric(4,1),
  lean_mass_low_kg numeric(5,1),
  lean_mass_high_kg numeric(5,1),
  confidence numeric(3,2),
  consistency numeric(3,2),
  accepted boolean not null default true,
  notes jsonb,
  raw jsonb,
  created_at timestamptz not null default now()
);
create index estimates_user_idx on public.estimates (user_id, checkin_id);

-- Programmfortschritt: eine Zeile pro Aufgabe und Nutzer.
create table public.program_progress (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id text not null,
  week_index integer not null,
  task_id text not null,
  done boolean not null default false,
  done_at timestamptz,
  updated_at timestamptz not null,
  unique (user_id, program_id, task_id)
);
create index program_progress_user_updated_idx on public.program_progress (user_id, updated_at);

-- Programmspezifische Einstellungen (z. B. ein Datum, das nur ein Programm braucht). Nie im Kernmodell.
create table public.program_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id text not null,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  primary key (user_id, program_id)
);

-- Row Level Security: jeder Nutzer nur eigene Zeilen.
alter table public.profiles enable row level security;
alter table public.consents enable row level security;
alter table public.checkins enable row level security;
alter table public.estimates enable row level security;
alter table public.program_progress enable row level security;
alter table public.program_settings enable row level security;

create policy "profiles: eigene Zeile" on public.profiles
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "consents: eigene lesen" on public.consents
  for select to authenticated using (auth.uid() = user_id);
create policy "consents: eigene anlegen" on public.consents
  for insert to authenticated with check (auth.uid() = user_id);
create policy "consents: eigenen Widerruf nachtragen" on public.consents
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "checkins: eigene Zeilen" on public.checkins
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Schätzungen: Nutzer lesen und löschen (Widerruf), nur die Edge Function (Service-Role) schreibt.
create policy "estimates: eigene lesen" on public.estimates
  for select to authenticated using (auth.uid() = user_id);
create policy "estimates: eigene löschen" on public.estimates
  for delete to authenticated using (auth.uid() = user_id);

create policy "progress: eigene Zeilen" on public.program_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "program_settings: eigene Zeilen" on public.program_settings
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Privater Bucket für Fotos. Zugriff nur auf den eigenen Ordner (<user_id>/...), Abruf per signierter URL (10 Minuten).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('checkins', 'checkins', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "checkins-bucket: eigene lesen" on storage.objects
  for select to authenticated
  using (bucket_id = 'checkins' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "checkins-bucket: eigene hochladen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'checkins' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "checkins-bucket: eigene ersetzen" on storage.objects
  for update to authenticated
  using (bucket_id = 'checkins' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "checkins-bucket: eigene löschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'checkins' and (storage.foldername(name))[1] = auth.uid()::text);
