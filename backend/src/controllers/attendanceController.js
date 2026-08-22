import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { mockStore } from '../utils/mockStore.js';

const getTodayDateString = (d = new Date()) => {
  return d.toISOString().split('T')[0];
};

export const checkIn = async (req, res) => {
  try {
    const today = getTodayDateString();
    const now = new Date();

    if (global.USE_IN_MEMORY_DB) {
      let record = mockStore.attendance.find((a) => a.user._id === req.user._id && a.date === today);
      if (record && record.checkIn) {
        return res.status(400).json({
          message: `Already checked in today at ${new Date(record.checkIn).toLocaleTimeString()}`,
          record,
        });
      }

      if (!record) {
        record = {
          _id: `att_${req.user._id}_${today}`,
          user: req.user,
          date: today,
          checkIn: now,
          status: 'Present',
          workHours: 0,
          remarks: 'Standard workday log',
        };
        mockStore.attendance.unshift(record);
      } else {
        record.checkIn = now;
        record.status = 'Present';
      }

      return res.status(200).json({
        success: true,
        message: 'Checked in successfully! Have a productive day.',
        record,
      });
    }

    // Standard MongoDB
    let record = await Attendance.findOne({ user: req.user._id, date: today });
    if (record && record.checkIn) {
      return res.status(400).json({
        message: `Already checked in today at ${new Date(record.checkIn).toLocaleTimeString()}`,
        record,
      });
    }

    if (!record) {
      record = new Attendance({
        user: req.user._id,
        date: today,
        checkIn: now,
        status: 'Present',
      });
    } else {
      record.checkIn = now;
      record.status = 'Present';
    }

    await record.save();
    res.status(200).json({
      success: true,
      message: 'Checked in successfully! Have a productive day.',
      record,
    });
  } catch (error) {
    console.error('CheckIn Error:', error);
    res.status(500).json({ message: 'Server error during check-in' });
  }
};

