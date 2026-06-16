# 04 — API Routes: SIMT Portal Ortu

> **Base URL (dev)**: `http://localhost:3000`
> **Base URL (prod)**: `https://your-domain.vercel.app`
> **Auth**: Tidak ada JWT/session cookie saat ini (MVP). Semua API bisa diakses langsung.
> **⚠️ TODO**: Tambahkan session middleware sebelum production.

## Daftar Endpoint

| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| `GET` | `/api` | Health check | - |
| `POST` | `/api/auth` | Login orang tua via email | - |
| `GET` | `/api/dashboard` | Dashboard orang tua | studentId (query) |
| `POST` | `/api/student-auth` | Login siswa via NIS+password | - |
| `GET` | `/api/student-dashboard` | Dashboard siswa | studentId (query) |
| `GET` | `/api/grade-details` | Detail nilai per mapel | studentId+subjectId (query) |
| `POST` | `/api/upload` | Upload file ke cloud storage | **(PLANNED)** |

---

## POST /api/auth — Login Orang Tua

**Request**:
```json
{
  "email": "parent@example.com"
}
```

**Response 200**:
```json
{
  "students": [
    {
      "id": "clxxx",
      "name": "Ahmad Fauzi",
      "nis": "12345",
      "classroom": "VII-A",
      "level": 7,
      "tenant": { "name": "MTs Al-Hikmah", "slug": "al-hikmah" }
    }
  ]
}
```

**Response 404**: Email tidak terdaftar sebagai wali murid
**Response 400**: Email tidak diisi

**Catatan**: Jika satu email memiliki >1 anak, semua dikembalikan. Frontend akan tampilkan switcher.

---

## GET /api/dashboard — Dashboard Orang Tua

**Query Params**:
- `studentId` (required): ID siswa
- `gradeType` (optional, default: `PENGETAHUAN`): `PENGETAHUAN|KETERAMPILAN|UTS|UAS|SIKAP`

**Response 200**:
```json
{
  "student": {
    "id": "clxxx",
    "name": "Ahmad Fauzi",
    "nis": "12345",
    "nisn": "9876543210",
    "gender": "L",
    "classroom": "VII-A",
    "level": 7,
    "academicYear": "2025/2026",
    "waliKelas": { "name": "Bu Siti", "phone": "08xxx" },
    "tenant": { "name": "MTs Al-Hikmah", "slug": "al-hikmah", "logo": null },
    "birthPlace": "Malang",
    "birthDate": "2012-05-10T00:00:00.000Z",
    "address": "Jl. Merdeka No. 1",
    "fatherName": "Bapak Fauzi",
    "fatherPhone": "08xxx",
    "motherName": "Ibu Aminah",
    "motherPhone": "08xxx"
  },
  "attendanceSummary": {
    "hadir": 18, "sakit": 1, "izin": 0, "alpha": 0,
    "total": 19,
    "periodLabel": "Bulan Juni 2026",
    "hasData": true,
    "recent": [...],
    "daily": [
      { "date": "2026-06-01T00:00:00.000Z", "status": "HADIR", "timeIn": "...", "timeOut": "...", "note": null }
    ]
  },
  "grades": {
    "list": [
      { "id": "clyyy", "score": 85.5, "subject": { "id": "clzzz", "name": "Matematika", "code": "MTK" } }
    ],
    "average": 82.3,
    "count": 10,
    "activeType": "PENGETAHUAN",
    "availableTypes": [
      { "type": "PENGETAHUAN", "count": 10 },
      { "type": "KETERAMPILAN", "count": 8 }
    ],
    "hasData": true,
    "belowKKMCount": 2,
    "pengetahuanAverage": 82.3,
    "pengetahuanCount": 10,
    "isAllTuntas": false
  },
  "payments": {
    "all": [...],
    "unpaid": [
      { "id": "clppp", "month": 6, "year": 2026, "amount": 150000, "status": "BELUM_BAYAR", "dueDate": "..." }
    ],
    "totalUnpaid": 300000,
    "totalPaid": 1500000,
    "hasData": true
  },
  "announcements": [
    { "id": "claaa", "title": "Libur Idul Adha", "content": "...", "category": "umum", "isPinned": true, "publishedAt": "..." }
  ]
}
```

