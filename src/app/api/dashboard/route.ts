import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId required' }, { status: 400 });
  }

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      classroom: {
        include: {
          academicYear: true,
          waliKelas: { select: { name: true, phone: true } },
        },
      },
      tenant: { select: { name: true, slug: true, logo: true } },
    },
  });

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Attendance summary - show most recent month with data, or current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let attendances = await db.attendance.findMany({
    where: { studentId, date: { gte: startOfMonth } },
    orderBy: { date: 'desc' },
  });
  // If no data for current month, get the most recent 30 records
  if (attendances.length === 0) {
    attendances = await db.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  const attendanceSummary = {
    hadir: attendances.filter(a => a.status === 'HADIR').length,
    sakit: attendances.filter(a => a.status === 'SAKIT').length,
    izin: attendances.filter(a => a.status === 'IZIN').length,
    alpha: attendances.filter(a => a.status === 'ALPHA').length,
    total: attendances.length,
    recent: attendances.slice(0, 7),
  };

  // Payment summary
  const payments = await db.payment.findMany({
    where: { studentId, type: 'SPP' },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  const unpaidPayments = payments.filter(p => p.status === 'BELUM_BAYAR');
  const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);

  // Grades
  const grades = await db.grade.findMany({
    where: { studentId, type: 'PENGETAHUAN' },
    include: { subject: { select: { name: true, code: true } } },
    orderBy: { subject: { name: 'asc' } },
  });

  const avgGrade = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
    : 0;

  // Announcements
  const announcements = await db.announcement.findMany({
    where: {
      tenantId: student.tenantId,
      publishedAt: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: 5,
  });

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name,
      nis: student.nis,
      gender: student.gender,
      classroom: student.classroom?.name,
      level: student.classroom?.level,
      academicYear: student.classroom?.academicYear?.name,
      waliKelas: student.classroom?.waliKelas,
      tenant: student.tenant,
    },
    attendanceSummary,
    payments: {
      all: payments.slice(0, 12),
      unpaid: unpaidPayments,
      totalUnpaid,
    },
    grades: {
      list: grades,
      average: Math.round(avgGrade * 10) / 10,
      count: grades.length,
    },
    announcements,
  });
}
