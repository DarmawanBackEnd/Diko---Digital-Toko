-- Kasir Pintar — Row Level Security Policies
-- Semua tabel dilindungi RLS berdasarkan merchant_id
-- Pengguna hanya bisa akses data merchant mereka sendiri

-- Aktifkan RLS untuk semua tabel
alter table merchant enable row level security;
alter table device enable row level security;
alter table pengguna enable row level security;
alter table kategori enable row level security;
alter table produk enable row level security;
alter table varian enable row level security;
alter table shift enable row level security;
alter table transaksi enable row level security;
alter table transaksi_item enable row level security;
alter table pergerakan_stok enable row level security;

-- === Policy Helper ===
-- Merchant ID diambil dari JWT claim yang di-set saat login
-- Format: auth.jwt() ->> 'merchant_id'

-- === Merchant ===
create policy "merchant_select" on merchant
  for select using (id = (auth.jwt() ->> 'merchant_id')::uuid);

-- === Device ===
create policy "device_select" on device
  for select using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "device_insert" on device
  for insert with check (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "device_update" on device
  for update using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

-- === Pengguna ===
create policy "pengguna_select" on pengguna
  for select using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "pengguna_insert" on pengguna
  for insert with check (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "pengguna_update" on pengguna
  for update using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

-- === Kategori ===
create policy "kategori_select" on kategori
  for select using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "kategori_insert" on kategori
  for insert with check (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "kategori_update" on kategori
  for update using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

-- === Produk ===
create policy "produk_select" on produk
  for select using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "produk_insert" on produk
  for insert with check (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "produk_update" on produk
  for update using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

-- === Varian (akses via produk.merchant_id) ===
create policy "varian_select" on varian
  for select using (
    exists (
      select 1 from produk
      where produk.id = varian.produk_id
      and produk.merchant_id = (auth.jwt() ->> 'merchant_id')::uuid
    )
  );

create policy "varian_insert" on varian
  for insert with check (
    exists (
      select 1 from produk
      where produk.id = varian.produk_id
      and produk.merchant_id = (auth.jwt() ->> 'merchant_id')::uuid
    )
  );

create policy "varian_update" on varian
  for update using (
    exists (
      select 1 from produk
      where produk.id = varian.produk_id
      and produk.merchant_id = (auth.jwt() ->> 'merchant_id')::uuid
    )
  );

-- === Shift ===
create policy "shift_select" on shift
  for select using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "shift_insert" on shift
  for insert with check (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "shift_update" on shift
  for update using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

-- === Transaksi ===
-- Insert menggunakan ON CONFLICT DO NOTHING untuk idempotensi (§4.3)
create policy "transaksi_select" on transaksi
  for select using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "transaksi_insert" on transaksi
  for insert with check (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "transaksi_update" on transaksi
  for update using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

-- === Transaksi Item (akses via transaksi.merchant_id) ===
create policy "transaksi_item_select" on transaksi_item
  for select using (
    exists (
      select 1 from transaksi
      where transaksi.id = transaksi_item.transaksi_id
      and transaksi.merchant_id = (auth.jwt() ->> 'merchant_id')::uuid
    )
  );

create policy "transaksi_item_insert" on transaksi_item
  for insert with check (
    exists (
      select 1 from transaksi
      where transaksi.id = transaksi_item.transaksi_id
      and transaksi.merchant_id = (auth.jwt() ->> 'merchant_id')::uuid
    )
  );

-- === Pergerakan Stok ===
create policy "pergerakan_stok_select" on pergerakan_stok
  for select using (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);

create policy "pergerakan_stok_insert" on pergerakan_stok
  for insert with check (merchant_id = (auth.jwt() ->> 'merchant_id')::uuid);
