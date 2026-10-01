import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

/** Client mit dem JWT des Aufrufers (RLS gilt) und Admin-Client mit Service-Role (nur serverseitig). */
export function clients(req: Request): { user: SupabaseClient; admin: SupabaseClient } {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = req.headers.get('Authorization') ?? '';
  const user = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  return { user, admin };
}

export async function requireUser(client: SupabaseClient): Promise<User | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
