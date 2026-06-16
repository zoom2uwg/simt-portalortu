// ============================================================
// SIMT Portal Ortu — Cache Hydrator
// Pre-warm IndexedDB cache setelah login sukses
// Dipanggil sekali agar data tersedia saat offline
// ============================================================
import { getLocalDB, TTL } from './local-db';

const BFF_BASE = '/api/bff';

interface HydrateOptions {
  studentId: string;
  role: 'parent' | 'student'; // Tentukan endpoint yang dipanggil
}

/**
 * Fetch semua data penting dan simpan ke IndexedDB.
 * Dipanggil background setelah login — tidak memblok UI.
 */
export async function hydrateStudentCache(options: HydrateOptions): Promise<void> {
  const { studentId, role } = options;

  if (typeof window === 'undefined') return;

  try {
    const db = getLocalDB();

    // Tentukan endpoint berdasarkan role
    const dashboardEndpoint = role === 'parent'
      ? `${BFF_BASE}/portal/students/${studentId}/dashboard`
      : `${BFF_BASE}/portal/students/${studentId}/student-dashboard`;

    const ttl = role === 'parent' ? TTL.DASHBOARD : TTL.STUDENT_DASHBOARD;

    console.log(`[CacheHydrator] 🔄 Mulai hydrate cache untuk siswa ${studentId} (${role})`);

    // Fetch dashboard data (semua data dalam satu call)
    const res = await fetch(dashboardEndpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      console.warn(`[CacheHydrator] ⚠️ Fetch gagal: HTTP ${res.status}`);
      return;
    }

    const data = await res.json();
    const now = Date.now();

    // Simpan ke IndexedDB sesuai role
    if (role === 'parent') {
      await db.dashboards.put({
        studentId,
        data,
        cachedAt: now,
        expiresAt: now + ttl,
      });
    } else {
      await db.studentDashboards.put({
        studentId,
        data,
        cachedAt: now,
        expiresAt: now + ttl,
      });
    }

    // Simpan timestamp hydrate
    await db.meta.put({
      key: `last_hydrate_${role}_${studentId}`,
      value: new Date().toISOString(),
      updatedAt: now,
    });

    console.log(`[CacheHydrator] ✅ Cache berhasil diisi untuk siswa ${studentId}`);
  } catch (err) {
    // Tidak throw — jangan blok login flow jika terjadi error
    console.warn('[CacheHydrator] ⚠️ Gagal hydrate cache (non-fatal):', err);
  }
}

/**
 * Cek apakah cache sudah ada dan masih valid untuk student ini.
 */
export async function isCacheHydrated(studentId: string, role: 'parent' | 'student'): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const db = getLocalDB();
    const cached = role === 'parent'
      ? await db.dashboards.get(studentId)
      : await db.studentDashboards.get(studentId);

    if (!cached) return false;
    return Date.now() < cached.expiresAt;
  } catch {
    return false;
  }
}

/**
 * Ambil data dari cache IndexedDB (fallback saat offline).
 */
export async function getCachedDashboard(
  studentId: string,
  role: 'parent' | 'student'
): Promise<unknown | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = getLocalDB();
    const cached = role === 'parent'
      ? await db.dashboards.get(studentId)
      : await db.studentDashboards.get(studentId);

    return cached?.data ?? null;
  } catch {
    return null;
  }
}
