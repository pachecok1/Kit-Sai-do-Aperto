-- Rode este script no Supabase: menu lateral "SQL Editor" > "New query" > colar > Run

create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  tipo text not null check (tipo in ('receita','despesa')),
  valor numeric not null check (valor > 0),
  categoria text,
  descricao text,
  data timestamptz not null default now()
);

-- Liga a segurança por linha: sem isso, um usuário poderia ver dados de outro
alter table transactions enable row level security;

create policy "Usuarios veem so suas transacoes"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Usuarios inserem so suas transacoes"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Usuarios deletam so suas transacoes"
  on transactions for delete
  using (auth.uid() = user_id);
