import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // Don't return password by default in queries
    },
    emailVerified: {
      type: Boolean,
      default: true, // Preserves access for accounts created before invitations were introduced.
    },
    invitationTokenHash: { type: String, select: false },
    invitationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    role: {
      type: String,
      enum: ['employee', 'hr_admin'],
      default: 'employee',
    },
    phone: {
      type: String,
      default: '+1 (555) 000-0000',
    },
    address: {
      type: String,
      default: '123 Innovation Way, Tech City',
    },
    avatar: {
      type: String,
      default: '',
    },
    jobDetails: {
      department: {
        type: String,
        default: 'Engineering',
      },
      designation: {
        type: String,
        default: 'Software Engineer',
      },
      joiningDate: {
        type: Date,
        default: Date.now,
      },
      employmentType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
        default: 'Full-Time',
      },
      status: {
        type: String,
        enum: ['Active', 'On Leave', 'Inactive'],
        default: 'Active',
      },
    },
    salaryStructure: {
      basic: { type: Number, default: 45000 },
      hra: { type: Number, default: 18000 },
      allowances: { type: Number, default: 7000 },
      deductions: { type: Number, default: 4000 },
      netSalary: { type: Number, default: 66000 },
    },
    documents: [
      {
        name: { type: String },
        type: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
