# 🏢 Dayflow — Human Resource Management System (HRMS)
> *"Every workday, perfectly aligned."*

A full-stack, role-based Human Resource Management System built for hackathon demonstration based on the official Dayflow HRMS specification.

---

## 🌟 Key Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **Secure Sign In**: Users sign in with an email address and password.
- **Direct Employee Accounts**: An authenticated user can create an employee account directly with an initial password; no verification email is required.
- **Role Enforcement**: Protected routes on both Frontend and Backend ensure employees only see their data while HR/Admin can manage company-wide operations.
- **Session Security**: JWT sessions expire after 8 hours and are invalidated when accounts are deactivated, passwords are reset, or users sign out.

### 2. ⏱️ Real-Time Attendance Tracking
- **Live Clock In / Clock Out**: Interactive timer with automatic work-hour calculations.
- **Dynamic Status Tagging**: Automatically flags `Present` ($\ge 4$ hours) vs `Half-day` ($< 4$ hours) vs `Absent` vs `Leave`.
- **Personal & Master Logs**:
  - **Employee**: Personal daily/weekly attendance history with hours logged.
  - **HR Admin**: Filterable company-wide master attendance ledger (filter by date, status, department, and search by employee name/ID).
  - **Manual Adjustments**: HR Admin can manually record or adjust attendance logs.

### 3. 🏖️ Leave & Time-Off Management
- **Employee Self-Service**: Apply for `Paid`, `Sick`, `Casual`, or `Unpaid` leave with date range calculation and reason notes.
- **Admin Approvals Queue**: Dedicated HR approval hub to 1-click Approve or Reject requests with manager feedback comments.
- **Instant Synchronization**: Approved leaves automatically reflect in the employee's calendar and mark corresponding days as `Leave`.

### 4. 👥 Employee Directory & Profile Management
- **Employee Directory (Admin)**: Full staff roster with department filters, search, "Add Employee" modal, and comprehensive record editor.
- **Profile Self-Service (Employee)**: View personal, employment, and verification documents; edit personal contact details (phone, address, avatar).

### 5. 💰 Payroll & Compensation
- **Employee Compensation Breakdown**: Read-only breakdown of Basic Pay, House Rent Allowance (HRA), Special Allowances, and Statutory Deductions (Tax, PF).
- **Printable / Downloadable Pay Slip**: Fully formatted official monthly salary statement with print/PDF export modal.
- **Admin Salary Manager**: Real-time company payroll ledger with the ability to modify salary structures for any employee.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router v7, Lucide Icons, Pure Vanilla CSS (Design tokens, no Tailwind)
- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB (Mongoose ORM)
- **Security**: JWT (JSON Web Tokens), bcryptjs password hashing, token-version revocation, CORS protection, role authorization middleware

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install
```

Make sure MongoDB is running locally (or set your MongoDB Atlas connection string in `backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/dayflow
JWT_SECRET=dayflow_hackathon_super_secret_jwt_key_2026
# Optional: required only for password-reset emails
SMTP_USER=your-gmail-address@gmail.com
SMTP_APP_PASSWORD=your-google-app-password
EMAIL_FROM=Dayflow HRMS <your-gmail-address@gmail.com>
```

Seed realistic demo accounts, attendance logs, and sample leave requests:
```bash
npm run seed
```

Start the backend API server:
```bash
npm run dev
# Server will run at http://localhost:5000
```

---

### 2. Frontend Setup

In a new terminal window:
```bash
cd frontend
npm install
npm run dev
# App will run at http://localhost:5173
```

---

## 🎭 Pre-Seeded Demo Credentials

The seed command clears the configured database and creates these accounts. Use these credentials on the application login page.

| Role | Email | Password | Employee ID | Description |
|---|---|---|---|---|
| **👑 HR / Admin** | `admin@dayflow.com` | `admin123` | `HR001` | Sarah Jenkins (Head of People) — Full management access |
| **👤 Employee 1** | `employee@dayflow.com` | `Employee123` | `EMP001` | Alex Morgan — Senior Frontend Developer (Ready to Clock In) |
| **👤 Employee 2** | `rohan@dayflow.com` | `Employee123` | `EMP002` | Rohan Sharma — Backend Engineer |
| **👤 Employee 3** | `elena@dayflow.com` | `Employee123` | `EMP003` | Elena Rostova — Product UI/UX Lead |
| **👤 Employee 4** | `david@dayflow.com` | `Employee123` | `EMP004` | David Kim — QA Automation Lead |

Employee accounts created from **Employees → Add New Employee** are active immediately. HR enters the initial password during account creation; no email verification step is required.

---

## 📁 Project Architecture

```
dayflow-hrms/
├── backend/
│   ├── src/
│   │   ├── config/db.js               # MongoDB connection
│   │   ├── controllers/               # Auth, Employee, Attendance, Leave, Payroll, Dashboard
│   │   ├── middleware/                # JWT auth & role authorization guards
│   │   ├── models/                    # User, Attendance, Leave Mongoose models
│   │   ├── routes/                    # Express REST endpoints
│   │   ├── utils/seeder.js            # Realistic database seeder
│   │   └── server.js                  # Main server entrypoint
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/client.js              # REST API client with JWT interceptor
    │   ├── components/                # Modular UI components (Sidebar, Header, Modals, Badges)
    │   ├── context/AuthContext.jsx    # Auth state & quick role switcher
    │   ├── pages/                     # Login, Register, Dashboard, Attendance, Leaves, Employees, Payroll, Profile
    │   ├── styles/                    # Custom Vanilla CSS tokens and layouts
    │   ├── App.jsx                    # Protected routing
    │   └── main.jsx
    ├── index.html
    └── package.json
```
