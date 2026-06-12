'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, LogIn, BookOpen, ClipboardCheck, CreditCard,
  Bell, User, Calendar, TrendingUp, AlertCircle, CheckCircle2,
  Clock, XCircle, ChevronRight, Phone, School, Moon, Star
} from 'lucide-react';

// ============================================================
// Types
// ============================================================
interface StudentInfo {
  id: string;
  name: string;
  nis: string;
  classroom: string;
  level: number;
  academicYear: string;
  waliKelas: { name: string; phone: string } | null;
  tenant: { name: string; slug: string };
  gender: string;
}

interface AttendanceSummary {
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  recent: { date: string; status: string; timeIn: string | null; note: string | null }[];
}

interface PaymentInfo {
  all: { id: string; month: number; year: number; amount: number; status: string; dueDate: string; paidAt: string | null }[];
  unpaid: { id: string; month: number; year: number; amount: number; status: string; dueDate: string }[];
  totalUnpaid: number;
}

interface GradeInfo {
  list: { id: string; score: number; subject: { name: string; code: string } }[];
  average: number;
  count: number;
}

interface AnnouncementInfo {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  publishedAt: string;
}

interface DashboardData {
  student: StudentInfo;
  attendanceSummary: AttendanceSummary;
  payments: PaymentInfo;
  grades: GradeInfo;
  announcements: AnnouncementInfo[];
}

