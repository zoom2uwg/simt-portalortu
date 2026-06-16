# 01 — Project Overview: SIMT Portal Ortu

## Identitas Proyek

| Atribut | Nilai |
|---------|-------|
| **Nama** | SIMT Portal Ortu |
| **Repo** | `d:\laragon\www\simt-portalortu` |
| **Framework** | Next.js 16.2.9 (Turbopack) |
| **Language** | TypeScript |
| **Package Manager** | npm (ada bun.lock, tapi npm dipakai) |
| **Port Dev** | 3000 |
| **Status** | Development — SQLite lokal |

## Tujuan Bisnis

**SIMT** (Sistem Informasi Manajemen Terpadu) adalah platform SaaS multi-tenant untuk **Madrasah Tsanawiyah (MTs) / SMP berbasis yayasan**.

Aplikasi **Portal Ortu** ini adalah **frontend khusus orang tua dan siswa** — bukan admin panel. Fungsinya:

- 👨‍👩‍👧 **Portal Orang Tua**: Login via email, lihat nilai, absensi, pembayaran SPP, pengumuman anak
- 🎓 **Portal Siswa**: Login via NIS + password, lihat jadwal, nilai, tahfiz, pelanggaran, prestasi

## Tech Stack

```
Frontend    : React 19 + Next.js 16 App Router
Styling     : Tailwind CSS v4
UI Library  : shadcn/ui (Radix UI components)
ORM         : Prisma 6.x
Database    : SQLite (dev) → PostgreSQL/MySQL (production)
Auth        : Custom JWT-less session (email lookup untuk ortu, NIS+password untuk siswa)
State       : useState/useCallback (no Redux/Zustand di portal ini)
Charts      : Recharts + custom SVG Donut chart
Animation   : Framer Motion + CSS custom animations
Icons       : Lucide React
Forms       : React Hook Form + Zod
PWA         : Service Worker + manifest.json (installable)
```

## Struktur Folder

```
simt-portalortu/
├── DEV_DOCS/              ← Dokumentasi ini
├── deployment/            ← Caddyfile untuk reverse proxy
├── docs/                  ← Dokumen lain
├── mini-services/         ← (kosong, placeholder)
├── prisma/
│   ├── schema.prisma      ← Schema database (multi-tenant)
│   └── seed.ts            ← Data seed
├── public/                ← PWA icons, manifest, sw.js
├── src/
│   ├── app/
│   │   ├── api/           ← Next.js API Routes
│   │   │   ├── auth/      ← POST /api/auth (parent login)
│   │   │   ├── dashboard/ ← GET /api/dashboard (parent dashboard)
│   │   │   ├── grade-details/ ← GET /api/grade-details
│   │   │   ├── student-auth/  ← POST /api/student-auth
│   │   │   └── student-dashboard/ ← GET /api/student-dashboard
│   │   ├── globals.css    ← Global styles + custom animations
│   │   ├── layout.tsx     ← Root layout (metadata, fonts)
│   │   └── page.tsx       ← Main SPA component (2067 baris!)
│   ├── components/
│   │   └── ui/            ← shadcn/ui components
│   └── lib/
│       ├── auth.ts        ← Auth utilities (getParentStudents, getStudentDashboard)
│       ├── db.ts          ← Prisma client singleton
│       └── utils.ts       ← cn() helper
├── .env                   ← Environment variables (JANGAN commit!)
├── next.config.ts         ← Next.js config
└── package.json
```

## Multi-Tenant Architecture

Setiap sekolah (tenant) memiliki data yang benar-benar terpisah via `tenantId`.

```
Tenant (Sekolah A) ──┬── Users (Guru, TU, Admin)
                     ├── Students (Siswa) ──── Classroom
                     ├── AcademicYears
                     ├── Subjects
                     ├── Attendances
                     ├── Grades + GradeDetails
                     ├── Payments
                     ├── Announcements
                     ├── Schedules
                     ├── StudentViolations
                     ├── StudentAchievements
                     ├── TahfizRecords
                     └── WhatsappConfig
```

## Relasi dengan Sistem Lain

Lihat [08-RELATED-SERVICES.md](./08-RELATED-SERVICES.md)

---
*File ini dikelola oleh AI Agent. Jangan edit manual kecuali ada perubahan arsitektur besar.*