export const checkOut = async (req, res) => {
  try {
    const today = getTodayDateString();
    const now = new Date();

    if (global.USE_IN_MEMORY_DB) {
      const record = mockStore.attendance.find((a) => a.user._id === req.user._id && a.date === today);
      if (!record || !record.checkIn) {
        return res.status(400).json({ message: 'You have not checked in today yet.' });
      }
      if (record.checkOut) {
        return res.status(400).json({
          message: `Already checked out today at ${new Date(record.checkOut).toLocaleTimeString()}`,
          record,
        });
      }

      record.checkOut = now;
      const diffMs = now.getTime() - new Date(record.checkIn).getTime();
      const hours = Math.max(0.5, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
      record.workHours = hours;
      record.status = hours < 4 ? 'Half-day' : 'Present';

      return res.status(200).json({
        success: true,
        message: `Checked out successfully! Total work time: ${hours} hrs.`,
        record,
      });
    }

    // Standard MongoDB
    const record = await Attendance.findOne({ user: req.user._id, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'You have not checked in today yet.' });
    }
    if (record.checkOut) {
      return res.status(400).json({
        message: `Already checked out today at ${new Date(record.checkOut).toLocaleTimeString()}`,
        record,
      });
    }

    record.checkOut = now;
    const diffMs = now.getTime() - new Date(record.checkIn).getTime();
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    record.workHours = hours;
    record.status = hours < 4 ? 'Half-day' : 'Present';

    await record.save();
    res.status(200).json({
      success: true,
      message: `Checked out successfully! Total work time: ${hours} hrs.`,
      record,
    });
  } catch (error) {
    console.error('CheckOut Error:', error);
    res.status(500).json({ message: 'Server error during check-out' });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    const today = getTodayDateString();

    if (global.USE_IN_MEMORY_DB) {
      const record = mockStore.attendance.find((a) => a.user._id === req.user._id && a.date === today);
      return res.json({
        success: true,
        today,
        record: record || null,
        isCheckedIn: Boolean(record?.checkIn),
        isCheckedOut: Boolean(record?.checkOut),
      });
    }

    const record = await Attendance.findOne({ user: req.user._id, date: today });
    res.json({
      success: true,
      today,
      record: record || null,
      isCheckedIn: Boolean(record?.checkIn),
      isCheckedOut: Boolean(record?.checkOut),
    });
  } catch (error) {
    console.error('Get Today Attendance Error:', error);
    res.status(500).json({ message: 'Server error fetching today attendance' });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { month } = req.query;

    if (global.USE_IN_MEMORY_DB) {
      let records = mockStore.attendance.filter((a) => a.user._id === req.user._id);
      if (month) records = records.filter((a) => a.date.startsWith(month));

      const totalDays = records.length;
      const presentCount = records.filter((r) => r.status === 'Present').length;
      const halfDayCount = records.filter((r) => r.status === 'Half-day').length;
      const totalHours = records.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

      return res.json({
        success: true,
        records,
        stats: {
          totalDays,
          presentCount,
          halfDayCount,
          totalHours: Math.round(totalHours * 10) / 10,
          averageHours: totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0,
        },
      });
    }

    let query = { user: req.user._id };
    if (month) query.date = { $regex: `^${month}` };

    const records = await Attendance.find(query).sort({ date: -1 }).limit(60);
    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const halfDayCount = records.filter((r) => r.status === 'Half-day').length;
    const totalHours = records.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

    res.json({
      success: true,
      records,
      stats: {
        totalDays,
        presentCount,
        halfDayCount,
        totalHours: Math.round(totalHours * 10) / 10,
        averageHours: totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0,
      },
    });
  } catch (error) {
    console.error('Get My Attendance Error:', error);
    res.status(500).json({ message: 'Server error fetching attendance history' });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const { date, status, department, search } = req.query;
    const targetDate = date || getTodayDateString();

    if (global.USE_IN_MEMORY_DB) {
      let filtered = mockStore.attendance.filter((a) => a.date === targetDate);
      if (status && status !== 'All') filtered = filtered.filter((a) => a.status === status);
      if (department && department !== 'All') {
        filtered = filtered.filter((a) => a.user?.jobDetails?.department === department);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.user?.name?.toLowerCase().includes(s) ||
            a.user?.email?.toLowerCase().includes(s) ||
            a.user?.employeeId?.toLowerCase().includes(s)
        );
      }

      const totalEmployees = mockStore.users.filter((u) => u.role === 'employee').length;
      const presentToday = filtered.filter((r) => r.status === 'Present').length;
      const halfDayToday = filtered.filter((r) => r.status === 'Half-day').length;
      const onLeaveToday = filtered.filter((r) => r.status === 'Leave').length;

      return res.json({
        success: true,
        date: targetDate,
        count: filtered.length,
        records: filtered,
        summary: {
          totalEmployees,
          presentToday,
          halfDayToday,
          onLeaveToday,
          absentToday: Math.max(0, totalEmployees - presentToday - halfDayToday - onLeaveToday),
        },
      });
    }

    // Standard MongoDB
    let query = { date: targetDate };
    if (status && status !== 'All') query.status = status;

    const records = await Attendance.find(query)
      .populate('user', 'name email employeeId avatar jobDetails')
      .sort({ createdAt: -1 });

    let filteredRecords = records.filter((r) => r.user !== null);
    if (department && department !== 'All') {
      filteredRecords = filteredRecords.filter((r) => r.user?.jobDetails?.department === department);
    }
    if (search) {
      const s = search.toLowerCase();
      filteredRecords = filteredRecords.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(s) ||
          r.user?.email?.toLowerCase().includes(s) ||
          r.user?.employeeId?.toLowerCase().includes(s)
      );
    }

    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const presentToday = filteredRecords.filter((r) => r.status === 'Present').length;
    const halfDayToday = filteredRecords.filter((r) => r.status === 'Half-day').length;
    const onLeaveToday = filteredRecords.filter((r) => r.status === 'Leave').length;

    res.json({
      success: true,
      date: targetDate,
      count: filteredRecords.length,
      records: filteredRecords,
      summary: {
        totalEmployees,
        presentToday,
        halfDayToday,
        onLeaveToday,
        absentToday: Math.max(0, totalEmployees - presentToday - halfDayToday - onLeaveToday),
      },
    });
  } catch (error) {
    console.error('Get All Attendance Error:', error);
    res.status(500).json({ message: 'Server error fetching company attendance' });
  }
};

export const markManualAttendance = async (req, res) => {
  try {
    const { userId, date, status, workHours, remarks } = req.body;

    if (!userId || !date || !status) {
      return res.status(400).json({ message: 'User ID, Date, and Status are required' });
    }

    if (global.USE_IN_MEMORY_DB) {
      const employee = mockStore.users.find((u) => u._id === userId);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });

      let record = mockStore.attendance.find((a) => a.user._id === userId && a.date === date);
      if (!record) {
        record = {
          _id: `att_${userId}_${date}`,
          user: employee,
          date,
          status,
          workHours: workHours || (status === 'Present' ? 8 : status === 'Half-day' ? 4 : 0),
          remarks: remarks || 'Marked by HR Admin',
        };
        mockStore.attendance.unshift(record);
      } else {
        record.status = status;
        if (workHours !== undefined) record.workHours = workHours;
        if (remarks) record.remarks = remarks;
      }

      return res.json({ success: true, message: 'Attendance record updated successfully', record });
    }

    const employee = await User.findById(userId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    let record = await Attendance.findOne({ user: userId, date });
    if (!record) {
      record = new Attendance({
        user: userId,
        date,
        status,
        workHours: workHours || (status === 'Present' ? 8 : status === 'Half-day' ? 4 : 0),
        remarks: remarks || 'Marked by HR Admin',
      });
    } else {
      record.status = status;
      if (workHours !== undefined) record.workHours = workHours;
      if (remarks) record.remarks = remarks;
    }

    await record.save();
    res.json({ success: true, message: 'Attendance record updated successfully', record });
  } catch (error) {
    console.error('Mark Manual Attendance Error:', error);
    res.status(500).json({ message: 'Server error updating attendance record' });
  }
};
