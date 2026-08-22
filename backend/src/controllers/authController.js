import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendInvitationEmail, sendPasswordResetEmail } from '../utils/email.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createOpaqueToken = () => crypto.randomBytes(32).toString('hex');

const isStrongPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password);

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

const safeUser = (user) => ({
  _id: user._id,
  employeeId: user.employeeId,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  role: user.role,
  phone: user.phone,
  address: user.address,
  avatar: user.avatar,
  jobDetails: user.jobDetails,
  salaryStructure: user.salaryStructure,
});

export const register = (_req, res) =>
  res.status(403).json({ message: 'Public registration is disabled. Ask your HR administrator for an invitation.' });

export const inviteEmployee = async (req, res) => {
  try {
    const { employeeId, name, email, department, designation, phone, address, basicSalary } = req.body;
    if (!employeeId || !name || !email) {
      return res.status(400).json({ message: 'Employee ID, name, and email are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmployeeId = employeeId.trim().toUpperCase();
    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { employeeId: normalizedEmployeeId }],
    });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email or Employee ID already exists' });
    }

    const invitationToken = createOpaqueToken();
    const basic = Number(basicSalary) || 45000;
    const user = await User.create({
      employeeId: normalizedEmployeeId,
      name: name.trim(),
      email: normalizedEmail,
      emailVerified: false,
      invitationTokenHash: hashToken(invitationToken),
      invitationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      role: 'employee',
      phone: phone || '',
      address: address || '',
      jobDetails: {
        department: department || 'Engineering',
        designation: designation || 'Employee',
        joiningDate: new Date(),
        employmentType: 'Full-Time',
        status: 'Active',
      },
      salaryStructure: {
        basic,
        hra: Math.round(basic * 0.4),
        allowances: Math.round(basic * 0.15),
        deductions: Math.round(basic * 0.1),
        netSalary: Math.round(basic * 1.45),
      },
    });

    try {
      await sendInvitationEmail({ email: normalizedEmail, name: user.name, token: invitationToken });
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);
      throw emailError;
    }

    res.status(201).json({ success: true, message: `Invitation sent to ${normalizedEmail}` });
  } catch (error) {
    console.error('Invite Employee Error:', error.message);
    res.status(500).json({ message: error.message || 'Unable to send employee invitation' });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Invitation token and password are required' });
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' });
    }

    const user = await User.findOne({
      invitationTokenHash: hashToken(token),
      invitationExpiresAt: { $gt: new Date() },
    }).select('+invitationTokenHash +invitationExpiresAt');

    if (!user) return res.status(400).json({ message: 'Invitation link is invalid or has expired' });

    user.password = password;
    user.emailVerified = true;
    user.invitationTokenHash = undefined;
    user.invitationExpiresAt = undefined;
    await user.save();

    res.json({ success: true, token: generateToken(user), user: safeUser(user) });
  } catch (error) {
    console.error('Accept Invitation Error:', error.message);
    res.status(500).json({ message: 'Unable to activate account' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide both email and password' });

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.emailVerified) return res.status(403).json({ message: 'Verify your email using the HR invitation before signing in' });
    if (user.jobDetails?.status === 'Inactive') return res.status(403).json({ message: 'This account has been deactivated. Contact HR.' });

    res.json({ success: true, token: generateToken(user), user: safeUser(user) });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const forgotPassword = async (req, res) => {
  const genericResponse = { success: true, message: 'If that email belongs to an active account, a reset link has been sent.' };
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email, emailVerified: true });
    if (!user || user.jobDetails?.status === 'Inactive') return res.json(genericResponse);

    const resetToken = createOpaqueToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail({ email: user.email, name: user.name, token: resetToken });
    return res.json(genericResponse);
  } catch (error) {
    console.error('Forgot Password Error:', error.message);
    return res.json(genericResponse);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Reset token and password are required' });
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' });
    }

    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt');
    if (!user) return res.status(400).json({ message: 'Password reset link is invalid or has expired' });

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset Password Error:', error.message);
    res.status(500).json({ message: 'Unable to reset password' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user: safeUser(user) });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};
