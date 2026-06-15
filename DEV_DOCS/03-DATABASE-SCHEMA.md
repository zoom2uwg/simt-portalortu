# 03 — Database Schema: SIMT MTs

> **Source of Truth**: `prisma/schema.prisma`
> **ORM**: Prisma 6.x
> **Provider saat ini**: SQLite (dev) → akan diganti cloud DB (production)

## Konfigurasi Datasource

```prisma
datasource db {
  provider  = env("DATABASE_PROVIDER")  // "postgresql" atau "mysql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL") // untuk NeonDB pgbouncer
}
```

## Entity Relationship Diagram

```
Tenant (Sekolah)
│
├── User (Guru/Admin) ──────────────────────┐
│   └── role: SUPER_ADMIN|KEPALA_MADRASAH   │
│         |TATA_USAHA|GURU|WALI_KELAS       │
│         |OPERATOR                          │
│                                            │
├── AcademicYear (Tahun Ajaran)             │
│   └── Classroom (Kelas VII-A, VIII-B...) ─┤
│       └── Student (Siswa) ─────────────── │
│           │                                │
│           ├── Attendance ─────────────────┘(recordedBy=User)
│           ├── Grade ──────────────────────┘(teacherId=User)
│           ├── GradeDetail
│           ├── Payment (SPP)
│           ├── StudentViolation
│           ├── StudentAchievement
│           └── TahfizRecord
│
├── Subject (Mata Pelajaran) ──────────────┐
│   ├── teacherId → User                   │
│   ├── Grade                              │
│   ├── GradeDetail                        │
│   └── Schedule                          │
│                                          │
├── Schedule (Jadwal Pelajaran) ───────────┘
├── Announcement (Pengumuman)
└── WhatsappConfig
```

## Model Detail

### Tenant
Sekolah / Yayasan. Semua data ter-scope ke `tenantId`.
```
id, name, slug (unique URL), code (NPSN/NISM)
address, city, province, phone, email
logo (path/URL), npsn, nism
isActive, subscriptionEnd, maxStudents, currentStudents
```

### User (Guru/Staff)
```
id, tenantId, name, email (unique per tenant), password (hashed)
phone, role, avatar, isActive, lastLoginAt
nuptk (DAPODIK), nip
```
**Roles**: `SUPER_ADMIN`, `KEPALA_MADRASAH`, `TATA_USAHA`, `GURU`, `WALI_KELAS`, `OPERATOR`

### Student (Siswa)
```
id, tenantId, classroomId
nis (unique per tenant), nisn, name, gender (L/P)
birthPlace, birthDate, address, photo (path/URL)
fatherName, fatherPhone, motherName, motherPhone
guardianName, guardianPhone
parentEmail       ← dipakai untuk login Portal Ortu
studentPassword   ← dipakai untuk login Portal Siswa
nik, religion, enrollmentDate, isActive
```

### Classroom (Kelas)
```
id, tenantId, academicYearId
name (VII-A, VIII-B, IX-C), level (7/8/9), capacity
waliKelasId → User
```

### AcademicYear (Tahun Ajaran)
```
id, tenantId, name (2025/2026), semester (1=Ganjil, 2=Genap)
isActive, startDate, endDate
```

### Subject (Mata Pelajaran)
```
id, tenantId, classroomId, teacherId → User
name, code, hoursPerWeek
category: UMUM|AGAMA_ISLAM|ARAB|QURAN|MUATAN_LOCAL|EKSTRA
```

### Attendance (Presensi)
```
id, tenantId, studentId, date
status: HADIR|SAKIT|IZIN|ALPHA
timeIn, timeOut, note
recordedBy → User
UNIQUE: (tenantId, studentId, date)
```

### Grade (Nilai Rekap)
```
id, tenantId, studentId, subjectId, teacherId → User
type: PENGETAHUAN|KETERAMPILAN|SIKAP|UTS|UAS|PAS|RAPOR
score (Float), description
UNIQUE: (tenantId, studentId, subjectId, type)
```

### GradeDetail (Nilai Detail per Tugas/Kuis)
```
id, tenantId, studentId, subjectId
category: TUGAS|HARIAN|UTS|UAS|AKHIR
title (Tugas 1, Kuis 2, UAS Semester), score, weight, date, note
```

### Payment (Pembayaran SPP)
```
id, tenantId, studentId
type: SPP|DAFTAR_ULANG|SERAGAM|BUKU|KEGIATAN|LAIN_LAIN
amount (Int, Rupiah), month (1-12), year
status: BELUM_BAYAR|MENUNGGU|LUNAS|SEBAGIAN
paidAt, paymentMethod, transactionRef, note, dueDate
```

### Announcement (Pengumuman)
```
id, tenantId, title, content
category: umum|akademik|keagamaan|keuangan
isPinned, publishedAt, expiresAt
```

### Schedule (Jadwal Pelajaran)
```
id, tenantId, classroomId, subjectId, teacherId → User
dayOfWeek (1=Senin..6=Sabtu), startPeriod (1-10), endPeriod (1-10)
```

### StudentViolation (Pelanggaran)
```
id, tenantId, studentId, date
category: ringan|sedang|berat
description, points (Int, negatif), action, recordedBy → User
```

### StudentAchievement (Prestasi)
```
id, tenantId, studentId, date
title, category: akademik|non-akademik|keagamaan|olahraga|seni
level: kelas|sekolah|kecamatan|kota|provinsi|nasional|internasional
ranking, description, certificate (path/URL)
```

### TahfizRecord (Hafalan Quran)
```
id, tenantId, studentId, date
surah, ayahStart, ayahEnd
type: ziyadah|murajaah
score (0-100), fluency: lancar|cukup|kurang
note, recordedBy → User
```

### WhatsappConfig (Konfigurasi WA)
```
id, tenantId, sessionName, sessionId (encrypted)
qrCode (base64), isConnected, phoneNumber, lastConnectedAt
```
> ⚠️ Baileys session TIDAK dijalankan di Next.js ini. 
> Session dikelola oleh `simt-wa-gateway` service terpisah.
> Model ini hanya menyimpan metadata config per tenant.

## Catatan Migrasi SQLite → PostgreSQL/MySQL

Saat migrasi provider, perhatikan:

1. **Enum**: SQLite tidak punya enum native (Prisma handle via string). PostgreSQL punya native enum. MySQL punya enum. Tidak ada perubahan schema yang diperlukan — Prisma mengurus ini.

2. **Boolean**: SQLite pakai `0/1`. PostgreSQL/MySQL pakai `TRUE/FALSE`. Prisma mengurus konversi.

3. **DateTime**: Format berbeda antar provider. Gunakan `.toISOString()` saat serialize ke JSON (sudah dilakukan di API routes).

4. **`directUrl`**: Hanya diperlukan jika pakai NeonDB dengan pgbouncer (connection pooling). Supabase dan Aiven tidak memerlukan ini (atau isi dengan nilai sama dengan `DATABASE_URL`).

5. **String length di MySQL**: MySQL memerlukan panjang maksimum untuk kolom TEXT yang di-index. Prisma otomatis menggunakan `VARCHAR(191)` untuk string default di MySQL. Field yang panjang (content, description, dll) perlu anotasi `@db.Text` jika MySQL.

---
*Lihat `prisma/schema.prisma` untuk source of truth lengkap.*
