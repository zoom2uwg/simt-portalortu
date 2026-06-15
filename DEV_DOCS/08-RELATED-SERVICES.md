# 08 — Ekosistem SIMT: Service Terkait

Aplikasi **Portal Ortu** tidak berdiri sendiri. Ia adalah bagian dari ekosistem **SIMT (Sistem Informasi Manajemen Terpadu)**. Dokumen ini mendeskripsikan service-service eksternal yang terhubung dengan aplikasi ini dan bagaimana cara mereka berinteraksi.

---

## 1. Peta Layanan Ekosistem SIMT

```
                               ┌────────────────────────┐
                               │     USER / CLIENT      │
                               └───────────┬────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼ HTTP (Parent/Student)               ▼ HTTP (Admin/Guru)
            ┌───────────────────────┐             ┌───────────────────────┐
            │   SIMT PORTAL ORTU    │             │     SIMT BACKEND      │
            │ (Next.js - Repo ini)  │             │   (Laravel - Admin)   │
            └───────────┬───────────┘             └───────────┬───────────┘
                        │ Read/Write                          │ Read/Write
                        │                                     │
                        │        ┌──────────────────┐         │
                        └───────►│ SHARED DATABASE  │◄────────┘
                                 │  (Cloud DB)      │
                                 └──────────────────┘
                                           ▲
                                           │ Read/Write Config
                                           ▼
                               ┌───────────────────────┐
                               │    SIMT WA GATEWAY    │
                               │  (Node.js + Baileys)  │
                               └───────────────────────┘
```

---

## 2. SIMT Backend (Laravel)

SIMT Backend adalah panel administrasi utama tempat guru, staf tata usaha, kepala madrasah, dan super admin mengelola data sekolah.

- **Repositori Lokal**: `d:\laragon\www\simt-backend`
- **Teknologi**: Laravel (PHP), MySQL / PostgreSQL.
- **Fungsi Utama**:
  - Manajemen Tenant (Sekolah Baru, Berlangganan).
  - Input data Master (Siswa, Kelas, Guru, Tahun Ajaran, Mapel).
  - Entri Absensi, Penilaian Rapor, Transaksi SPP.
  - Pengaturan Akun Ortu (Email) & Password Siswa.
- **Hubungan dengan Portal Ortu**:
  - **Shared Database**: Kedua sistem membaca dan menulis ke tabel database yang sama.
  - **Data Owner**: Laravel backend bertindak sebagai *source of truth* untuk sebagian besar data master. Portal Ortu bertindak sebagai penampil data (*read-only*) untuk dashboard siswa/orang tua, dan menulis data untuk aktivitas interaktif tertentu (misal: unggah foto profil, ubah password siswa).

---

## 3. SIMT WA Gateway (Node.js)

Service mandiri yang mengelola koneksi WebSocket WhatsApp ke server WhatsApp menggunakan pustaka **Baileys**.

- **Repositori Lokal**: `d:\laragon\www\simt-wa-gateway`
- **Teknologi**: Node.js + Express + Baileys.
- **Fungsi Utama**:
  - Menyediakan multi-session WhatsApp (satu session per tenant/sekolah).
  - Menyediakan QR Code untuk discan oleh admin sekolah agar WhatsApp terhubung.
  - Mengirim pesan teks, media, atau dokumen otomatis ke nomor orang tua/siswa.
- **Hubungan dengan Portal Ortu**:
  - **HTTP API Trigger**: Portal Ortu tidak menjalankan websocket WhatsApp (karena batasan arsitektur Next.js serverless). Portal Ortu memanggil REST API endpoint milik WA Gateway untuk mengirim notifikasi (misal: tagihan SPP, presensi ALPHA, atau pengumuman penting).
  - **Konfigurasi Database**: WA Gateway membaca kredensial session dari tabel `whatsapp_configs` yang disimpan di database bersama.

---

## 4. Keamanan Integrasi Antar-Layanan

Untuk mencegah penyalahgunaan pengiriman pesan WhatsApp oleh pihak luar, komunikasi Next.js ◄─► WA Gateway dilindungi dengan **Service Secret Token**:

1. Token rahasia diset pada file environment masing-masing service:
   - Next.js: `WA_SERVICE_SECRET="token_rahasia_anda"`
   - WA Gateway: `WA_SERVICE_SECRET="token_rahasia_anda"`
2. Setiap kali Portal Ortu mengirim request HTTP POST untuk kirim pesan, Portal Ortu mengirim header keamanan:
   ```http
   POST /send-message HTTP/1.1
   Host: wa-gateway.sekolah.sch.id
   X-Service-Secret: token_rahasia_anda
   Content-Type: application/json
   ```
3. WA Gateway memvalidasi header `X-Service-Secret`. Jika tidak cocok, request langsung ditolak dengan status code `401 Unauthorized`.

---
*Last updated: 2026-06-15*
