# SIMT Portal Ortu — DEV_DOCS

> **Untuk Agentic AI**: Baca dokumen ini terlebih dahulu sebelum mengerjakan task apapun.
> Dokumen ini adalah **sumber kebenaran tunggal** (single source of truth) untuk proyek ini.

## Daftar Dokumen

| File | Isi |
|------|-----|
| [01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md) | Gambaran umum proyek, tech stack, tujuan bisnis |
| [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) | Arsitektur sistem, diagram service, data flow |
| [03-DATABASE-SCHEMA.md](./03-DATABASE-SCHEMA.md) | Skema database lengkap, relasi antar model |
| [04-API-ROUTES.md](./04-API-ROUTES.md) | Semua endpoint API, request/response format |
| [05-MIGRATION-PLAN.md](./05-MIGRATION-PLAN.md) | Rencana migrasi SQLite → Cloud DB + file storage |
| [06-ENVIRONMENT.md](./06-ENVIRONMENT.md) | Semua env variables, cara setup per provider |
| [07-DEPLOY-GUIDE.md](./07-DEPLOY-GUIDE.md) | Panduan deploy ke Vercel, Netlify, Railway, VPS |
| [08-RELATED-SERVICES.md](./08-RELATED-SERVICES.md) | Service lain dalam ekosistem SIMT (backend, WA gateway) |

## Status Proyek

```
Current State : Development (localhost SQLite)
Target State  : Production-ready (Cloud DB + Cloud Storage + Vercel)
Migration     : IN PROGRESS — lihat 05-MIGRATION-PLAN.md
```

## Quick Start untuk AI Agent

1. Baca **01-PROJECT-OVERVIEW.md** untuk konteks bisnis
2. Baca **02-ARCHITECTURE.md** untuk memahami sistem
3. Cek **05-MIGRATION-PLAN.md** untuk task yang sedang berjalan
4. Cek **06-ENVIRONMENT.md** sebelum menyentuh konfigurasi apapun

---
*Last updated: 2026-06-15*
