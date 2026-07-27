# Pustak Market EMS (Employee Management System)

> **Enterprise Full-Stack MERN Application for Book Publication & Distribution Companies**

Pustak Market EMS is a production-grade Employee & Payroll Management System built for book publishing companies. It handles book publication lifecycles (ISBN, Authors, Publication Formats), employee management across 11 publication departments, multi-formula payroll calculations (Fixed Monthly, Task-Based, Hybrid), attendance clocking, PDF salary slip generation, and Excel report exports.

---

## 🚀 Key Features

### 1. User Roles & Authentication
- **Super Admin, Admin, and Employee Roles** with JWT role-based access control (RBAC).
- Login, Logout, Forgot Password, Reset Password, Change Password.
- Profile management with avatar image upload.

### 2. Executive Admin Dashboard
- **10 Dashboard Metric Cards**: Total Employees, Active Employees, Total Projects, Active Projects, Total Tasks, Pending Tasks, Completed Tasks, Attendance Today, Monthly Salary Expense, Pending Payments.
- **Dynamic Chart.js Analytics**:
  - Department Workforce Distribution (Doughnut Chart)
  - Task Status Breakdown (Doughnut Chart)
  - Active Publication Projects Completion Progress (Bar Chart)

### 3. Employee Management
- Auto-generated Employee IDs (`EMP-2026-0001`).
- Support for 11 Publication Departments: **Editorial, Content Writing, Proofreading, Graphic Design, Marketing, Sales, Printing, Warehouse, Accounts, HR, IT**.
- Salary model assignments: **Monthly Fixed, Task-Based, or Hybrid**.

### 4. Book Publication Project Management
- Auto-generated Project IDs (`PM-2026-0001`).
- Fields: Book Name, Author Name, ISBN Code, Publication Type (**Book, eBook, Magazine, Journal, Research Paper**), Category, Budget, Target Deadline, Completion Percentage %, Assigned Staff.

### 5. Task & Payment Management
- Auto-generated Task IDs (`TSK-2026-0001`).
- Assign multiple employees to a task with individual task payment allocations.
- Task status lifecycle: `Pending` ➔ `In Progress` ➔ `Submitted` ➔ `Under Review` ➔ `Approved` / `Rejected`.
- Deliverables submission with file attachments (PDF manuscripts, cover designs, ZIP files).
- Task payments are released only after Admin review & approval.

### 6. Multi-Model Salary & Automated Payroll Engine
Supports three salary models and automated monthly payroll calculations:
1. **Monthly Fixed Formula**: `Final = Fixed Salary + Bonus - Penalty`
2. **Per Task Payment Formula**: `Final = Sum of Approved Task Payment Amounts + Bonus - Penalty`
3. **Hybrid Formula**: `Final = Fixed Salary + Approved Task Payments + Bonus - Penalty`
- **PDF Salary Slip Generator**: Dynamic server-side PDF generation using PDFKit.

### 7. Attendance & Leave Management
- Real-time digital clock-in and clock-out widget with working hours calculation.
- Automated late entry detection (after 09:30 AM) and half-day status.
- Leave application and review workflow for Casual, Sick, Paid, and Unpaid leaves.

### 8. System Reports & Excel Exports
- Export tabular datasets to `.xlsx` Excel spreadsheets using ExcelJS:
  - Employees Directory Report
  - Daily Attendance Log Report
  - Tasks & Deliverables Report
  - Monthly Payroll & Salary Disbursal Report

---

## 🛠️ Tech Stack

- **Frontend**: React.js (JavaScript), React Router DOM, Axios, Context API, CSS Custom Properties (Theme tokens for Dark & Light modes), Chart.js & react-chartjs-2, Lucide-React.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, Express Validator, PDFKit, ExcelJS, Nodemailer, Morgan.

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally at `mongodb://127.0.0.1:27017/pustak_market_ems` or MongoDB Atlas URI.

### 1. Server Setup
```bash
cd server
npm install
npm run seed     # Seed demo database with initial users, projects & tasks
npm run dev      # Runs Express server on http://localhost:5000
```

### 2. Client Setup
```bash
cd client
npm install
npm start        # Runs React application on http://localhost:3000
```

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@pustakmarket.com` | `password123` |
| **Admin** | `admin@pustakmarket.com` | `password123` |
| **Employee (Hybrid)** | `priya.graphics@pustakmarket.com` | `password123` |
| **Employee (Monthly)** | `rahul.editorial@pustakmarket.com` | `password123` |
| **Employee (Task Based)** | `amitabh.content@pustakmarket.com` | `password123` |

---

## 📁 Project Structure

```
EMS/
├── server/
│   ├── config/ (db.js)
│   ├── controllers/ (auth, user, project, task, attendance, leave, salary, report, notification)
│   ├── middleware/ (auth, upload, validate, error)
│   ├── models/ (User, Project, Task, Attendance, LeaveRequest, Salary, Payment, Notification, ActivityLog)
│   ├── routes/ (auth, user, project, task, attendance, leave, salary, report, notification)
│   ├── utils/ (pdfGenerator, excelGenerator, emailService, idGenerators)
│   ├── seeders/ (seeder.js)
│   ├── server.js
│   └── package.json
└── client/
    ├── src/
    │   ├── components/ (common, employees, projects, tasks, salary)
    │   ├── context/ (AuthContext, ThemeContext, NotificationContext)
    │   ├── pages/ (auth, admin, employee)
    │   ├── services/ (api, authService, userService, projectService, taskService, etc.)
    │   ├── styles/ (global.css, theme.css, components.css)
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 📜 License
Pustak Market EMS - Enterprise Edition 2026. All rights reserved.
