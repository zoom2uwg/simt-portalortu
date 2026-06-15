# 06 — Panduan Environment Variables

Aplikasi **SIMT Portal Ortu** menggunakan variabel environment (`.env`) untuk mengontrol database, penyimpanan file, dan integrasi dengan ekosistem luar seperti WhatsApp Gateway. Dokumen ini adalah panduan lengkap untuk melakukan konfigurasi.

---

## 1. Daftar Variabel Environment

Berikut adalah daftar variabel environment yang digunakan beserta kegunaannya:

| Nama Variabel | Tipe | Default / Opsi | Wajib? | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **`DATABASE_PROVIDER`** | String | `postgresql` \| `mysql` \| `sqlite` | **Ya** | Menentukan driver database ORM Prisma. |
| **`DATABASE_URL`** | String | - | **Ya** | Connection string database cloud utama. |
| **`DATABASE_DIRECT_URL`** | String | - | Opsional | Direct URL database (tanpa pooler) khusus NeonDB. |
| **`STORAGE_PROVIDER`** | String | `imagekit` \| `cloudinary` | **Ya** | Memilih cloud storage provider aktif untuk upload. |
| **`IMAGEKIT_PUBLIC_KEY`** | String | - | Bersyarat | Public API Key dari dashboard ImageKit. |
| **`IMAGEKIT_PRIVATE_KEY`**| String | - | Bersyarat | Private API Key dari dashboard ImageKit. |
| **`IMAGEKIT_URL_ENDPOINT`**| String | - | Bersyarat | URL Endpoint ImageKit Anda (cth: `https://ik.imagekit.io/xxx`). |
| **`CLOUDINARY_CLOUD_NAME`**| String | - | Bersyarat | Cloud Name dari dashboard Cloudinary. |
| **`CLOUDINARY_API_KEY`** | String | - | Bersyarat | API Key Cloudinary. |
| **`CLOUDINARY_API_SECRET`**| String | - | Bersyarat | API Secret Cloudinary. |
| **`WA_SERVICE_URL`** | String | - | **Ya** | URL endpoint REST API dari `simt-wa-gateway`. |
| **`WA_SERVICE_SECRET`** | String | - | **Ya** | Token rahasia pengaman HTTP request ke WA Gateway. |

---

## 2. Cara Setup Koneksi Database

### A. NeonDB (PostgreSQL - Serverless)
NeonDB menggunakan connection pooling (PgBouncer) secara default untuk menghemat koneksi pada runtime serverless.
1. Pada dashboard Neon, pilih database Anda.
2. Di bagian **Connection Details**, pilih mode **Pooled** untuk `DATABASE_URL`.
   * Contoh: `postgres://[user]:[password]@[hostname]-pooler.neon.tech/[dbname]?sslmode=require`
3. Pilih mode **Direct** (tidak di-pool) untuk `DATABASE_DIRECT_URL`. Ini digunakan Prisma untuk melakukan migrasi skema (`prisma db push`).
   * Contoh: `postgres://[user]:[password]@[hostname].neon.tech/[dbname]?sslmode=require`

### B. Supabase (PostgreSQL)
Supabase tidak mewajibkan pemisahan pooled/direct URL jika menggunakan direct connection biasa di port `5432` atau jika migrasi dilakukan lewat CLI internal mereka.
1. Buka dashboard Supabase -> Project Settings -> Database.
2. Salin connection string **URI** (pilih mode Node.js atau standard PostgreSQL).
3. Set `DATABASE_PROVIDER="postgresql"`.
4. Isi `DATABASE_URL` dengan connection string tersebut.
5. Set `DATABASE_DIRECT_URL` dengan nilai yang sama dengan `DATABASE_URL` (Supabase mengizinkan ini).

### C. Aiven (MySQL)
Jika Anda menggunakan MySQL dari Aiven:
1. Buka console Aiven -> pilih service MySQL -> salin connection URI.
2. Contoh format: `mysql://[user]:[password]@[hostname]:[port]/[dbname]?ssl-mode=REQUIRED`
3. Set `DATABASE_PROVIDER="mysql"`.
4. Isi `DATABASE_URL` dengan connection URI tersebut.
5. `DATABASE_DIRECT_URL` boleh dikosongkan atau disamakan dengan `DATABASE_URL`.

---

## 3. Cara Setup Cloud File Storage

### A. ImageKit Setup
Jika Anda mengaktifkan `STORAGE_PROVIDER="imagekit"`:
1. Daftar di [imagekit.io](https://imagekit.io/).
2. Buka menu **Developer Options** di dashboard kiri bawah.
3. Salin:
   - **Public Key** ke `IMAGEKIT_PUBLIC_KEY`
   - **Private Key** ke `IMAGEKIT_PRIVATE_KEY`
   - **URL Endpoint** ke `IMAGEKIT_URL_ENDPOINT`

### B. Cloudinary Setup
Jika Anda mengaktifkan `STORAGE_PROVIDER="cloudinary"`:
1. Daftar di [cloudinary.com](https://cloudinary.com/).
2. Salin kredensial berikut dari halaman utama Dashboard/Console:
   - **Cloud Name** ke `CLOUDINARY_CLOUD_NAME`
   - **API Key** ke `CLOUDINARY_API_KEY`
   - **API Secret** ke `CLOUDINARY_API_SECRET`

---

## 4. Cara Setup WhatsApp Gateway

WhatsApp Gateway berjalan sebagai service Node.js terpisah (`simt-wa-gateway`).
1. Tentukan URL production WA gateway Anda (misalnya di Railway/VPS).
2. Set `WA_SERVICE_URL` ke alamat tersebut (cth: `https://wa-gateway-production.up.railway.app`).
3. Buat string acak dan aman sebagai secret token pengaman (misalnya UUID v4).
4. Set token tersebut ke `WA_SERVICE_SECRET` di kedua aplikasi (`simt-portalortu` dan `simt-wa-gateway`).
5. Setiap request API dari Next.js ke WA Gateway akan menyertakan header `X-Service-Secret: [WA_SERVICE_SECRET]` untuk verifikasi keamanan.

---

## 5. Template `.env.example` Lengkap

Salin kode di bawah ini menjadi `.env` di direktori root project, lalu isi nilainya:

```env
# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
# Opsi provider: "sqlite" | "postgresql" | "mysql"
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

# Diperlukan untuk NeonDB pooled connection (kosongkan jika sqlite/mysql/supabase)
DATABASE_DIRECT_URL=""

# ==============================================================================
# CLOUD STORAGE CONFIGURATION
# ==============================================================================
# Opsi provider: "imagekit" | "cloudinary"
STORAGE_PROVIDER="imagekit"

# ImageKit Credentials (Isi jika STORAGE_PROVIDER="imagekit")
IMAGEKIT_PUBLIC_KEY=""
IMAGEKIT_PRIVATE_KEY=""
IMAGEKIT_URL_ENDPOINT=""

# Cloudinary Credentials (Isi jika STORAGE_PROVIDER="cloudinary")
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# ==============================================================================
# EXTERNAL INTEGRATION: WHATSAPP GATEWAY
# ==============================================================================
# Endpoint API WhatsApp Gateway Node.js (cth: http://localhost:8000 atau Railway url)
WA_SERVICE_URL="http://localhost:8000"
WA_SERVICE_SECRET="ganti_dengan_token_rahasia_yang_sangat_panjang"
```

---
*Last updated: 2026-06-15*
