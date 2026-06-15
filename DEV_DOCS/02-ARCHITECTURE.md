# 02 — Architecture: SIMT Ekosistem

## Gambaran Arsitektur Lengkap

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERNET / USER                               │
└──────────┬──────────────────────────────────────────────────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────────────────────────────────────┐
│               SIMT PORTAL ORTU (Repo ini)                        │
│                   Next.js 16 App Router                          │
│                   Vercel / Netlify (target)                      │
│                                                                  │
│   ┌──────────────────────────┐  ┌───────────────────────────┐  │
│   │   Frontend (React SPA)   │  │   API Routes (Next.js)    │  │
│   │   src/app/page.tsx       │  │   /api/auth               │  │
│   │   - Login Ortu           │◄─│   /api/dashboard          │  │
│   │   - Login Siswa          │  │   /api/student-auth       │  │
│   │   - Dashboard Ortu       │  │   /api/student-dashboard  │  │
│   │   - Dashboard Siswa      │  │   /api/grade-details      │  │
│   │   PWA installable        │  │   /api/upload (PLANNED)   │  │
│   └──────────────────────────┘  └────────────┬──────────────┘  │
└────────────────────────────────────────────────│─────────────────┘
                                                 │ Prisma ORM
                                      ┌──────────▼──────────────┐
                                      │    DATABASE (Cloud)      │
                                      │  ┌────────────────────┐  │
                                      │  │ Option A: NeonDB   │  │
                                      │  │ (PostgreSQL)       │  │
                                      │  ├────────────────────┤  │
                                      │  │ Option B: Supabase │  │
                                      │  │ (PostgreSQL)       │  │
                                      │  ├────────────────────┤  │
                                      │  │ Option C: Aiven    │  │
                                      │  │ (MySQL)            │  │
                                      │  └────────────────────┘  │
                                      └─────────────────────────-┘

┌─────────────────────────────────────────────────────────────────┐
│               SIMT BACKEND (Repo Terpisah)                       │
│               d:\laragon\www\simt-backend                        │
│               Laravel / PHP — Admin Panel Sekolah                │
│               PORT: (default Laravel)                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Shared Database
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               SIMT WA GATEWAY (Repo Terpisah)                    │
│               d:\laragon\www\simt-wa-gateway                     │
│               Node.js + Baileys + Express                        │
│               WebSocket persistent (WA session)                  │
│               HTTP REST API untuk Next.js                        │
│               Production URL: dikonfigurasi via env              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               FILE STORAGE (Cloud)                               │
│   ┌────────────────────┐    ┌────────────────────────────────┐  │
│   │ Option A: ImageKit │    │ Option B: Cloudinary           │  │
│   │ @imagekit/nodejs   │    │ cloudinary npm                 │  │
│   │ 20GB free/bln      │    │ 25GB free/bln                  │  │
│   └────────────────────┘    └────────────────────────────────┘  │
│   Upload via: POST /api/upload (Next.js API Route)               │
└─────────────────────────────────────────────────────────────────┘
```

## Alur Data — Login Orang Tua

```
User → input email
  → POST /api/auth { email }
  → db.student.findMany({ parentEmail: email })
  → return students[]
  → GET /api/dashboard?studentId=xxx&gradeType=PENGETAHUAN
  → return { student, attendanceSummary, grades, payments, announcements }
  → Render di page.tsx
```

## Alur Data — Login Siswa

```
User → input NIS + password
  → POST /api/student-auth { nis, password }
  → db.student.findFirst({ nis }) → bcrypt.compare(password)
  → return { student }
  → GET /api/student-dashboard?studentId=xxx
  → return { student, attendanceSummary, grades, schedules,
             violations, achievements, tahfiz, announcements }
  → Render di page.tsx
```

## Alur Upload File (PLANNED)

```
User → pilih foto/file
  → POST /api/upload (multipart/form-data)
  → Validasi tipe + ukuran
  → Upload ke ImageKit ATAU Cloudinary (sesuai env STORAGE_PROVIDER)
  → return { url, fileId }
  → Simpan URL ke database (student.photo, tenant.logo, dll)
```

## Komunikasi dengan WA Gateway

```
Next.js API Route / Service
  → HTTP POST ke WA_SERVICE_URL/send-message
  → Header: X-Service-Secret: WA_SERVICE_SECRET
  → Body: { phone, message, tenantId }
  → WA Gateway kirim via Baileys WebSocket
  → return { success, messageId }
```

## Keputusan Arsitektur

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| No WebSocket di Next.js | ✅ | Next.js serverless tidak support persistent WS |
| Multi-provider DB | ✅ | Fleksibel per deployment needs |
| Dual storage support | ✅ | User bisa pilih ImageKit atau Cloudinary via env |
| SPA di page.tsx | ✅ (legacy) | Satu file besar, pertimbangkan refactor |
| No NextAuth | ✅ (MVP) | Simple email lookup, cukup untuk MVP |
| PWA | ✅ | Portal ortu harus bisa di-install di HP |

---
*Lihat [05-MIGRATION-PLAN.md](./05-MIGRATION-PLAN.md) untuk rencana perubahan arsitektur.*
