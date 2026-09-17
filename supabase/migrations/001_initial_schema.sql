-- Kasir Pintar — Skema Database Initial (§5.1)
-- Semua ID menggunakan UUID (dihasilkan di client sebagai UUIDv7)
-- Uang disimpan sebagai BIGINT dalam satuan rupiah penuh

-- === Tabel Merchant ===
create table merchant (
  id            uuid primary key,
  nama          text not null,
  alamat        text,
  created_at    timestamptz not null default now()
);

-- === Tabel Device ===
create table device (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  kode          text not null,              -- 'K1', 'K2'
  nama          text not null,
  last_sync_at  timestamptz,
  unique (merchant_id, kode)
);

-- === Tabel Pengguna ===
create table pengguna (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  nama          text not null,
  pin_hash      text not null,
  peran         text not null,              -- 'owner' | 'kasir'
  aktif         boolean not null default true
);

-- === Tabel Kategori ===
create table kategori (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  nama          text not null,
  urutan        int not null default 0,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- === Tabel Produk ===
create table produk (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  kategori_id   uuid references kategori(id),
  nama          text not null,
  sku           text,
  harga         bigint not null,            -- RUPIAH, INTEGER. Bukan float/desimal.
  lacak_stok    boolean not null default false,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- === Tabel Varian ===
create table varian (
  id            uuid primary key,
  produk_id     uuid not null references produk(id),
  nama          text not null,              -- 'Panas', 'Dingin', 'L'
  selisih_harga bigint not null default 0,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- === Tabel Shift ===
create table shift (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  device_id     uuid not null references device(id),
  pengguna_id   uuid not null references pengguna(id),
  dibuka_pada   timestamptz not null,
  ditutup_pada  timestamptz,
  kas_awal      bigint not null,
  kas_akhir     bigint,                     -- Hasil hitung fisik
  selisih       bigint                      -- kas_akhir - ekspektasi
);

-- === Tabel Transaksi ===
create table transaksi (
  id                uuid primary key,       -- UUIDv7 dari client
  merchant_id       uuid not null references merchant(id),
  device_id         uuid not null references device(id),
  shift_id          uuid not null references shift(id),
  pengguna_id       uuid not null references pengguna(id),
  nomor_struk       text not null,          -- 'K1-000123'
  subtotal          bigint not null,
  diskon            bigint not null default 0,
  total             bigint not null,
  metode_bayar      text not null,          -- 'tunai' | 'qris'
  dibayar           bigint not null,
  kembalian         bigint not null default 0,
  status            text not null default 'selesai',  -- 'selesai' | 'void'
  waktu_client      timestamptz not null,   -- Jam perangkat kasir
  waktu_server      timestamptz not null default now(),
  unique (device_id, nomor_struk)
);

-- === Tabel Transaksi Item ===
create table transaksi_item (
  id            uuid primary key,
  transaksi_id  uuid not null references transaksi(id) on delete cascade,
  produk_id     uuid not null,
  varian_id     uuid,
  nama_produk   text not null,              -- SNAPSHOT nama saat transaksi
  harga_satuan  bigint not null,            -- SNAPSHOT harga saat transaksi
  qty           int not null,
  diskon        bigint not null default 0,
  subtotal      bigint not null
);

-- === Tabel Pergerakan Stok ===
-- Disiapkan untuk fase 2, sudah aktif di MVP untuk produk ber-lacak_stok
create table pergerakan_stok (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  produk_id     uuid not null references produk(id),
  varian_id     uuid,
  qty           int not null,               -- Negatif = keluar
  tipe          text not null,              -- 'penjualan' | 'penyesuaian' | 'awal'
  ref_id        uuid,                       -- transaksi_id bila tipe penjualan
  waktu_client  timestamptz not null,
  waktu_server  timestamptz not null default now()
);

-- === Indeks untuk Performa ===
create index idx_produk_merchant on produk(merchant_id) where deleted_at is null;
create index idx_produk_kategori on produk(kategori_id) where deleted_at is null;
create index idx_kategori_merchant on kategori(merchant_id) where deleted_at is null;
create index idx_transaksi_merchant on transaksi(merchant_id);
create index idx_transaksi_device on transaksi(device_id);
create index idx_transaksi_shift on transaksi(shift_id);
create index idx_transaksi_waktu on transaksi(waktu_client);
create index idx_transaksi_item_transaksi on transaksi_item(transaksi_id);
create index idx_pergerakan_produk on pergerakan_stok(produk_id);
create index idx_shift_merchant on shift(merchant_id);

-- === Indeks untuk Sync Pull (master data inkremental) ===
create index idx_produk_updated on produk(updated_at);
create index idx_kategori_updated on kategori(updated_at);
create index idx_varian_updated on varian(updated_at);
