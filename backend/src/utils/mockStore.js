import bcrypt from 'bcryptjs';

// Pre-hashed passwords for instant synchronous startup
const salt = bcrypt.genSaltSync(10);
const ADMIN_HASH = bcrypt.hashSync('admin123', salt);
const EMP_HASH = bcrypt.hashSync('Employee123', salt);

class MockStore {
  constructor() {
    this.users = [];
    this.attendance = [];
    this.leaves = [];
    this.initDemoData();
  }

  initDemoData() {
    // 1. Users
    this.users = [
      {
        _id: 'usr_admin_001',
        employeeId: 'HR001',
        name: 'Sarah Jenkins',
        email: 'admin@dayflow.com',
        password: ADMIN_HASH,
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
      },
      {
        _id: 'usr_emp_001',
        employeeId: 'EMP001',
        name: 'Alex Morgan',
        email: 'employee@dayflow.com',
        password: EMP_HASH,
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
        _id: 'usr_emp_002',
        employeeId: 'EMP002',
        name: 'Rohan Sharma',
        email: 'rohan@dayflow.com',
        password: EMP_HASH,
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
        _id: 'usr_emp_003',
        employeeId: 'EMP003',
        name: 'Elena Rostova',
        email: 'elena@dayflow.com',
        password: EMP_HASH,
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
        _id: 'usr_emp_004',
        employeeId: 'EMP004',
        name: 'David Kim',
        email: 'david@dayflow.com',
        password: EMP_HASH,
        role: 'employee',
        phone: '+1 (555) 321-9876',
        address: '500 Quality Lane, Seattle, WA',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        jobDetails: {
          department: 'Quality Assurance',
          designation: 'QA Automation Lead',
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

    // 2. Seed Past Attendance
    const today = new Date();
    this.attendance = [];

    for (let i = 10; i >= 0; i--) {
      const recordDate = new Date(today);
      recordDate.setDate(today.getDate() - i);
      const dateStr = recordDate.toISOString().split('T')[0];

      const dayOfWeek = recordDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const u of this.users) {
        if (i === 0) {
          // Today: Rohan and Elena checked in, Alex is ready to clock in
          if (u.email === 'rohan@dayflow.com' || u.email === 'elena@dayflow.com') {
            const checkInTime = new Date(recordDate);
            checkInTime.setHours(9, 15, 0);
            this.attendance.push({
              _id: `att_${u._id}_${dateStr}`,
              user: u,
              date: dateStr,
              checkIn: checkInTime,
              status: 'Present',
              workHours: 4.5,
              remarks: 'Active workday session',
            });
          }
        } else {
          const isAbsent = Math.random() < 0.08;
          const isHalfDay = !isAbsent && Math.random() < 0.12;

          const checkInTime = new Date(recordDate);
          checkInTime.setHours(9, 10, 0);

          const checkOutTime = new Date(recordDate);
          checkOutTime.setHours(isHalfDay ? 13 : 17, 30, 0);

          this.attendance.push({
            _id: `att_${u._id}_${dateStr}`,
            user: u,
            date: dateStr,
            checkIn: isAbsent ? null : checkInTime,
            checkOut: isAbsent ? null : checkOutTime,
            workHours: isAbsent ? 0 : isHalfDay ? 4.2 : 8.5,
            status: isAbsent ? 'Absent' : isHalfDay ? 'Half-day' : 'Present',
            remarks: isAbsent ? 'Unplanned absence' : 'Regular workday',
          });
        }
      }
    }

    // 3. Seed Leaves
    this.leaves = [
      {
        _id: 'lev_001',
        user: this.users[1], // Alex Morgan
        leaveType: 'Sick',
        startDate: new Date('2026-08-25'),
        endDate: new Date('2026-08-26'),
        daysCount: 2,
        reason: 'Flu symptoms and scheduled medical checkup with doctor.',
        status: 'Pending',
        adminComment: '',
        createdAt: new Date(),
      },
      {
        _id: 'lev_002',
        user: this.users[2], // Rohan Sharma
        leaveType: 'Paid',
        startDate: new Date('2026-08-28'),
        endDate: new Date('2026-08-30'),
        daysCount: 3,
        reason: 'Attending brother wedding ceremony in hometown.',
        status: 'Pending',
        adminComment: '',
        createdAt: new Date(),
      },
      {
        _id: 'lev_003',
        user: this.users[3], // Elena
        leaveType: 'Casual',
        startDate: new Date('2026-08-10'),
        endDate: new Date('2026-08-11'),
        daysCount: 2,
        reason: 'Personal family matters and relocation errand.',
        status: 'Approved',
        adminComment: 'Approved. Enjoy your time off!',
        reviewedBy: this.users[0],
        reviewedAt: new Date('2026-08-08'),
        createdAt: new Date(),
      },
      {
        _id: 'lev_004',
        user: this.users[4], // David Kim
        leaveType: 'Unpaid',
        startDate: new Date('2026-07-20'),
        endDate: new Date('2026-07-22'),
        daysCount: 3,
        reason: 'Extended personal trip.',
        status: 'Rejected',
        adminComment: 'Rejected due to critical release freeze during that week.',
        reviewedBy: this.users[0],
        reviewedAt: new Date('2026-07-15'),
        createdAt: new Date(),
      },
    ];
  }
}

export const mockStore = new MockStore();
