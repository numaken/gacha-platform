-- ガチャプラットフォーム DB スキーマ
-- Supabase (PostgreSQL)

-- ユーザープロフィール（Supabase Auth連携）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  phone text,
  postal_code text,
  prefecture text,
  city text,
  address text,
  building text,
  point_balance int not null default 0,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ポイントパッケージ（購入可能なポイント商品）
create table public.point_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points int not null,
  price int not null, -- JPY
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ポイント取引履歴
create table public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null, -- 正=購入, 負=消費
  type text not null check (type in ('purchase', 'gacha', 'refund', 'admin_adjust', 'expire')),
  description text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

-- ガチャ定義
create table public.gachas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price int not null, -- ポイント
  type text not null default 'normal' check (type in ('normal', 'daily', 'infinite')),
  image_url text,
  is_active boolean not null default true,
  total_count int, -- 総数（nullなら無制限）
  remaining_count int, -- 残数
  daily_limit int, -- デイリー制限
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 景品定義
create table public.prizes (
  id uuid primary key default gen_random_uuid(),
  gacha_id uuid not null references public.gachas(id) on delete cascade,
  name text not null,
  description text,
  rank text not null check (rank in ('S', 'A', 'B', 'C', 'last_one')),
  image_url text,
  probability numeric(5,2) not null, -- パーセント
  stock int not null default 0,
  initial_stock int not null default 0,
  is_last_one boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ガチャ結果
create table public.gacha_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  gacha_id uuid not null references public.gachas(id) on delete cascade,
  prize_id uuid not null references public.prizes(id) on delete cascade,
  points_spent int not null,
  status text not null default 'won' check (status in ('won', 'shipped', 'delivered')),
  created_at timestamptz not null default now()
);

-- 発送依頼
create table public.shipping_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered')),
  tracking_number text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 発送依頼アイテム（どの景品を発送するか）
create table public.shipping_request_items (
  id uuid primary key default gen_random_uuid(),
  shipping_request_id uuid not null references public.shipping_requests(id) on delete cascade,
  gacha_result_id uuid not null references public.gacha_results(id) on delete cascade
);

-- 注文（ポイント購入のStripe決済記録）
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  point_package_id uuid references public.point_packages(id),
  amount int not null, -- JPY
  points int not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- インデックス
create index idx_point_transactions_user on public.point_transactions(user_id);
create index idx_gacha_results_user on public.gacha_results(user_id);
create index idx_gacha_results_gacha on public.gacha_results(gacha_id);
create index idx_prizes_gacha on public.prizes(gacha_id);
create index idx_shipping_requests_user on public.shipping_requests(user_id);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_stripe on public.orders(stripe_payment_intent_id);

-- RLS ポリシー
alter table public.profiles enable row level security;
alter table public.point_packages enable row level security;
alter table public.point_transactions enable row level security;
alter table public.gachas enable row level security;
alter table public.prizes enable row level security;
alter table public.gacha_results enable row level security;
alter table public.shipping_requests enable row level security;
alter table public.shipping_request_items enable row level security;
alter table public.orders enable row level security;

-- profiles: 自分のデータのみ読み書き
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admin can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- point_packages: 全員読み取り可
create policy "Anyone can view active packages" on public.point_packages for select using (is_active = true);
create policy "Admin can manage packages" on public.point_packages for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- gachas: 全員読み取り可
create policy "Anyone can view active gachas" on public.gachas for select using (is_active = true);
create policy "Admin can manage gachas" on public.gachas for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- prizes: 全員読み取り可
create policy "Anyone can view prizes" on public.prizes for select using (true);
create policy "Admin can manage prizes" on public.prizes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- point_transactions: 自分のデータのみ
create policy "Users can view own transactions" on public.point_transactions for select using (auth.uid() = user_id);

-- gacha_results: 自分のデータのみ
create policy "Users can view own results" on public.gacha_results for select using (auth.uid() = user_id);

-- shipping_requests: 自分のデータのみ
create policy "Users can view own shipping" on public.shipping_requests for select using (auth.uid() = user_id);
create policy "Users can create shipping" on public.shipping_requests for insert with check (auth.uid() = user_id);

-- shipping_request_items: 発送依頼の所有者のみ
create policy "Users can view own shipping items" on public.shipping_request_items for select using (
  exists (select 1 from public.shipping_requests where id = shipping_request_id and user_id = auth.uid())
);
create policy "Users can create shipping items" on public.shipping_request_items for insert with check (
  exists (select 1 from public.shipping_requests where id = shipping_request_id and user_id = auth.uid())
);

-- orders: 自分のデータのみ
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);

-- 新規ユーザー登録時にプロフィール自動作成
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ポイント操作関数
create or replace function public.add_points(p_user_id uuid, p_amount int)
returns void as $$
begin
  update public.profiles
  set point_balance = point_balance + p_amount, updated_at = now()
  where id = p_user_id;
end;
$$ language plpgsql security definer;

create or replace function public.consume_points(p_user_id uuid, p_amount int)
returns void as $$
begin
  update public.profiles
  set point_balance = point_balance - p_amount, updated_at = now()
  where id = p_user_id and point_balance >= p_amount;

  if not found then
    raise exception 'Insufficient points';
  end if;
end;
$$ language plpgsql security definer;

-- === ALTER TABLE: 追加カラム ===

-- gachas: 天井機能
ALTER TABLE public.gachas ADD COLUMN IF NOT EXISTS pity_count int;
ALTER TABLE public.gachas ADD COLUMN IF NOT EXISTS pity_rank text;

-- gachas: 課金者限定排出
ALTER TABLE public.gachas ADD COLUMN IF NOT EXISTS min_total_spent int;

-- gachas: 販売期間設定
ALTER TABLE public.gachas ADD COLUMN IF NOT EXISTS sale_start_at timestamptz;
ALTER TABLE public.gachas ADD COLUMN IF NOT EXISTS sale_end_at timestamptz;

-- prizes: ポイント交換
ALTER TABLE public.prizes ADD COLUMN IF NOT EXISTS exchange_points int;

-- prizes: 一人一回限定排出
ALTER TABLE public.prizes ADD COLUMN IF NOT EXISTS once_per_user boolean NOT NULL DEFAULT false;

-- gacha_results: exchangedステータス追加
ALTER TABLE public.gacha_results DROP CONSTRAINT IF EXISTS gacha_results_status_check;
ALTER TABLE public.gacha_results ADD CONSTRAINT gacha_results_status_check
  CHECK (status IN ('won', 'shipped', 'delivered', 'exchanged'));

-- point_transactions: exchangeタイプ追加
ALTER TABLE public.point_transactions DROP CONSTRAINT IF EXISTS point_transactions_type_check;
ALTER TABLE public.point_transactions ADD CONSTRAINT point_transactions_type_check
  CHECK (type IN ('purchase', 'gacha', 'refund', 'admin_adjust', 'expire', 'exchange'));

-- ポイントパッケージ初期データ
insert into public.point_packages (name, points, price, sort_order) values
  ('500 PT', 500, 500, 1),
  ('1,000 PT', 1000, 1000, 2),
  ('5,000 PT', 5000, 5000, 3),
  ('10,000 PT', 10000, 10000, 4),
  ('50,000 PT', 50000, 50000, 5),
  ('100,000 PT', 100000, 100000, 6),
  ('200,000 PT', 200000, 200000, 7),
  ('500,000 PT', 500000, 500000, 8);