// ============================================================
// Constants
// ============================================================
const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  HADIR: { label: 'Hadir', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  SAKIT: { label: 'Sakit', color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
  IZIN: { label: 'Izin', color: 'text-blue-600 bg-blue-50', icon: Clock },
  ALPHA: { label: 'Alpha', color: 'text-red-600 bg-red-50', icon: XCircle },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  LUNAS: { label: 'Lunas', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  BELUM_BAYAR: { label: 'Belum Bayar', color: 'text-red-700 bg-red-50 border-red-200' },
  MENUNGGU: { label: 'Menunggu', color: 'text-amber-700 bg-amber-50 border-amber-200' },
};

// ============================================================
// Main Component
// ============================================================
export default function SIMTParentPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'grades' | 'payments' | 'announcements'>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);

  // Login handler
  const handleLogin = useCallback(async () => {
    if (!email.trim()) {
      setLoginError('Email wajib diisi');
      return;
    }
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Login gagal');
        return;
      }
      setStudents(data.students);
      if (data.students.length > 0) {
        setSelectedStudentId(data.students[0].id);
        setIsLoggedIn(true);
      }
    } catch {
      setLoginError('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Fetch dashboard data
  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard?studentId=${selectedStudentId}`);
        const data = await res.json();
        setDashboard(data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedStudentId]);

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 shadow-lg">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">SIMT MTs</h1>
              <p className="text-xs text-emerald-100">Portal Orang Tua</p>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Portal Orang Tua</h2>
              <p className="text-gray-500 mt-1">Sistem Informasi Manajemen Terpadu MTs</p>
              <p className="text-xs text-gray-400 mt-1">Masuk dengan email yang terdaftar di data siswa</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Wali Murid
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="ortu1@email.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {loginError}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Masuk
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                  <strong>Demo:</strong> Gunakan email <code className="bg-amber-100 px-1 py-0.5 rounded">ortu1@email.com</code> s/d <code className="bg-amber-100 px-1 py-0.5 rounded">ortu8@email.com</code>
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              SIMT MTs v1.0 &copy; 2026 &mdash; Madrasah Tsanawiyah
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================
  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  const { student, attendanceSummary, payments, grades, announcements } = dashboard;
  const attendancePercent = attendanceSummary.total > 0
    ? Math.round((attendanceSummary.hadir / attendanceSummary.total) * 100)
    : 0;

  // ============================================================
  // MAIN PORTAL
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight">{student.tenant.name}</h1>
                <p className="text-[10px] text-emerald-100">Portal Orang Tua</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {students.length > 1 && (
                <select
                  value={selectedStudentId || ''}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-white/15 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="text-gray-800">
                      {s.name} ({s.classroom})
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => { setIsLoggedIn(false); setDashboard(null); setEmail(''); }}
                className="text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Student Info Card */}
      <div className="bg-gradient-to-b from-emerald-700 to-emerald-800 text-white px-4 pb-5 pt-1">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base truncate">{student.name}</h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  NIS: {student.nis} &bull; Kelas {student.classroom}
                </p>
                {student.waliKelas && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Phone className="w-3 h-3 text-emerald-200" />
                    <span className="text-[10px] text-emerald-100">
                      Wali Kelas: {student.waliKelas.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-3">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2">
          <StatCard
            icon={<ClipboardCheck className="w-4 h-4" />}
            label="Kehadiran"
            value={`${attendancePercent}%`}
            sublabel={`${attendanceSummary.hadir}/${attendanceSummary.total} hari`}
            color="emerald"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Rata-rata"
            value={String(grades.average)}
            sublabel={`${grades.count} mapel`}
            color={grades.average >= 75 ? 'blue' : 'amber'}
          />
          <StatCard
            icon={<CreditCard className="w-4 h-4" />}
            label="Tunggakan"
            value={payments.totalUnpaid > 0 ? `Rp ${(payments.totalUnpaid / 1000).toFixed(0)}K` : 'Lunas'}
            sublabel={`${payments.unpaid.length} bln belum`}
            color={payments.totalUnpaid > 0 ? 'red' : 'emerald'}
          />
          <StatCard
            icon={<Bell className="w-4 h-4" />}
            label="Info"
            value={String(announcements.length)}
            sublabel="pengumuman"
            color="purple"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {([
              { key: 'dashboard', label: 'Beranda', icon: <School className="w-3.5 h-3.5" /> },
              { key: 'attendance', label: 'Presensi', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
              { key: 'grades', label: 'Nilai', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { key: 'payments', label: 'SPP', icon: <CreditCard className="w-3.5 h-3.5" /> },
              { key: 'announcements', label: 'Info', icon: <Bell className="w-3.5 h-3.5" /> },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="flex-1 px-4 py-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              {/* Attendance Summary */}
              <SectionCard title="Rekap Kehadiran Bulan Ini" icon={<ClipboardCheck className="w-4 h-4" />}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                        strokeDasharray={`${attendancePercent} ${100 - attendancePercent}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-700">{attendancePercent}%</span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const count = attendanceSummary[key.toLowerCase() as keyof typeof attendanceSummary] as number;
                      return (
                        <div key={key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${cfg.color}`}>
                          <cfg.icon className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{cfg.label}: {count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>

              {/* Unpaid Payments Alert */}
              {payments.totalUnpaid > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-800 text-sm">Tunggakan SPP</p>
                      <p className="text-red-700 text-xs mt-1">
                        Terdapat {payments.unpaid.length} bulan SPP belum dibayar dengan total <strong>Rp {payments.totalUnpaid.toLocaleString('id-ID')}</strong>
                      </p>
                      <button
                        onClick={() => setActiveTab('payments')}
                        className="mt-2 text-xs text-red-700 font-medium underline underline-offset-2"
                      >
                        Lihat detail &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Announcements */}
              <SectionCard title="Pengumuman Terbaru" icon={<Bell className="w-4 h-4" />}>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map(a => (
                    <div key={a.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-2">
                        {a.isPinned && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{a.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{a.category}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Grade Summary */}
              <SectionCard title="Ringkasan Nilai" icon={<BookOpen className="w-4 h-4" />}>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${grades.average >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {grades.average}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Rata-rata</p>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-1.5">
                      {grades.list.slice(0, 4).map(g => (
                        <div key={g.id} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-24 truncate">{g.subject.name}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${g.score >= 75 ? 'bg-blue-500' : g.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${g.score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium w-8 text-right ${g.score >= 75 ? 'text-blue-600' : g.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {g.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <SectionCard title="Riwayat Kehadiran" icon={<ClipboardCheck className="w-4 h-4" />}>
              {/* Summary */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const count = attendanceSummary[key.toLowerCase() as keyof typeof attendanceSummary] as number;
                  return (
                    <div key={key} className={`text-center p-2 rounded-lg ${cfg.color}`}>
                      <cfg.icon className="w-4 h-4 mx-auto mb-1" />
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-[10px]">{cfg.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Daily Log */}
              <div className="space-y-2">
                {attendanceSummary.recent.map((a, i) => {
                  const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.HADIR;
                  const StatusIcon = status.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center border border-gray-100">
                        <span className="text-xs font-bold text-gray-700">
                          {new Date(a.date).getDate()}
                        </span>
                        <span className="text-[8px] text-gray-400">
                          {new Date(a.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                        {a.timeIn && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Masuk: {new Date(a.timeIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {a.note && (
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate">{a.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* GRADES TAB */}
          {activeTab === 'grades' && (
            <SectionCard title="Nilai Pengetahuan" icon={<BookOpen className="w-4 h-4" />}>
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${grades.average >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {grades.average}
                  </p>
                  <p className="text-[10px] text-gray-400">Rata-rata</p>
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-700">{grades.count}</p>
                  <p className="text-[10px] text-gray-400">Mata Pelajaran</p>
                </div>
              </div>

              <div className="space-y-2">
                {grades.list.map(g => (
                  <div key={g.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                      g.score >= 80 ? 'bg-blue-500' : g.score >= 70 ? 'bg-emerald-500' : g.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                      {g.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{g.subject.name}</p>
                      <p className="text-[10px] text-gray-400">{g.subject.code}</p>
                    </div>
                    <div className="w-16">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${g.score >= 75 ? 'bg-blue-500' : g.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${g.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <>
              {/* Summary */}
              <div className={`rounded-xl p-4 ${payments.totalUnpaid > 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payments.totalUnpaid > 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    <CreditCard className={`w-5 h-5 ${payments.totalUnpaid > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${payments.totalUnpaid > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                      {payments.totalUnpaid > 0 ? `Tunggakan: Rp ${payments.totalUnpaid.toLocaleString('id-ID')}` : 'SPP Lunas'}
                    </p>
                    <p className={`text-xs ${payments.totalUnpaid > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {payments.unpaid.length > 0 ? `${payments.unpaid.length} bulan belum dibayar` : 'Semua pembayaran sudah lunas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment List */}
              <SectionCard title="Riwayat SPP 2026" icon={<CreditCard className="w-4 h-4" />}>
                <div className="space-y-2">
                  {payments.all.map(p => {
                    const statusCfg = PAYMENT_STATUS[p.status] || PAYMENT_STATUS.BELUM_BAYAR;
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center border border-gray-100">
                          <span className="text-xs font-bold text-gray-700">{p.month}</span>
                          <span className="text-[8px] text-gray-400">{p.year}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            SPP {MONTH_NAMES[p.month]} {p.year}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rp {p.amount.toLocaleString('id-ID')}
                          </p>
                          {p.paidAt && (
                            <p className="text-[10px] text-gray-400">
                              Dibayar: {new Date(p.paidAt).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-1 rounded-full border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <SectionCard title="Pengumuman" icon={<Bell className="w-4 h-4" />}>
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-2 mb-2">
                      {a.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200">
                          <Star className="w-2.5 h-2.5" /> Penting
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{a.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">{a.title}</h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{a.content}</p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 safe-area-bottom">
        <div className="max-w-2xl mx-auto flex justify-around">
          {([
            { key: 'dashboard', label: 'Beranda', icon: School },
            { key: 'attendance', label: 'Presensi', icon: ClipboardCheck },
            { key: 'grades', label: 'Nilai', icon: BookOpen },
            { key: 'payments', label: 'SPP', icon: CreditCard },
            { key: 'announcements', label: 'Info', icon: Bell },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                activeTab === tab.key ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ============================================================
// Sub Components
// ============================================================

function StatCard({ icon, label, value, sublabel, color }: {
  icon: React.ReactNode; label: string; value: string; sublabel: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  const iconColorMap: Record<string, string> = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500',
  };

  return (
    <div className={`rounded-xl p-3 border ${colorMap[color]}`}>
      <div className={`${iconColorMap[color]} mb-1`}>{icon}</div>
      <p className="text-lg font-bold leading-tight">{value}</p>
      <p className="text-[9px] opacity-70 mt-0.5">{sublabel}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <span className="text-emerald-600">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
