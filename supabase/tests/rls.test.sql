-- pgTAP-Tests für Row Level Security (docs/REVIEW.md R5): Nutzer B sieht keine Zeilen von Nutzer A.
-- Ausführen mit der Supabase-CLI: `supabase test db` (lokale Instanz nötig). Noch nicht gegen ein Projekt gelaufen.
begin;
select plan(12);

-- Zwei Testnutzer
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local');

-- Daten von A anlegen (als Service-Role, umgeht RLS)
insert into public.profiles (user_id, program_id, program_start) values ('00000000-0000-0000-0000-00000000000a', 'grundprogramm', '2026-10-01');
insert into public.consents (id, user_id, consent_id, text_version, granted_at) values (gen_random_uuid(), '00000000-0000-0000-0000-00000000000a', 'gesundheitsdaten', '0.1', now());
insert into public.checkins (id, user_id, date, week_index, weight_kg, created_at, updated_at) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', '2026-10-01', 0, 80, now(), now());
insert into public.estimates (user_id, checkin_id, provider, body_fat_low, body_fat_high) values ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001', 'mock', 20, 26);
insert into public.program_progress (id, user_id, program_id, week_index, task_id, done, updated_at) values (gen_random_uuid(), '00000000-0000-0000-0000-00000000000a', 'grundprogramm', 0, 'w00-messen', true, now());
insert into public.program_settings (user_id, program_id, settings, updated_at) values ('00000000-0000-0000-0000-00000000000a', 'grundprogramm', '{}'::jsonb, now());

-- Als Nutzer B
set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select is((select count(*) from public.profiles), 0::bigint, 'B sieht keine Profile von A');
select is((select count(*) from public.consents), 0::bigint, 'B sieht keine Einwilligungen von A');
select is((select count(*) from public.checkins), 0::bigint, 'B sieht keine Check-ins von A');
select is((select count(*) from public.estimates), 0::bigint, 'B sieht keine Schätzungen von A');
select is((select count(*) from public.program_progress), 0::bigint, 'B sieht keinen Fortschritt von A');
select is((select count(*) from public.program_settings), 0::bigint, 'B sieht keine Programmeinstellungen von A');

-- B kann keine Zeilen für A anlegen
select throws_ok($$ insert into public.checkins (id, user_id, date, week_index, created_at, updated_at) values (gen_random_uuid(), '00000000-0000-0000-0000-00000000000a', '2026-10-02', 0, now(), now()) $$, '42501', null, 'B kann keinen Check-in für A anlegen');
select throws_ok($$ insert into public.estimates (user_id, checkin_id, provider) values ('00000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000001', 'mock') $$, '42501', null, 'Nutzer können keine Schätzungen schreiben');

-- Als Nutzer A: eigene Zeilen sichtbar
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
select is((select count(*) from public.checkins), 1::bigint, 'A sieht den eigenen Check-in');
select is((select count(*) from public.estimates), 1::bigint, 'A sieht die eigene Schätzung');
select lives_ok($$ delete from public.estimates $$, 'A darf eigene Schätzungen löschen (Widerruf)');
select is((select count(*) from public.estimates), 0::bigint, 'Schätzungen von A sind gelöscht');

select * from finish();
rollback;
