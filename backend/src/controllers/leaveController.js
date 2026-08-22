import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { mockStore } from '../utils/mockStore.js';

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide leave type, start date, end date, and reason' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be earlier than start date' });
    }

    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (global.USE_IN_MEMORY_DB) {
      const newLeave = {
        _id: `lev_${Date.now()}`,
        user: req.user,
        leaveType,
        startDate: start,
        endDate: end,
        daysCount,
        reason,
        status: 'Pending',
        adminComment: '',
        createdAt: new Date(),
      };
      mockStore.leaves.unshift(newLeave);
      return res.status(201).json({ success: true, message: 'Leave application submitted successfully', leave: newLeave });
    }

    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: 'Pending',
    });

    res.status(201).json({ success: true, message: 'Leave application submitted successfully', leave });
  } catch (error) {
    console.error('Apply Leave Error:', error);
    res.status(500).json({ message: 'Server error submitting leave application' });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    if (global.USE_IN_MEMORY_DB) {
      const leaves = mockStore.leaves.filter((l) => l.user._id === req.user._id);
      const totalApplied = leaves.length;
      const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
      const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
      const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

      return res.json({
        success: true,
        leaves,
        stats: {
          totalApplied,
          approvedCount,
          pendingCount,
          rejectedCount,
          leaveBalance: { paid: 12 - approvedCount, sick: 8, casual: 5 },
        },
      });
    }

    const leaves = await Leave.find({ user: req.user._id })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    const totalApplied = leaves.length;
    const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
    const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
    const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

    res.json({
      success: true,
      leaves,
      stats: {
        totalApplied,
        approvedCount,
        pendingCount,
        rejectedCount,
        leaveBalance: { paid: 12 - approvedCount, sick: 8, casual: 5 },
      },
    });
  } catch (error) {
    console.error('Get My Leaves Error:', error);
    res.status(500).json({ message: 'Server error fetching your leave requests' });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (global.USE_IN_MEMORY_DB) {
      let filtered = [...mockStore.leaves];
      if (status && status !== 'All') filtered = filtered.filter((l) => l.status === status);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.user?.name?.toLowerCase().includes(s) ||
            l.user?.email?.toLowerCase().includes(s) ||
            l.user?.employeeId?.toLowerCase().includes(s) ||
            l.leaveType.toLowerCase().includes(s)
        );
      }

      const pendingCount = mockStore.leaves.filter((l) => l.status === 'Pending').length;
      const approvedCount = mockStore.leaves.filter((l) => l.status === 'Approved').length;
      const rejectedCount = mockStore.leaves.filter((l) => l.status === 'Rejected').length;

      return res.json({
        success: true,
        count: filtered.length,
        leaves: filtered,
        summary: { pendingCount, approvedCount, rejectedCount, total: pendingCount + approvedCount + rejectedCount },
      });
    }

    let query = {};
    if (status && status !== 'All') query.status = status;

    const leaves = await Leave.find(query)
      .populate('user', 'name email employeeId avatar jobDetails')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    let filteredLeaves = leaves.filter((l) => l.user !== null);
    if (search) {
      const s = search.toLowerCase();
      filteredLeaves = filteredLeaves.filter(
        (l) =>
          l.user?.name?.toLowerCase().includes(s) ||
          l.user?.email?.toLowerCase().includes(s) ||
          l.user?.employeeId?.toLowerCase().includes(s) ||
          l.leaveType.toLowerCase().includes(s)
      );
    }

    const pendingCount = await Leave.countDocuments({ status: 'Pending' });
    const approvedCount = await Leave.countDocuments({ status: 'Approved' });
    const rejectedCount = await Leave.countDocuments({ status: 'Rejected' });

    res.json({
      success: true,
      count: filteredLeaves.length,
      leaves: filteredLeaves,
      summary: { pendingCount, approvedCount, rejectedCount, total: pendingCount + approvedCount + rejectedCount },
    });
  } catch (error) {
    console.error('Get All Leaves Error:', error);
    res.status(500).json({ message: 'Server error fetching all leave requests' });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'Approved' or 'Rejected'" });
    }

    if (global.USE_IN_MEMORY_DB) {
      const leave = mockStore.leaves.find((l) => l._id === req.params.id);
      if (!leave) return res.status(404).json({ message: 'Leave request not found' });

      leave.status = status;
      leave.adminComment = adminComment || '';
      leave.reviewedBy = req.user;
      leave.reviewedAt = new Date();

      if (status === 'Approved') {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const existingAtt = mockStore.attendance.find((a) => a.user._id === leave.user._id && a.date === dateStr);
          if (existingAtt) {
            existingAtt.status = 'Leave';
            existingAtt.remarks = `Approved ${leave.leaveType} Leave`;
          } else {
            mockStore.attendance.push({
              _id: `att_${leave.user._id}_${dateStr}`,
              user: leave.user,
              date: dateStr,
              status: 'Leave',
              workHours: 0,
              remarks: `Approved ${leave.leaveType} Leave`,
            });
          }
        }
      }

      return res.json({ success: true, message: `Leave request has been ${status.toLowerCase()}`, leave });
    }

    const leave = await Leave.findById(req.params.id).populate('user', 'name email');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.status = status;
    leave.adminComment = adminComment || '';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    if (status === 'Approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        await Attendance.findOneAndUpdate(
          { user: leave.user._id, date: dateStr },
          { user: leave.user._id, date: dateStr, status: 'Leave', remarks: `Approved ${leave.leaveType} Leave`, workHours: 0 },
          { upsert: true, new: true }
        );
      }
    }

    res.json({ success: true, message: `Leave request has been ${status.toLowerCase()}`, leave });
  } catch (error) {
    console.error('Update Leave Status Error:', error);
    res.status(500).json({ message: 'Server error updating leave status' });
  }
};
