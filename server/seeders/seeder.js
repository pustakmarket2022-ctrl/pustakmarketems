const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Salary = require('../models/Salary');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('[Seeder]: Connected to MongoDB Atlas...');
    } catch (atlasErr) {
      console.warn(`[Seeder Warning]: MongoDB Atlas connection error (${atlasErr.message}). Falling back to local MongoDB...`);
      await mongoose.connect('mongodb://127.0.0.1:27017/pustak_market_ems');
      console.log('[Seeder]: Connected to local MongoDB...');
    }

    // Clear existing collections completely
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Attendance.deleteMany();
    await LeaveRequest.deleteMany();
    await Salary.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();

    console.log('[Seeder]: Cleared existing database records.');

    // 1. Seed Official Admin Milind Kasbe & Core Team
    const superAdmin = await User.create({
      employeeId: 'EMP-2026-0001',
      fullName: 'Vikramaditya Sharma',
      email: 'superadmin@pustakmarket.com',
      password: 'password123',
      phone: '+91 98765 00001',
      role: 'Admin',
      department: 'HR',
      designation: 'Managing Director',
      salaryType: 'Monthly',
      fixedSalary: 150000,
      status: 'Active',
    });

    const adminMK = await User.create({
      employeeId: 'EMP-2026-0002',
      fullName: 'Milind Kasbe',
      email: 'mk@pustakmarket.com',
      password: 'password123',
      phone: '+91 98765 00002',
      role: 'Admin',
      department: 'Editorial',
      designation: 'Chief Editor & Publishing Head',
      salaryType: 'Monthly',
      fixedSalary: 120000,
      status: 'Active',
    });

    const employeesData = [
      {
        employeeId: 'EMP-2026-0003',
        fullName: 'Rahul Deshmukh',
        email: 'rahul.editorial@pustakmarket.com',
        password: 'password123',
        phone: '+91 98220 11003',
        role: 'Employee',
        department: 'Editorial',
        designation: 'Senior Book Editor',
        salaryType: 'Monthly',
        fixedSalary: 55000,
      },
      {
        employeeId: 'EMP-2026-0004',
        fullName: 'Priya Kulkarni',
        email: 'priya.graphics@pustakmarket.com',
        password: 'password123',
        phone: '+91 98220 11004',
        role: 'Employee',
        department: 'Graphic Design',
        designation: 'Cover Designer & Illustrator',
        salaryType: 'Hybrid',
        fixedSalary: 35000,
        perTaskRate: 4500,
      },
      {
        employeeId: 'EMP-2026-0005',
        fullName: 'Amitabh Sen',
        email: 'amitabh.content@pustakmarket.com',
        password: 'password123',
        phone: '+91 98220 11005',
        role: 'Employee',
        department: 'Content Writing',
        designation: 'Staff Author & Translator',
        salaryType: 'Task Based',
        perTaskRate: 5000,
      },
      {
        employeeId: 'EMP-2026-0006',
        fullName: 'Sneha Patil',
        email: 'sneha.proof@pustakmarket.com',
        password: 'password123',
        phone: '+91 98220 11006',
        role: 'Employee',
        department: 'Proofreading',
        designation: 'Lead Manuscript Proofreader',
        salaryType: 'Monthly',
        fixedSalary: 42000,
      },
      {
        employeeId: 'EMP-2026-0007',
        fullName: 'Rohan Mehta',
        email: 'rohan.marketing@pustakmarket.com',
        password: 'password123',
        phone: '+91 98220 11007',
        role: 'Employee',
        department: 'Marketing',
        designation: 'Digital Campaign Manager',
        salaryType: 'Hybrid',
        fixedSalary: 40000,
        perTaskRate: 3500,
      },
      {
        employeeId: 'EMP-2026-0008',
        fullName: 'Deepak Shinde',
        email: 'deepak.print@pustakmarket.com',
        password: 'password123',
        phone: '+91 98220 11008',
        role: 'Employee',
        department: 'Printing',
        designation: 'Press & Typesetting Supervisor',
        salaryType: 'Monthly',
        fixedSalary: 48000,
      },
      {
        employeeId: 'EMP-2026-0009',
        fullName: 'Karan Joshi',
        email: 'karan.warehouse@pustakmarket.com',
        password: 'password123',
        phone: '+91 98220 11009',
        role: 'Employee',
        department: 'Warehouse',
        designation: 'Distribution Logistics Head',
        salaryType: 'Monthly',
        fixedSalary: 40000,
      },
      {
        employeeId: 'EMP-2026-0010',
        fullName: 'Neha Gupta',
        email: 'neha.accounts@pustakmarket.com',
        password: 'password123',
        phone: '+91 98220 11010',
        role: 'Employee',
        department: 'Accounts',
        designation: 'Senior Accountant & Auditor',
        salaryType: 'Monthly',
        fixedSalary: 52000,
      },
    ];

    const employees = await User.create(employeesData);
    console.log(`[Seeder]: Created ${employees.length + 2} Production Users (Admin Milind Kasbe included).`);

    // 2. Seed Production Book Projects
    const projectsData = [
      {
        projectId: 'PM-2026-0001',
        projectName: 'Chhatrapati Shivaji Maharaj Leadership Series',
        bookName: 'Shivaji Maharaj: Strategic Management & Fort Governance',
        author: 'Dr. M. K. Deshmukh',
        ISBN: '978-81-94002-10-1',
        publicationType: 'Book',
        category: 'History & Management',
        description: 'Comprehensive historical and management analysis of Maratha Empire administration.',
        priority: 'High',
        status: 'Active',
        deadline: new Date('2026-10-15'),
        assignedEmployees: [employees[0]._id, employees[1]._id, employees[3]._id],
        estimatedBudget: 450000,
        completionPercentage: 75,
        milestones: [
          { stepName: 'Manuscript Review & Historical Source Verification', status: 'Completed', notes: 'Approved by Editorial Board' },
          { stepName: 'Editorial Chapter Formatting & Indexing', status: 'Completed', notes: 'Chapters 1 to 12 indexed' },
          { stepName: 'Fort Vector Map & Jacket Cover Design', status: 'Completed', notes: 'Approved by Dr. M. K. Deshmukh' },
          { stepName: 'Final Proofreading & Typography Check', status: 'In Progress', notes: 'Lead Proofreader reviewing galleys' },
          { stepName: 'Offset Hardcover Press Printing & Release', status: 'Pending', notes: 'Scheduled at Press Division' },
        ],
      },
      {
        projectId: 'PM-2026-0002',
        projectName: 'Vedic Heritage Series Volume 2',
        bookName: 'Modern Vedic Mathematics & Fast Algorithms',
        author: 'Prof. A. R. Kulkarni',
        ISBN: '978-81-94002-20-0',
        publicationType: 'Book',
        category: 'Academic & Science',
        description: 'Hardcover edition on mental arithmetic, Vedic sutras, and mathematical algorithms.',
        priority: 'Medium',
        status: 'Active',
        deadline: new Date('2026-09-01'),
        assignedEmployees: [employees[0]._id, employees[3]._id],
        estimatedBudget: 320000,
        completionPercentage: 60,
        milestones: [
          { stepName: 'Mathematical Formula & Sutra Verification', status: 'Completed', notes: 'Passed academic review' },
          { stepName: 'Typesetting & Vector Equation Design', status: 'Completed', notes: 'Typesetting complete' },
          { stepName: 'Proofreading & Indexing', status: 'In Progress', notes: 'Chapter 5 under proofing' },
          { stepName: 'Paperback Press Printing & Distribution', status: 'Pending', notes: 'Awaiting final proof approval' },
        ],
      },
      {
        projectId: 'PM-2026-0003',
        projectName: 'Children Illustrated Classics',
        bookName: 'Bal Panchatantra - Colour Illustrated Stories',
        author: 'Sunita Joshi',
        ISBN: '978-81-94002-30-9',
        publicationType: 'eBook',
        category: 'Children Fiction',
        description: 'Digital interactive eBook edition with vector illustrations and moral fables.',
        priority: 'Urgent',
        status: 'Active',
        deadline: new Date('2026-08-10'),
        assignedEmployees: [employees[1]._id, employees[2]._id],
        estimatedBudget: 250000,
        completionPercentage: 85,
        milestones: [
          { stepName: 'Moral Fables Selection & Adaption', status: 'Completed', notes: 'Adapted by Sunita Joshi' },
          { stepName: 'Vector Character Illustrations', status: 'Completed', notes: '15 Full-color character illustrations done' },
          { stepName: 'Interactive eBook EPUB Formatting', status: 'In Progress', notes: 'Kindle/EPUB layouting' },
          { stepName: 'Global eBook Storefront Launch', status: 'Pending', notes: 'Amazon Kindle & Google Books' },
        ],
      },
      {
        projectId: 'PM-2026-0004',
        projectName: 'Literary Review Quarterly Q3',
        bookName: 'Pustak Market Indian Literary Review Vol 45',
        author: 'Editorial Board',
        ISBN: 'ISSN-2026-9901',
        publicationType: 'Magazine',
        category: 'Periodical',
        description: 'Quarterly literary journal compiling contemporary book critiques, author interviews, and essays.',
        priority: 'High',
        status: 'Active',
        deadline: new Date('2026-08-01'),
        assignedEmployees: [employees[2]._id, employees[4]._id],
        estimatedBudget: 180000,
        completionPercentage: 90,
        milestones: [
          { stepName: 'Author Interview Collection', status: 'Completed', notes: 'Sunita Joshi interview completed' },
          { stepName: 'Essay Compilation & Critique Layout', status: 'Completed', notes: 'Layout approved' },
          { stepName: 'Final Editorial Signoff by Milind Kasbe Sir', status: 'Completed', notes: 'Approved by Milind Kasbe Sir' },
          { stepName: 'Digital & Print Magazine Distribution', status: 'In Progress', notes: 'Dispatching to subscribers' },
        ],
      },
    ];

    const projects = await Project.create(projectsData);
    console.log(`[Seeder]: Created ${projects.length} Publication Projects.`);

    // 3. Seed Production Workflow Tasks
    const tasksData = [
      {
        taskId: 'TSK-2026-0001',
        taskTitle: 'Hardcover Layout & Typography Design',
        description: 'Design jacket cover and interior typography for Shivaji Maharaj Leadership book.',
        project: projects[0]._id,
        assignedTo: [employees[1]._id],
        priority: 'High',
        estimatedHours: 35,
        deadline: new Date('2026-08-10'),
        taskPaymentAmount: 8500,
        progressPercentage: 85,
        taskStatus: 'In Progress',
        paymentStatus: 'Unpaid',
      },
      {
        taskId: 'TSK-2026-0002',
        taskTitle: 'Proofreading Chapters 1 to 8',
        description: 'Verify historical dates, fort maps, and Marathi-English translations.',
        project: projects[0]._id,
        assignedTo: [employees[3]._id],
        priority: 'Medium',
        estimatedHours: 30,
        deadline: new Date('2026-08-05'),
        taskPaymentAmount: 6000,
        progressPercentage: 100,
        taskStatus: 'Approved',
        paymentStatus: 'Unpaid',
      },
      {
        taskId: 'TSK-2026-0003',
        taskTitle: 'Panchatantra Vector Character Illustrations',
        description: 'Create 15 full-color vector character drawings for eBook chapter pages.',
        project: projects[2]._id,
        assignedTo: [employees[1]._id],
        priority: 'Urgent',
        estimatedHours: 50,
        deadline: new Date('2026-08-02'),
        taskPaymentAmount: 12000,
        progressPercentage: 100,
        taskStatus: 'Approved',
        paymentStatus: 'Unpaid',
      },
      {
        taskId: 'TSK-2026-0004',
        taskTitle: 'Author Interview & Featured Review',
        description: 'Conduct featured interview with author Sunita Joshi for Literary Review Digest.',
        project: projects[3]._id,
        assignedTo: [employees[2]._id],
        priority: 'Medium',
        estimatedHours: 15,
        deadline: new Date('2026-07-30'),
        taskPaymentAmount: 5000,
        progressPercentage: 100,
        taskStatus: 'Approved',
        paymentStatus: 'Unpaid',
      },
    ];

    const tasks = await Task.create(tasksData);
    console.log(`[Seeder]: Created ${tasks.length} Tasks.`);

    // 4. Seed Task Payments
    for (const t of tasks) {
      if (t.taskStatus === 'Approved') {
        const amountPer = t.taskPaymentAmount / t.assignedTo.length;
        for (const empId of t.assignedTo) {
          await Payment.create({
            paymentId: `PAY-2026-00${Math.floor(Math.random() * 89 + 10)}`,
            task: t._id,
            user: empId,
            amount: amountPer,
            status: 'Unpaid',
          });
        }
      }
    }

    // 5. Seed Attendance Logs
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      for (const emp of employees) {
        const checkIn = new Date(d);
        checkIn.setHours(9, 15 + (i % 3) * 10, 0);

        const checkOut = new Date(d);
        checkOut.setHours(17, 30 + (i % 2) * 20, 0);

        await Attendance.create({
          user: emp._id,
          date: dateStr,
          checkIn,
          checkOut,
          workingHours: 8.25,
          status: i % 5 === 0 ? 'Late' : 'Present',
        });
      }
    }

    // 6. Seed Salary Payroll (in INR ₹)
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    for (const emp of employees) {
      let taskIncentive = 0;
      if (emp.salaryType === 'Task Based' || emp.salaryType === 'Hybrid') {
        taskIncentive = emp.perTaskRate ? emp.perTaskRate * 2 : 7000;
      }

      const fixedSalary = emp.fixedSalary || 0;
      const bonus = 3000;
      const penalty = 500;
      const totalEarnings = fixedSalary + taskIncentive + bonus - penalty;

      await Salary.create({
        salaryId: `SAL-2026-00${emp.employeeId.split('-')[2]}`,
        user: emp._id,
        month: currentMonth,
        year: currentYear,
        salaryType: emp.salaryType,
        fixedSalary,
        taskIncentive,
        bonus,
        penalty,
        totalEarnings,
        status: 'Pending',
        remarks: 'Monthly Payroll Run (INR ₹)',
      });
    }

    console.log('\n==========================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log(' Admin (Milind Kasbe): mk@pustakmarket.com / password123');
    console.log(' Super Admin:          superadmin@pustakmarket.com / password123');
    console.log(' Employee:             priya.graphics@pustakmarket.com / password123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err);
    process.exit(1);
  }
};

seedData();
