// ATENÇÃO: este arquivo só pode ser importado em código que roda no SERVIDOR
// (rotas dentro de app/api/..., nunca em componentes 'use client').
// Ele usa a Service Role Key, que ignora as regras de RLS do Supabase.
 
import { createClient } from '@supabase/supabase-js';
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
 
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Variáveis de ambiente ausentes: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY'
  );
}
 
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
