import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SIMT MTs database...');

  // 1. Create Tenant (Yayasan)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'MTs Al-Hikmah Malang',
      slug: 'mts-al-hikmah',
      code: 'MTS-AH-001',
      address: 'Jl. Raden Panji Suryo Niti Kusuma No. 12, Kedungkandang',
      city: 'Malang',
      province: 'Jawa Timur',
      phone: '0341-712345',
      email: 'info@mtsalhikmah.sch.id',
      npsn: '20512345',
      nism: '11123205001',
      isActive: true,
      subscriptionEnd: new Date('2026-12-31'),
      maxStudents: 500,
      currentStudents: 288,
    },
  });
  console.log(`✅ Tenant: ${tenant.name}`);

  // 2. Create Users
  const kepalaMadrasah = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'H. Ahmad Fauzi, M.Pd.I',
      email: 'kepala@mtsalhikmah.sch.id',
      password: '$2b$10$dummyHashForDemoPurposesOnly123',
      phone: '081234567890',
      role: 'KEPALA_MADRASAH',
      nuptk: '1234567890123456',
      nip: '196801011990031001',
    },
  });

  const waliKelas7A = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Siti Nurhaliza, S.Pd',
      email: 'siti.nurhaliza@mtsalhikmah.sch.id',
      password: '$2b$10$dummyHashForDemoPurposesOnly123',
      phone: '081234567891',
      role: 'WALI_KELAS',
      nuptk: '1234567890123457',
    },
  });

  const guruMatematika = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Budi Santoso, S.Pd',
      email: 'budi.santoso@mtsalhikmah.sch.id',
      password: '$2b$10$dummyHashForDemoPurposesOnly123',
      phone: '081234567892',
      role: 'GURU',
    },
  });

  const tataUsaha = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Rina Wulandari',
      email: 'rina.wulandari@mtsalhikmah.sch.id',
      password: '$2b$10$dummyHashForDemoPurposesOnly123',
      phone: '081234567893',
      role: 'TATA_USAHA',
    },
  });

  console.log(`✅ Users: ${[kepalaMadrasah, waliKelas7A, guruMatematika, tataUsaha].length} created`);

  // 3. Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      tenantId: tenant.id,
      name: '2025/2026',
      semester: 2,
      isActive: true,
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-06-15'),
    },
  });
  console.log(`✅ Academic Year: ${academicYear.name} Semester ${academicYear.semester}`);

  // 4. Classrooms
  const classes = await Promise.all([
    prisma.classroom.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: 'VII-A',
        level: 7,
        capacity: 36,
        waliKelasId: waliKelas7A.id,
      },
    }),
    prisma.classroom.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: 'VIII-B',
        level: 8,
        capacity: 36,
      },
    }),
    prisma.classroom.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: 'IX-C',
        level: 9,
        capacity: 36,
      },
    }),
  ]);
  console.log(`✅ Classrooms: ${classes.map(c => c.name).join(', ')}`);

  // 5. Subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        tenantId: tenant.id,
        classroomId: classes[0].id,
        name: 'Matematika',
        code: 'MTK',
        hoursPerWeek: 5,
        teacherId: guruMatematika.id,
        category: 'UMUM',
      },
    }),
    prisma.subject.create({
      data: {
        tenantId: tenant.id,
        classroomId: classes[0].id,
        name: 'Bahasa Arab',
        code: 'BAR',
        hoursPerWeek: 4,
        category: 'ARAB',
      },
    }),
    prisma.subject.create({
      data: {
        tenantId: tenant.id,
        classroomId: classes[0].id,
        name: 'Al-Quran & Hadits',
        code: 'QHD',
        hoursPerWeek: 3,
        category: 'QURAN',
      },
    }),
    prisma.subject.create({
      data: {
        tenantId: tenant.id,
        classroomId: classes[0].id,
        name: 'IPA',
        code: 'IPA',
        hoursPerWeek: 4,
        category: 'UMUM',
      },
    }),
    prisma.subject.create({
      data: {
        tenantId: tenant.id,
        classroomId: classes[0].id,
        name: 'Bahasa Inggris',
        code: 'BIG',
        hoursPerWeek: 3,
        category: 'UMUM',
      },
    }),
    prisma.subject.create({
      data: {
        tenantId: tenant.id,
        classroomId: classes[0].id,
        name: 'Pendidikan Agama Islam',
        code: 'PAI',
        hoursPerWeek: 3,
        category: 'AGAMA_ISLAM',
      },
    }),
  ]);
  console.log(`✅ Subjects: ${subjects.length} created`);

  // 6. Students
  const students = [];
  const studentNames = [
    { name: 'Ahmad Rizki Pratama', gender: 'L' as const, father: 'H. Rizki Setiawan', mother: 'Hj. Siti Aminah' },
    { name: 'Fatimah Azzahra', gender: 'P' as const, father: 'Abdul Karim', mother: 'Khadijah' },
    { name: 'Muhammad Farhan', gender: 'L' as const, father: 'Hasan Basri', mother: 'Nur Jannah' },
    { name: 'Aisyah Putri Ramadhani', gender: 'P' as const, father: 'Ramadhani', mother: 'Dewi Sartika' },
    { name: 'Umar Hakim', gender: 'L' as const, father: 'Hakim Zarkasji', mother: 'Yumni Safitri' },
    { name: 'Zahra Kamila', gender: 'P' as const, father: 'M. Kamal', mother: 'Halimah' },
    { name: 'Bilal Ibrahim', gender: 'L' as const, father: 'Ibrahim Hidayat', mother: 'Maryam' },
    { name: 'Khadijah Nuraini', gender: 'P' as const, father: 'Nuraini', mother: 'Safura' },
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    const student = await prisma.student.create({
      data: {
        tenantId: tenant.id,
        classroomId: classes[0].id,
        nis: `2025${String(i + 1).padStart(4, '0')}`,
        nisn: `00${String(12345600 + i)}`,
        name: s.name,
        gender: s.gender,
        birthPlace: 'Malang',
        birthDate: new Date(2012, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `Jl. Merdeka No. ${i + 1}, Kedungkandang, Malang`,
        fatherName: s.father,
        fatherPhone: `081234567${String(900 + i)}`,
        motherName: s.mother,
        motherPhone: `081234567${String(910 + i)}`,
        parentEmail: `ortu${i + 1}@email.com`,
        nik: `3507${String(2012010000 + i)}`,
        religion: 'Islam',
        enrollmentDate: new Date('2025-07-15'),
        isActive: true,
      },
    });
    students.push(student);
  }
  console.log(`✅ Students: ${students.length} created`);

  // 7. Attendance (30 days of data for first 3 students)
  const attendanceData = [];
  const statuses = ['HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'SAKIT', 'IZIN', 'HADIR'] as const;
  for (const student of students.slice(0, 3)) {
    for (let day = 1; day <= 30; day++) {
      const date = new Date(2026, 4, day); // May 2026
      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      attendanceData.push(
        prisma.attendance.create({
          data: {
            tenantId: tenant.id,
            studentId: student.id,
            date,
            status,
            timeIn: status === 'HADIR' ? new Date(2026, 4, day, 6, 45 + Math.floor(Math.random() * 15)) : null,
            timeOut: status === 'HADIR' ? new Date(2026, 4, day, 13, 30 + Math.floor(Math.random() * 30)) : null,
            note: status === 'SAKIT' ? 'Sakit demam, ada surat dokter' : status === 'IZIN' ? 'Izin keperluan keluarga' : null,
            recordedBy: waliKelas7A.id,
          },
        })
      );
    }
  }
  const attendances = await Promise.all(attendanceData);
  console.log(`✅ Attendances: ${attendances.length} records`);

  // 8. Grades
  const gradeData = [];
  for (const student of students.slice(0, 4)) {
    for (const subject of subjects) {
      gradeData.push(
        prisma.grade.create({
          data: {
            tenantId: tenant.id,
            studentId: student.id,
            subjectId: subject.id,
            teacherId: guruMatematika.id,
            type: 'PENGETAHUAN',
            score: 70 + Math.floor(Math.random() * 25),
          },
        }),
        prisma.grade.create({
          data: {
            tenantId: tenant.id,
            studentId: student.id,
            subjectId: subject.id,
            teacherId: guruMatematika.id,
            type: 'KETERAMPILAN',
            score: 72 + Math.floor(Math.random() * 23),
          },
        })
      );
    }
  }
  const grades = await Promise.all(gradeData);
  console.log(`✅ Grades: ${grades.length} records`);

  // 9. Payments (SPP Jan-Jun 2026)
  const paymentData = [];
  const months = [1, 2, 3, 4, 5, 6];
  for (const student of students) {
    for (const month of months) {
      const isPaid = month <= 4; // Jan-Apr paid, May-Jun unpaid
      paymentData.push(
        prisma.payment.create({
          data: {
            tenantId: tenant.id,
            studentId: student.id,
            type: 'SPP',
            amount: 250000, // Rp 250.000/bulan
            month,
            year: 2026,
            status: isPaid ? 'LUNAS' : 'BELUM_BAYAR',
            paidAt: isPaid ? new Date(2026, month - 1, 10 + Math.floor(Math.random() * 5)) : null,
            paymentMethod: isPaid ? 'transfer' : null,
            dueDate: new Date(2026, month - 1, 10),
          },
        })
      );
    }
  }
  const payments = await Promise.all(paymentData);
  console.log(`✅ Payments: ${payments.length} records`);

  // 10. Announcements
  const announcements = await Promise.all([
    prisma.announcement.create({
      data: {
        tenantId: tenant.id,
        title: 'Libur Hari Raya Idul Fitri 1447 H',
        content: 'Diberitahukan kepada seluruh siswa dan wali murid bahwa kegiatan belajar mengajar diliburkan mulai tanggal 15-23 Maret 2026 dalam rangka Hari Raya Idul Fitri 1447 H. Kegiatan KBM kembali normal pada tanggal 24 Maret 2026. Selamat merayakan Idul Fitri, mohon maaf lahir dan batin.',
        category: 'keagamaan',
        isPinned: true,
        publishedAt: new Date('2026-03-01'),
        expiresAt: new Date('2026-03-25'),
      },
    }),
    prisma.announcement.create({
      data: {
        tenantId: tenant.id,
        title: 'Jadwal UAS Semester Genap 2025/2026',
        content: 'Ujian Akhir Semester Genap akan dilaksanakan pada tanggal 1-10 Juni 2026. Silakan persiapkan diri dengan baik. Jadwal ujian per mata pelajaran akan dibagikan oleh wali kelas masing-masing. Siswa wajib hadir 30 menit sebelum ujian dimulai.',
        category: 'akademik',
        isPinned: true,
        publishedAt: new Date('2026-05-15'),
      },
    }),
    prisma.announcement.create({
      data: {
        tenantId: tenant.id,
        title: 'Pembayaran SPP Bulan Mei-Juni 2026',
        content: 'Mohon untuk segera menyelesaikan pembayaran SPP bulan Mei dan Juni 2026 sebelum tanggal 10 masing-masing bulan. Pembayaran dapat dilakukan melalui transfer bank ke rekening BRI 0123-4567-8901 a.n. MTs Al-Hikmah atau langsung ke bagian TU. Keterlambatan pembayaran akan dikenakan denda sebesar Rp 10.000 per bulan.',
        category: 'keuangan',
        publishedAt: new Date('2026-05-01'),
      },
    }),
    prisma.announcement.create({
      data: {
        tenantId: tenant.id,
        title: 'Lomba HUT RI ke-81',
        content: 'Dalam rangka memperingati HUT Kemerdekaan RI ke-81, MTs Al-Hikmah menyelenggarakan berbagai lomba: pidato, puisi, kaligrafi, dan tahfidz. Pendaftaran dibuka sampai 10 Agustus 2026 di perpustakaan. Setiap kelas wajib mengirimkan minimal 2 peserta.',
        category: 'umum',
        publishedAt: new Date('2026-07-20'),
      },
    }),
  ]);
  console.log(`✅ Announcements: ${announcements.length} created`);

  // 11. WhatsApp Config
  await prisma.whatsappConfig.create({
    data: {
      tenantId: tenant.id,
      sessionName: 'mts-al-hikmah-wa',
      isConnected: true,
      phoneNumber: '6281234567890',
      lastConnectedAt: new Date(),
    },
  });
  console.log('✅ WhatsApp Config created');

  console.log('\n🎉 Seeding complete! SIMT MTs demo data ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
