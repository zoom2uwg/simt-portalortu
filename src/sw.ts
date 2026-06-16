// ============================================================
// SIMT Portal Ortu — Service Worker
// Powered by Serwist (Workbox successor)
// ============================================================
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, NetworkOnly, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

// Serwist injects the precache manifest here via build
declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // ── Static Assets: Cache First (set-and-forget) ──────────────────
    {
      matcher: /\/_next\/static\/.*/i,
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 365 * 24 * 60 * 60 }), // 1 tahun
        ],
      }),
    },
    // ── Public Icons & Images ─────────────────────────────────────────
    {
      matcher: /\/(icons|images)\/.*/i,
      handler: new CacheFirst({
        cacheName: "public-assets",
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60, maxEntries: 60 }), // 30 hari
        ],
      }),
    },
    // ── Nilai (Grade): Cache First — jarang berubah ───────────────────
    {
      matcher: /\/api\/bff\/portal\/students\/[^/]+\/grades.*/i,
      handler: new CacheFirst({
        cacheName: "grades-data",
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 24 * 60 * 60 }), // 24 jam
        ],
      }),
    },
    // ── Jadwal: Stale While Revalidate ───────────────────────────────
    {
      matcher: /\/api\/bff\/portal\/students\/[^/]+\/schedule.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: "schedule-data",
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 24 * 60 * 60 }), // 1 hari
        ],
      }),
    },
    // ── Pengumuman: Stale While Revalidate ───────────────────────────
    {
      matcher: /\/api\/bff\/portal\/students\/[^/]+\/announcements.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: "announcements-data",
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 60 * 60 }), // 1 jam
        ],
      }),
    },
    // ── Grade Details: Cache First ────────────────────────────────────
    {
      matcher: /\/api\/bff\/portal\/students\/[^/]+\/subjects\/.*/i,
      handler: new CacheFirst({
        cacheName: "grade-details-data",
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 24 * 60 * 60 }), // 24 jam
        ],
      }),
    },
    // ── Dashboard umum: Network First, fallback cache ─────────────────
    {
      matcher: /\/api\/bff\/portal\/students\/.*/i,
      handler: new NetworkFirst({
        cacheName: "dashboard-data",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 5 * 60, maxEntries: 20 }), // 5 menit
        ],
      }),
    },
    // ── Pembayaran: Network Only — data keuangan TIDAK boleh stale ────
    {
      matcher: /\/api\/bff\/portal\/students\/[^/]+\/payments.*/i,
      handler: new NetworkOnly(),
    },
    // ── Auth endpoints: Network Only ──────────────────────────────────
    {
      matcher: /\/api\/bff\/auth\/.*/i,
      handler: new NetworkOnly(),
    },
    // ── Legacy API endpoints: Network First ───────────────────────────
    {
      matcher: /\/api\/(dashboard|student-dashboard|grade-details).*/i,
      handler: new NetworkFirst({
        cacheName: "legacy-api-data",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({ maxAgeSeconds: 5 * 60 }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
