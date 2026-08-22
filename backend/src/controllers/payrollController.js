import User from '../models/User.js';
import { mockStore } from '../utils/mockStore.js';

export const getMyPayroll = async (req, res) => {
  try {
    let user;
    if (global.USE_IN_MEMORY_DB) {
      user = mockStore.users.find((u) => u._id === req.user._id);
    } else {
      user = await User.findById(req.user._id).select('name email employeeId jobDetails salaryStructure');
    }

    if (!user) return res.status(404).json({ message: 'User record not found' });

    const structure = user.salaryStructure || {
      basic: 45000,
      hra: 18000,
      allowances: 7000,
      deductions: 4000,
      netSalary: 66000,
    };

    const months = ['August 2026', 'July 2026', 'June 2026'];
    const payslips = months.map((month, index) => {
      const gross = structure.basic + structure.hra + structure.allowances;
      const totalDeductions = structure.deductions + (index === 1 ? 500 : 0);
      const net = gross - totalDeductions;
      return {
        id: `PS-${user.employeeId}-${202608 - index}`,
        month,
        generatedOn: `2026-0${8 - index}-01`,
        basic: structure.basic,
        hra: structure.hra,
        allowances: structure.allowances,
        deductions: totalDeductions,
        grossSalary: gross,
        netSalary: net,
        status: 'Paid',
      };
    });

    res.json({
      success: true,
      employee: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: user.jobDetails?.department,
        designation: user.jobDetails?.designation,
        joiningDate: user.jobDetails?.joiningDate,
      },
      salaryStructure: structure,
      payslips,
    });
  } catch (error) {
    console.error('Get My Payroll Error:', error);
    res.status(500).json({ message: 'Server error fetching payroll information' });
  }
};

export const getAllPayroll = async (req, res) => {
  try {
    const { department, search } = req.query;

    if (global.USE_IN_MEMORY_DB) {
      let filtered = mockStore.users.filter((u) => u.role === 'employee');
      if (department && department !== 'All') {
        filtered = filtered.filter((e) => e.jobDetails?.department === department);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(s) ||
            e.email.toLowerCase().includes(s) ||
            e.employeeId.toLowerCase().includes(s)
        );
      }

      const totalMonthlyPayroll = filtered.reduce(
        (acc, curr) => acc + (curr.salaryStructure?.netSalary || 0),
        0
      );

      return res.json({
        success: true,
        count: filtered.length,
        employees: filtered,
        summary: {
          totalEmployees: filtered.length,
          totalMonthlyPayroll,
          averageSalary: filtered.length > 0 ? Math.round(totalMonthlyPayroll / filtered.length) : 0,
        },
      });
    }

    const employees = await User.find({ role: 'employee' })
      .select('name email employeeId avatar jobDetails salaryStructure')
      .sort({ name: 1 });

    let filtered = employees;
    if (department && department !== 'All') {
      filtered = filtered.filter((e) => e.jobDetails?.department === department);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(s) ||
          e.email.toLowerCase().includes(s) ||
          e.employeeId.toLowerCase().includes(s)
      );
    }

    const totalMonthlyPayroll = filtered.reduce(
      (acc, curr) => acc + (curr.salaryStructure?.netSalary || 0),
      0
    );

    res.json({
      success: true,
      count: filtered.length,
      employees: filtered,
      summary: {
        totalEmployees: filtered.length,
        totalMonthlyPayroll,
        averageSalary: filtered.length > 0 ? Math.round(totalMonthlyPayroll / filtered.length) : 0,
      },
    });
  } catch (error) {
    console.error('Get All Payroll Error:', error);
    res.status(500).json({ message: 'Server error fetching company payroll records' });
  }
};

export const updateSalaryStructure = async (req, res) => {
  try {
    const { basic, hra, allowances, deductions } = req.body;
    const numBasic = Number(basic) || 0;
    const numHra = Number(hra) || 0;
    const numAllowances = Number(allowances) || 0;
    const numDeductions = Number(deductions) || 0;
    const netSalary = numBasic + numHra + numAllowances - numDeductions;

    if (global.USE_IN_MEMORY_DB) {
      const user = mockStore.users.find((u) => u._id === req.params.id);
      if (!user) return res.status(404).json({ message: 'Employee not found' });

      user.salaryStructure = { basic: numBasic, hra: numHra, allowances: numAllowances, deductions: numDeductions, netSalary };
      return res.json({ success: true, message: `Salary structure updated for ${user.name}`, salaryStructure: user.salaryStructure });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    user.salaryStructure = { basic: numBasic, hra: numHra, allowances: numAllowances, deductions: numDeductions, netSalary };
    await user.save();
    res.json({ success: true, message: `Salary structure updated for ${user.name}`, salaryStructure: user.salaryStructure });
  } catch (error) {
    console.error('Update Salary Structure Error:', error);
    res.status(500).json({ message: 'Server error updating salary structure' });
  }
};
