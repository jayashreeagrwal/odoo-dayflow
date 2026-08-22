import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Clearing existing database collections...');

    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});

    console.log('🌱 Seeding Users...');

    // User's pre-save hook hashes these plaintext seed passwords once.
    const adminPassword = 'admin123';
    const employeePassword = 'Employee123';

    // 1. Create Admin
    const adminUser = await User.create({
      employeeId: 'HR001',
      name: 'Sarah Jenkins',
      email: 'admin@dayflow.com',
      emailVerified: true,
      password: adminPassword,
      role: 'hr_admin',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Springfield',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      jobDetails: {
        department: 'Human Resources',
        designation: 'Head of People & Culture',
        joiningDate: new Date('2023-01-15'),
        employmentType: 'Full-Time',
        status: 'Active',
      },
      salaryStructure: {
        basic: 65000,
        hra: 25000,
        allowances: 10000,
        deductions: 6000,
        netSalary: 94000,
      },
    });

    // 2. Create Employees
    const employeesData = [
      {
        employeeId: 'EMP001',
        name: 'Alex Morgan',
        email: 'employee@dayflow.com',
        emailVerified: true,
        password: employeePassword,
        role: 'employee',
        phone: '+1 (555) 987-6543',
        address: '404 Silicon Boulevard, Suite 300, San Francisco, CA',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        jobDetails: {
          department: 'Engineering',
          designation: 'Senior Frontend Developer',
          joiningDate: new Date('2024-03-01'),
          employmentType: 'Full-Time',
          status: 'Active',
        },
        salaryStructure: {
          basic: 50000,
          hra: 20000,
          allowances: 8000,
          deductions: 5000,
          netSalary: 73000,
        },
      },
      {
        employeeId: 'EMP002',
        name: 'Rohan Sharma',
        email: 'rohan@dayflow.com',
        emailVerified: true,
        password: employeePassword,
        role: 'employee',
        phone: '+1 (555) 456-7890',
        address: '12 Tech Park Avenue, Austin, TX',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        jobDetails: {
          department: 'Engineering',
          designation: 'Backend Systems Engineer',
          joiningDate: new Date('2024-06-15'),
          employmentType: 'Full-Time',
          status: 'Active',
        },
        salaryStructure: {
          basic: 48000,
          hra: 19000,
          allowances: 7000,
          deductions: 4500,
          netSalary: 69500,
        },
      },
      {
        employeeId: 'EMP003',
        name: 'Elena Rostova',
        email: 'elena@dayflow.com',
        emailVerified: true,
        password: employeePassword,
        role: 'employee',
        phone: '+1 (555) 678-1234',
        address: '88 Creative Studio Road, New York, NY',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        jobDetails: {
          department: 'Design',
          designation: 'Product UI/UX Lead',
          joiningDate: new Date('2024-01-10'),
          employmentType: 'Full-Time',
          status: 'Active',
        },
        salaryStructure: {
          basic: 46000,
          hra: 18000,
          allowances: 6000,
          deductions: 4000,
          netSalary: 66000,
        },
      },
      {
        employeeId: 'EMP004',
        name: 'David Kim',
        email: 'david@dayflow.com',
        emailVerified: true,
        password: employeePassword,
        role: 'employee',
        phone: '+1 (555) 321-9876',
        address: '500 Quality Lane, Seattle, WA',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        jobDetails: {
          department: 'Quality Assurance',
          designation: 'QA Automation Specialist',
          joiningDate: new Date('2024-09-01'),
          employmentType: 'Full-Time',
          status: 'Active',
        },
        salaryStructure: {
          basic: 42000,
          hra: 16000,
          allowances: 5000,
          deductions: 3500,
          netSalary: 59500,
        },
      },
    ];

    const createdEmployees = [];
    for (const empData of employeesData) {
      const emp = await User.create(empData);
      createdEmployees.push(emp);
    }

    console.log(`✅ Created 1 HR Admin and ${createdEmployees.length} Employees`);

    // 3. Seed Attendance History for past 10 days
    console.log('🌱 Seeding Attendance history...');
    const allUsers = [adminUser, ...createdEmployees];
    const today = new Date();

    for (let i = 10; i >= 0; i--) {
      const recordDate = new Date(today);
      recordDate.setDate(today.getDate() - i);
      const dateStr = recordDate.toISOString().split('T')[0];

      // Skip weekend days (Saturday=6, Sunday=0) for realism
      const dayOfWeek = recordDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const u of allUsers) {
        if (i === 0) {
          // For today, seed check-in for some users and leave Alex Morgan ready to check-in
          if (u.email !== 'employee@dayflow.com') {
            const checkInTime = new Date(recordDate);
            checkInTime.setHours(9, 15 + Math.floor(Math.random() * 20), 0);

            await Attendance.create({
              user: u._id,
              date: dateStr,
              checkIn: checkInTime,
              status: 'Present',
              workHours: 4.5,
              remarks: 'Active working session',
            });
          }
        } else {
          // Past dates
          const isAbsent = Math.random() < 0.08;
          const isHalfDay = !isAbsent && Math.random() < 0.12;

          const checkInTime = new Date(recordDate);
          checkInTime.setHours(9, Math.floor(Math.random() * 30), 0);

          const checkOutTime = new Date(recordDate);
          checkOutTime.setHours(isHalfDay ? 13 : 17, 30 + Math.floor(Math.random() * 25), 0);

          const hours = isAbsent ? 0 : isHalfDay ? 4.2 : 8.5;

          await Attendance.create({
            user: u._id,
            date: dateStr,
            checkIn: isAbsent ? null : checkInTime,
            checkOut: isAbsent ? null : checkOutTime,
            workHours: hours,
            status: isAbsent ? 'Absent' : isHalfDay ? 'Half-day' : 'Present',
            remarks: isAbsent ? 'Unplanned absence' : 'Regular workday',
          });
        }
      }
    }

    console.log('✅ Seeded past Attendance records');

    // 4. Seed Leave Requests
    console.log('🌱 Seeding Leave Requests...');
    const alex = createdEmployees[0];
    const rohan = createdEmployees[1];
    const elena = createdEmployees[2];
    const david = createdEmployees[3];

    await Leave.create([
      {
        user: alex._id,
        leaveType: 'Sick',
        startDate: new Date('2026-08-25'),
        endDate: new Date('2026-08-26'),
        daysCount: 2,
        reason: 'Flu symptoms and scheduled medical checkup with doctor.',
        status: 'Pending',
      },
      {
        user: rohan._id,
        leaveType: 'Paid',
        startDate: new Date('2026-08-28'),
        endDate: new Date('2026-08-30'),
        daysCount: 3,
        reason: 'Attending brother wedding ceremony in hometown.',
        status: 'Pending',
      },
      {
        user: elena._id,
        leaveType: 'Casual',
        startDate: new Date('2026-08-10'),
        endDate: new Date('2026-08-11'),
        daysCount: 2,
        reason: 'Personal family matters and relocation errand.',
        status: 'Approved',
        adminComment: 'Approved. Enjoy your time off!',
        reviewedBy: adminUser._id,
        reviewedAt: new Date('2026-08-08'),
      },
      {
        user: david._id,
        leaveType: 'Unpaid',
        startDate: new Date('2026-07-20'),
        endDate: new Date('2026-07-22'),
        daysCount: 3,
        reason: 'Extended personal trip.',
        status: 'Rejected',
        adminComment: 'Rejected due to critical release freeze during that week.',
        reviewedBy: adminUser._id,
        reviewedAt: new Date('2026-07-15'),
      },
    ]);

    console.log('✅ Seeded Leave Requests');

    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('👑 HR ADMIN DEMO ACCOUNT:');
    console.log('   Email:    admin@dayflow.com');
    console.log('   Password: admin123');
    console.log('   Role:     HR Admin (Full Access)');
    console.log('----------------------------------------------------');
    console.log('👤 EMPLOYEE DEMO ACCOUNT:');
    console.log('   Email:    employee@dayflow.com');
    console.log('   Password: Employee123');
    console.log('   Role:     Employee (Self-service Access)');
    console.log('----------------------------------------------------');

    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
