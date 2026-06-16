// SIMT MTs - Parent Portal API Utilities
// NOTE: Prisma removed — auth sekarang dihandle via BFF → Laravel
// File ini dipertahankan untuk type exports saja

export interface ParentSession {
  studentId: string;
  studentName: string;
  tenantId: string;
  tenantName: string;
  classroomName: string;
  parentEmail: string;
}

// Placeholder — fungsi ini tidak lagi dipanggil langsung
// Auth ditangani oleh /api/bff/auth/parent-login → Laravel
export async function getParentStudents(parentEmail: string) {
  console.warn('[auth.ts] getParentStudents() deprecated — gunakan BFF auth endpoint');
  return [];
}

export async function getStudentDashboard(studentId: string) {
  console.warn('[auth.ts] getStudentDashboard() deprecated — gunakan BFF dashboard endpoint');
  return null;
}
