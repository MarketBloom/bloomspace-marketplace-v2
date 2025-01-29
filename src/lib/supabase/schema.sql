-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Create enum types
create type order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'ready_for_pickup',
  'picked_up',
  'cancelled'
);

create type delivery_type as enum (
  'delivery',
  'pickup'
);

-- Create tables
create table public.florists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  email text not null,
  phone text not null,
  logo_url text,
  banner_url text,
  address jsonb not null,
  delivery_zones geometry(Polygon, 4326)[],
  minimum_order decimal(10,2) default 0,
  delivery_fee decimal(10,2) default 0,
  service_fee_percentage decimal(4,2) default 5.00,
  is_verified boolean default false,
  is_active boolean default true,
  operating_hours jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint florists_user_id_key unique (user_id)
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  florist_id uuid references public.florists not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  sale_price decimal(10,2),
  images text[] not null,
  category text not null,
  tags text[],
  inventory_level integer not null default 0,
  min_inventory_level integer not null default 0,
  is_available boolean default true,
  customization_options jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  florist_id uuid references public.florists not null,
  customer_id uuid references auth.users not null,
  status order_status not null default 'pending',
  delivery_type delivery_type not null,
  delivery_address jsonb,
  delivery_instructions text,
  delivery_date date,
  delivery_time_slot text,
  recipient_name text not null,
  recipient_phone text not null,
  gift_message text,
  subtotal decimal(10,2) not null,
  delivery_fee decimal(10,2) not null,
  service_fee decimal(10,2) not null,
  total decimal(10,2) not null,
  notes text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders not null,
  product_id uuid references public.products not null,
  quantity integer not null,
  price decimal(10,2) not null,
  customizations jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders not null,
  status order_status not null,
  notes text,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index florists_user_id_idx on public.florists(user_id);
create index products_florist_id_idx on public.products(florist_id);
create index orders_florist_id_idx on public.orders(florist_id);
create index orders_customer_id_idx on public.orders(customer_id);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);
create index order_status_history_order_id_idx on public.order_status_history(order_id);

-- Create functions
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger set_updated_at
  before update on public.florists
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.orders
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.order_items
  for each row
  execute function public.handle_updated_at();

-- Row Level Security (RLS) policies
alter table public.florists enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- Florists policies
create policy "Florists are viewable by everyone"
  on public.florists for select
  using (true);

create policy "Florists can be created by authenticated users"
  on public.florists for insert
  with check (auth.uid() = user_id);

create policy "Florists can be updated by the owner"
  on public.florists for update
  using (auth.uid() = user_id);

-- Products policies
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

create policy "Products can be created by the florist"
  on public.products for insert
  with check (
    auth.uid() in (
      select user_id from public.florists where id = florist_id
    )
  );

create policy "Products can be updated by the florist"
  on public.products for update
  using (
    auth.uid() in (
      select user_id from public.florists where id = florist_id
    )
  );

-- Orders policies
create policy "Orders are viewable by the customer or florist"
  on public.orders for select
  using (
    auth.uid() = customer_id or
    auth.uid() in (
      select user_id from public.florists where id = florist_id
    )
  );

create policy "Orders can be created by authenticated users"
  on public.orders for insert
  with check (auth.uid() = customer_id);

create policy "Orders can be updated by the florist"
  on public.orders for update
  using (
    auth.uid() in (
      select user_id from public.florists where id = florist_id
    )
  );

-- Order items policies
create policy "Order items are viewable by the customer or florist"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and (
        customer_id = auth.uid() or
        florist_id in (
          select id from public.florists where user_id = auth.uid()
        )
      )
    )
  );

-- Order status history policies
create policy "Order status history is viewable by the customer or florist"
  on public.order_status_history for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and (
        customer_id = auth.uid() or
        florist_id in (
          select id from public.florists where user_id = auth.uid()
        )
      )
    )
  );

create policy "Order status history can be created by the florist"
  on public.order_status_history for insert
  with check (
    auth.uid() in (
      select user_id from public.florists
      where id = (
        select florist_id from public.orders where id = order_id
      )
    )
  ); 