---

## POST /api/student-auth — Login Siswa

**Request**:
```json
{
  "nis": "12345",
  "password": "password123"
}
```

**Response 200**:
```json
{
  "student": {
    "id": "clxxx",
    "name": "Ahmad Fauzi",
    "nis": "12345"
  }
}
```

**Response 401**: NIS atau password salah
**Response 400**: NIS/password tidak diisi

**Catatan**: Password di-hash dengan bcrypt di database (field `studentPassword`). Jika `studentPassword` null, login tidak diizinkan.

---

## GET /api/student-dashboard — Dashboard Siswa

**Query Params**:
- `studentId` (required)
- `gradeType` (optional, default: `PENGETAHUAN`)

**Response 200** (lebih lengkap dari parent dashboard, tambahan):
```json
{
  "student": { ... },
  "attendanceSummary": { ... },
  "grades": { ... },
  "schedules": [
    {
      "id": "clsss",
      "dayOfWeek": 1,
      "startPeriod": 1,
      "endPeriod": 2,
      "subject": { "name": "Matematika", "code": "MTK" },
      "teacher": { "name": "Pak Budi" }
    }
  ],
  "violations": {
    "list": [
      { "id": "clvvv", "date": "...", "category": "ringan", "description": "...", "points": 5, "action": null }
    ],
    "totalPoints": 5,
    "count": 1
  },
  "achievements": {
    "list": [
      { "id": "claaa", "date": "...", "title": "Juara 1 Olimpiade Matematika", "category": "akademik", "level": "kota", "ranking": "Juara 1", "description": null }
    ],
    "count": 1
  },
  "tahfiz": {
    "totalRecords": 15,
    "ziyadahCount": 10,
    "murajaahCount": 5,
    "averageScore": 87.5,
    "surahMemorized": 8,
    "latestRecords": [...]
  },
  "announcements": [...]
}
```

---

## GET /api/grade-details — Detail Nilai per Mapel

**Query Params**:
- `studentId` (required)
- `subjectId` (required)

**Response 200**:
```json
{
  "details": {
    "tugas": [
      { "id": "clggg", "title": "Tugas 1", "score": 90, "weight": 1, "date": "...", "note": null }
    ],
    "harian": [...],
    "uts": [...],
    "uas": [...],
    "akhir": [...]
  },
  "averages": {
    "tugas": 88.5,
    "harian": 82.0,
    "uts": 75.0,
    "uas": null,
    "akhir": null
  },
  "hasData": true
}
```

---

## POST /api/upload — Upload File (PLANNED)

> **Status**: Belum diimplementasi. Perlu dibuat.

**Request**: `multipart/form-data`
```
file: [binary]
folder: "students/photos" | "tenants/logos" | "achievements/certificates"
```

**Response 200**:
```json
{
  "url": "https://ik.imagekit.io/your_id/students/photos/filename.jpg",
  "fileId": "xxxxx"
}
```

**Validasi**:
- Tipe file: `jpg`, `jpeg`, `png`, `webp`, `pdf`
- Ukuran maksimal: 5MB
- Provider: sesuai `STORAGE_PROVIDER` env (`imagekit` atau `cloudinary`)

---

## Error Response Format

Semua error mengikuti format:
```json
{
  "error": "Pesan error dalam Bahasa Indonesia"
}
```

HTTP Status codes:
- `400` — Bad Request (input tidak valid)
- `401` — Unauthorized (password salah)
- `404` — Not Found (data tidak ditemukan)
- `500` — Internal Server Error

---

## Catatan untuk AI Agent

- **Tidak ada middleware auth** saat ini. `studentId` dikirim langsung dari frontend.
- Ini adalah **MVP** — sebelum production harus ditambahkan session/token validation.
- Semua API Routes ada di `src/app/api/*/route.ts`
- Database client: `import { db } from '@/lib/db'`
