import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import { mockStore } from '../utils/mockStore.js';

const getTodayDateString = (d = new Date()) => {
  return d.toISOString().split('T')[0];
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = getTodayDateString();
    const isHrAdmin = req.user.role === 'hr_admin';

    if (global.USE_IN_MEMORY_DB) {
      if (isHrAdmin) {
        const totalEmployees = mockStore.users.filter((u) => u.role === 'employee').length;
        const activeEmployees = mockStore.users.filter(
          (u) => u.role === 'employee' && u.jobDetails?.status === 'Active'
        ).length;

        const todayAttendance = mockStore.attendance.filter((a) => a.date === today);
        const presentToday = todayAttendance.filter((r) => r.status === 'Present').length;
        const halfDayToday = todayAttendance.filter((r) => r.status === 'Half-day').length;
        const onLeaveToday = todayAttendance.filter((r) => r.status === 'Leave').length;
        const absentToday = Math.max(0, totalEmployees - presentToday - halfDayToday - onLeaveToday);

        const pendingLeaves = mockStore.leaves.filter((l) => l.status === 'Pending').length;
        const recentLeaves = mockStore.leaves.filter((l) => l.status === 'Pending').slice(0, 5);

        return res.json({
          success: true,
          role: 'hr_admin',
          stats: {
            totalEmployees,
            activeEmployees,
            presentToday,
            halfDayToday,
            onLeaveToday,
            absentToday,
            attendanceRate: totalEmployees > 0 ? Math.round(((presentToday + halfDayToday) / totalEmployees) * 100) : 0,
            pendingLeaves,
          },
          recentLeaves,
          todayAttendance: todayAttendance.slice(0, 5),
        });
      } else {
        const todayRecord = mockStore.attendance.find((a) => a.user._id === req.user._id && a.date === today);
        const monthlyRecords = mockStore.attendance.filter((a) => a.user._id === req.user._id);
        const monthlyPresent = monthlyRecords.filter((r) => r.status === 'Present').length;
        const totalHoursWorked = monthlyRecords.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

        const myLeaves = mockStore.leaves.filter((l) => l.user._id === req.user._id);
        const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending').length;
        const approvedLeaves = myLeaves.filter((l) => l.status === 'Approved').length;
        const userProfile = mockStore.users.find((u) => u._id === req.user._id);

        return res.json({
          success: true,
          role: 'employee',
          today: {
            date: today,
            isCheckedIn: Boolean(todayRecord?.checkIn),
            isCheckedOut: Boolean(todayRecord?.checkOut),
            checkIn: todayRecord?.checkIn || null,
            checkOut: todayRecord?.checkOut || null,
            status: todayRecord?.status || 'Not Checked In',
            workHours: todayRecord?.workHours || 0,
          },
          monthlyStats: {
            daysPresent: monthlyPresent,
            totalHours: Math.round(totalHoursWorked * 10) / 10,
            averageHoursPerDay: monthlyPresent > 0 ? Math.round((totalHoursWorked / monthlyPresent) * 10) / 10 : 0,
            pendingLeaves,
            approvedLeaves,
            leaveBalance: { paid: 12 - approvedLeaves, sick: 8, casual: 5 },
          },
          salary: userProfile?.salaryStructure,
          recentLeaves: myLeaves.slice(0, 4),
        });
      }
    }

    // Standard MongoDB
    if (isHrAdmin) {
      const totalEmployees = await User.countDocuments({ role: 'employee' });
      const activeEmployees = await User.countDocuments({ role: 'employee', 'jobDetails.status': 'Active' });
      const todayAttendance = await Attendance.find({ date: today }).populate('user', 'name email employeeId avatar jobDetails');

      const presentToday = todayAttendance.filter((r) => r.status === 'Present').length;
      const halfDayToday = todayAttendance.filter((r) => r.status === 'Half-day').length;
      const onLeaveToday = todayAttendance.filter((r) => r.status === 'Leave').length;
      const absentToday = Math.max(0, totalEmployees - presentToday - halfDayToday - onLeaveToday);

      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
      const recentLeaves = await Leave.find({ status: 'Pending' })
        .populate('user', 'name email employeeId avatar jobDetails')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.json({
        success: true,
        role: 'hr_admin',
        stats: {
          totalEmployees,
          activeEmployees,
          presentToday,
          halfDayToday,
          onLeaveToday,
          absentToday,
          attendanceRate: totalEmployees > 0 ? Math.round(((presentToday + halfDayToday) / totalEmployees) * 100) : 0,
          pendingLeaves,
        },
        recentLeaves,
        todayAttendance: todayAttendance.slice(0, 5),
      });
    } else {
      const todayRecord = await Attendance.findOne({ user: req.user._id, date: today });
      const currentMonth = today.substring(0, 7);
      const monthlyRecords = await Attendance.find({ user: req.user._id, date: { $regex: `^${currentMonth}` } });

      const monthlyPresent = monthlyRecords.filter((r) => r.status === 'Present').length;
      const totalHoursWorked = monthlyRecords.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

      const myLeaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
      const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending').length;
      const approvedLeaves = myLeaves.filter((l) => l.status === 'Approved').length;
      const userProfile = await User.findById(req.user._id);

      return res.json({
        success: true,
        role: 'employee',
        today: {
          date: today,
          isCheckedIn: Boolean(todayRecord?.checkIn),
          isCheckedOut: Boolean(todayRecord?.checkOut),
          checkIn: todayRecord?.checkIn || null,
          checkOut: todayRecord?.checkOut || null,
          status: todayRecord?.status || 'Not Checked In',
          workHours: todayRecord?.workHours || 0,
        },
        monthlyStats: {
          daysPresent: monthlyPresent,
          totalHours: Math.round(totalHoursWorked * 10) / 10,
          averageHoursPerDay: monthlyPresent > 0 ? Math.round((totalHoursWorked / monthlyPresent) * 10) / 10 : 0,
          pendingLeaves,
          approvedLeaves,
          leaveBalance: { paid: 12 - approvedLeaves, sick: 8, casual: 5 },
        },
        salary: userProfile?.salaryStructure,
        recentLeaves: myLeaves.slice(0, 4),
      });
    }
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
};
