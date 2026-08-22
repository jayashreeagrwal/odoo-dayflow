import User from '../models/User.js';
import { mockStore } from '../utils/mockStore.js';

export const getAllEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;

    if (global.USE_IN_MEMORY_DB) {
      let filtered = [...mockStore.users];
      if (department && department !== 'All') {
        filtered = filtered.filter((e) => e.jobDetails?.department === department);
      }
      if (status && status !== 'All') {
        filtered = filtered.filter((e) => e.jobDetails?.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(s) ||
            e.email.toLowerCase().includes(s) ||
            e.employeeId.toLowerCase().includes(s) ||
            e.jobDetails?.designation.toLowerCase().includes(s)
        );
      }
      return res.json({ success: true, count: filtered.length, employees: filtered });
    }

    let query = {};
    if (department && department !== 'All') query['jobDetails.department'] = department;
    if (status && status !== 'All') query['jobDetails.status'] = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { 'jobDetails.designation': { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    console.error('Get All Employees Error:', error);
    res.status(500).json({ message: 'Server error fetching employee directory' });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    if (req.user.role !== 'hr_admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
    }

    if (global.USE_IN_MEMORY_DB) {
      const employee = mockStore.users.find((u) => u._id === req.params.id);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      return res.json({ success: true, employee });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ success: true, employee });
  } catch (error) {
    console.error('Get Employee Error:', error);
    res.status(500).json({ message: 'Server error fetching employee' });
  }
};

export const updateSelfProfile = async (req, res) => {
  try {
    const isOwner = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'hr_admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { phone, address, avatar, name } = req.body;

    if (global.USE_IN_MEMORY_DB) {
      const user = mockStore.users.find((u) => u._id === req.params.id);
      if (!user) return res.status(404).json({ message: 'Employee not found' });

      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (avatar !== undefined) user.avatar = avatar;
      if (name !== undefined) user.name = name;

      return res.json({ success: true, message: 'Profile updated successfully', user });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;
    if (name !== undefined && isOwner) user.name = name;

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update Self Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const updateEmployeeByAdmin = async (req, res) => {
  try {
    const { name, email, phone, address, role, department, designation, employmentType, status, salaryStructure } = req.body;

    if (global.USE_IN_MEMORY_DB) {
      const user = mockStore.users.find((u) => u._id === req.params.id);
      if (!user) return res.status(404).json({ message: 'Employee not found' });

      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (role) user.role = role;

      user.jobDetails = {
        department: department || user.jobDetails.department,
        designation: designation || user.jobDetails.designation,
        employmentType: employmentType || user.jobDetails.employmentType,
        status: status || user.jobDetails.status,
        joiningDate: user.jobDetails.joiningDate,
      };

      if (salaryStructure) {
        const basic = Number(salaryStructure.basic) || user.salaryStructure.basic;
        const hra = Number(salaryStructure.hra) || user.salaryStructure.hra;
        const allowances = Number(salaryStructure.allowances) || user.salaryStructure.allowances;
        const deductions = Number(salaryStructure.deductions) || user.salaryStructure.deductions;
        const netSalary = basic + hra + allowances - deductions;
        user.salaryStructure = { basic, hra, allowances, deductions, netSalary };
      }

      return res.json({ success: true, message: 'Employee records updated successfully', user });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (role) user.role = role;

    user.jobDetails = {
      department: department || user.jobDetails.department,
      designation: designation || user.jobDetails.designation,
      employmentType: employmentType || user.jobDetails.employmentType,
      status: status || user.jobDetails.status,
      joiningDate: user.jobDetails.joiningDate,
    };

    if (salaryStructure) {
      const basic = Number(salaryStructure.basic) || user.salaryStructure.basic;
      const hra = Number(salaryStructure.hra) || user.salaryStructure.hra;
      const allowances = Number(salaryStructure.allowances) || user.salaryStructure.allowances;
      const deductions = Number(salaryStructure.deductions) || user.salaryStructure.deductions;
      const netSalary = basic + hra + allowances - deductions;
      user.salaryStructure = { basic, hra, allowances, deductions, netSalary };
    }

    await user.save();
    res.json({ success: true, message: 'Employee records updated successfully', user });
  } catch (error) {
    console.error('Update Employee By Admin Error:', error);
    res.status(500).json({ message: 'Server error updating employee' });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    if (global.USE_IN_MEMORY_DB) {
      const index = mockStore.users.findIndex((u) => u._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Employee not found' });
      if (mockStore.users[index]._id === req.user._id) {
        return res.status(400).json({ message: 'You cannot delete your own admin account' });
      }
      mockStore.users.splice(index, 1);
      return res.json({ success: true, message: 'Employee record deleted successfully' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Employee record deleted successfully' });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({ message: 'Server error deleting employee' });
  }
};
