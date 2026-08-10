create table public.orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  total numeric(10,2) not null,
  item_count integer not null,
  customer_name text,
  customer_email text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Anyone (including anonymous shoppers) can place an order
create policy "Anyone can create orders"
on public.orders for insert
to anon, authenticated
with check (true);

-- For this simple demo, allow anyone to read orders so the admin page works.
-- In production this should be restricted to an admin role.
create policy "Anyone can view orders"
on public.orders for select
to anon, authenticated
using (true);