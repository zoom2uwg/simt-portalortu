# 07 — Panduan Deployment SIMT Portal Ortu

Dokumen ini menjelaskan opsi deployment untuk **SIMT Portal Ortu** (Next.js 16) ke berbagai platform cloud (Vercel, Netlify, Railway, VPS) beserta penanganan masalah (gotchas) yang sering ditemui.

---

## 1. Deploy ke Vercel (Rekomendasi Utama)

Vercel adalah platform native untuk Next.js. Deploy di sini memberikan performa terbaik, dukungan Serverless Functions otomatis, dan integrasi CI/CD git yang sangat lancar.

### Langkah Deployment:
1. Hubungkan repository GitHub Anda ke Vercel.
2. Di dashboard Vercel, klik **Add New** -> **Project**.
3. Impor repositori `simt-portalortu`.
4. Di bagian **Configure Project**:
   - **Framework Preset**: Pilih `Next.js`.
   - **Build Command**: `prisma generate && next build` (Gunakan default atau modifikasi jika perlu).
   - **Install Command**: `npm install` (default).
5. Buka bagian **Environment Variables** dan masukkan semua variabel dari panduan `.env.example` (terutama `DATABASE_PROVIDER`, `DATABASE_URL`, `DATABASE_DIRECT_URL`, `STORAGE_PROVIDER`, `WA_SERVICE_URL`, dll).
6. Klik **Deploy**.

### Gotchas di Vercel:
- **`output: "standalone"`**: Hapus konfigurasi `output: "standalone"` di `next.config.ts` sebelum mendeploy ke Vercel. Vercel secara otomatis mengemas aplikasi Next.js ke serverless environment miliknya. Standalone mode terkadang memicu overhead atau error path di Vercel.
- **Connection Timeout**: Jika database Anda di Neon/Supabase masuk ke mode *sleep* (gratisan), koneksi pertama dari Vercel serverless function mungkin memakan waktu lebih dari 10 detik (cold start) dan menyebabkan error 504. Pastikan pooling database dikonfigurasi dengan benar.
- **Prisma Client Generation**: Pastikan script build menyertakan `prisma generate` sebelum `next build` agar Prisma client di-generate dengan schema engine yang tepat untuk Linux serverless Vercel.

---

## 2. Deploy ke Netlify

Netlify adalah alternatif populer lainnya untuk Next.js dengan dukungan serverless adapter.

### Langkah Deployment:
1. Hubungkan repositori GitHub Anda ke Netlify.
2. Buat site baru dari Git di dashboard Netlify.
3. Konfigurasikan build settings:
   - **Build command**: `prisma generate && next build`
   - **Publish directory**: `.next`
4. Buka **Site configuration** -> **Environment variables** -> tambahkan semua variabel environment yang dibutuhkan.
5. Klik **Deploy site**.

### Gotchas di Netlify:
- **Next.js Runtime**: Pastikan Next.js Runtime plugin di Netlify terinstal secara otomatis.
- **Prisma Engine**: Netlify serverless functions memiliki limit ukuran bundle. Terkadang Prisma engine berukuran besar. Gunakan database cloud dengan adapter Neon serverless (`@prisma/adapter-neon` + `@neondatabase/serverless`) untuk performa optimal dan ukuran bundle yang ramping.

---

## 3. Deploy ke Railway (Full Stack & WA Gateway)

Railway sangat bagus jika Anda ingin mendeploy semua service (Next.js Portal Ortu + PostgreSQL/MySQL Database + Node.js WA Gateway) dalam satu project dashboard.

### Langkah Deployment:
1. Buat **Project** baru di Railway.
2. Tambahkan database (misal: PostgreSQL atau MySQL) langsung di dashboard Railway.
3. Hubungkan repositori GitHub `simt-portalortu` sebagai service.
4. Railway akan mendeteksi project Next.js dan mendownload dependencies.
5. Set build command di settings Railway: `npx prisma generate && next build`.
6. Bind port environment variable `PORT` (default `3000`).
7. Tambahkan variable env lainnya. Koneksi database ke database Railway internal bisa diset menggunakan variable reference `${{Postgres.DATABASE_URL}}`.

---

## 4. Deploy ke VPS (Ubuntu + PM2 + Caddy)

Jika Anda mendeploy di VPS pribadi untuk kontrol penuh atau kebutuhan komparasi offline:

### Prasyarat VPS:
- Node.js v18+ & npm terinstal.
- PM2 (Process Manager 2) terinstal secara global (`npm install -g pm2`).
- Caddy Server terinstal sebagai reverse proxy.

### Langkah Deployment:
1. Clone repositori ke VPS Anda:
   ```bash
   git clone <repo-url> /var/www/simt-portalortu
   cd /var/www/simt-portalortu
   ```
2. Buat file `.env` di direktori root VPS dan masukkan nilai variabel produksi.
3. Instal dependencies:
   ```bash
   npm install
   ```
4. Jalankan generate dan build:
   ```bash
   npx prisma generate
   npm run build
   ```
5. Jalankan aplikasi Next.js menggunakan PM2:
   ```bash
   # Menggunakan server.js hasil standalone build jika output standalone aktif
   # Atau gunakan command:
   pm2 start npm --name "simt-portalortu" -- start
   
   # Simpan proses agar otomatis jalan saat VPS reboot
   pm2 save
   pm2 startup
   ```

### Konfigurasi Reverse Proxy (Caddy)
Caddyfile default sudah disediakan di folder `deployment/Caddyfile`. Anda dapat menyalinnya atau menyesuaikan isinya:

```caddyfile
# Contoh konfigurasi Caddyfile VPS
portal.sekolah.sch.id {
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Real-IP {remote_host}
    }
}
```

Aktifkan Caddy dengan:
```bash
sudo systemctl reload caddy
```

---
*Last updated: 2026-06-15*
