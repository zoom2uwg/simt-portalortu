# 05 — Rencana Migrasi: SQLite ke Cloud Services

Dokumen ini menjelaskan rencana langkah-demi-langkah untuk memindahkan aplikasi **SIMT Portal Ortu** dari lingkungan lokal (SQLite & Local Storage) ke lingkungan produksi cloud (Cloud DB & Cloud Storage).

---

## 1. Strategi Migrasi Database

Aplikasi mendukung tiga provider database cloud utama. Pemilihan database dilakukan sepenuhnya melalui variabel environment pada `.env`.

### Opsi Provider Database

| Provider | Tipe DB | Karakteristik | Kasus Penggunaan Terbaik |
| :--- | :--- | :--- | :--- |
| **NeonDB** | PostgreSQL | Serverless, autoscaling, connection pooling bawaan via PgBouncer | Rekomendasi utama untuk deploy di Vercel (Edge-friendly) |
| **Supabase** | PostgreSQL | Serverless, kaya fitur, memiliki dashboard GUI yang sangat baik | Pilihan seimbang untuk database dan ekosistem Postgres |
| **Aiven** | MySQL | Dedicated/Shared VM, stabil, MySQL native | Cocok jika ekosistem SIMT lainnya (Laravel) menggunakan MySQL |

---

## 2. Alur Kerja Migrasi Database

Ikuti langkah-langkah berikut secara berurutan untuk memindahkan skema dan data dari SQLite lokal ke Cloud DB.

### Langkah 2.1: Pembuatan Database Cloud
1. Registrasi/Login ke provider pilihan Anda (Neon, Supabase, atau Aiven).
2. Buat project/database baru (misalnya: `simt_portalortu`).
3. Dapatkan **Connection String** (URL Database).
   - *NeonDB*: Dapatkan pooled connection string (biasanya port `5432` dengan `?pgcharger` atau pgbouncer mode) dan direct connection string.
   - *Supabase*: Dapatkan URL database transaksional (port `5432` atau `6543`).
   - *Aiven*: Dapatkan URL MySQL standard.

### Langkah 2.2: Konfigurasi Environment `.env`
Perbarui file `.env` di server/aplikasi Anda:
```env
DATABASE_PROVIDER="postgresql" # atau "mysql"
DATABASE_URL="postgresql://user:password@hostname:port/dbname?sslmode=require"
DATABASE_DIRECT_URL="postgresql://user:password@hostname:directport/dbname?sslmode=require" # Khusus NeonDB pgbouncer
```

### Langkah 2.3: Push Skema ke Cloud DB
Jalankan perintah berikut untuk membuat tabel dan indeks pada database cloud baru:
```bash
# Generate Prisma Client terlebih dahulu
npx prisma generate

# Dorong skema database ke cloud DB tanpa membuat file migrasi baru
npx prisma db push
```

### Langkah 2.4: Seed Data Awal (Opsional)
Jika Anda ingin mengisi database cloud dengan data demo awal dari `prisma/seed.ts`, jalankan perintah seed:
```bash
# Jalankan database seed
npx prisma db seed
```
> [!WARNING]
> Seed data akan menghapus/menimpa data jika ada konflik ID unik. Lakukan ini hanya pada database baru yang masih kosong.

---

## 3. Strategi Migrasi File Storage

Saat ini aplikasi belum memiliki fitur upload gambar. Foto siswa, logo sekolah, dan sertifikat prestasi disimpan sebagai path lokal statis atau URL eksternal dummy.

### Opsi Provider Cloud Storage

Aplikasi akan mendukung dual-provider upload via API Route `/api/upload` yang dapat dipilih lewat `.env`:

1. **ImageKit**
   - **Kelebihan**: Sangat cepat, integrasi transformasi gambar mudah, gratis 20GB/bulan.
   - **NPM Package**: `@imagekit/nodejs` (sudah terinstal).
2. **Cloudinary**
   - **Kelebihan**: Standar industri untuk optimasi media, gratis 25GB/bulan.
   - **NPM Package**: `cloudinary` (sudah terinstal).

### Struktur Integrasi Storage Adapter
Akan dibuat adapter pattern pada `src/lib/storage.ts` yang mengekspos fungsi terpadu `uploadFileToCloud(fileBuffer, filename, folder)`:

```
[Upload Request] ──► [/api/upload] ──► [src/lib/storage.ts]
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼ STORAGE_PROVIDER="imagekit"                    ▼ STORAGE_PROVIDER="cloudinary"
               [src/lib/imagekit.ts]                           [src/lib/cloudinary.ts]
```

---

## 4. Daftar File yang Akan Diubah / Dibuat [Plan]

| File | Status | Deskripsi Perubahan |
| :--- | :--- | :--- |
| `package.json` | `[MODIFY]` | Menambahkan skrip `postinstall` untuk `prisma generate` agar Prisma siap di Vercel/Netlify. Menyederhanakan build script. |
| `next.config.ts` | `[MODIFY]` | Menghapus `output: "standalone"` jika diperlukan untuk hosting serverless. Menambahkan `images.remotePatterns` untuk domain ImageKit dan Cloudinary. |
| `src/lib/db.ts` | `[MODIFY]` | Mengoptimalkan inisialisasi PrismaClient agar kompatibel dengan Neon Serverless Driver (jika menggunakan Neon). |
| `src/lib/imagekit.ts` | `[NEW]` | Client SDK initialization untuk ImageKit. |
| `src/lib/cloudinary.ts` | `[NEW]` | Client SDK initialization untuk Cloudinary. |
| `src/lib/storage.ts` | `[NEW]` | File adapter utama yang membaca `STORAGE_PROVIDER` dan memanggil driver yang tepat. |
| `src/lib/wa-service.ts`| `[NEW]` | HTTP Client helper untuk mengirim REST API payload ke `simt-wa-gateway`. |
| `src/app/api/upload/route.ts` | `[NEW]` | Endpoint upload file multipart form-data. |
| `.env.example` | `[NEW]` | Template file environment variabel lengkap. |

---

## 5. Rencana Rollback

Jika terjadi kegagalan koneksi atau performa buruk pada cloud DB selama masa transisi:
1. Kembalikan `.env` untuk menggunakan SQLite lokal:
   ```env
   DATABASE_PROVIDER="sqlite"
   DATABASE_URL="file:./dev.db"
   ```
2. Jalankan `npx prisma generate` kembali untuk memperbarui engine Prisma client ke SQLite lokal.
3. Aplikasi akan langsung berjalan normal menggunakan database lokal `prisma/dev.db` atau file database SQLite lainnya.

---
*Last updated: 2026-06-15*
