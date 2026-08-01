const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

// Create reusable Nodemailer transporter (Supports Gmail, Brevo/Sendinblue, and custom SMTP)
const createTransporter = () => {
  const isBrevo =
    process.env.EMAIL_SERVICE === 'brevo' ||
    !!process.env.BREVO_API_KEY ||
    (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('brevo'));

  const host = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || (isBrevo ? 'smtp-relay.brevo.com' : 'smtp.gmail.com');
  const port = parseInt(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || '587');
  const user = process.env.BREVO_SMTP_USER || process.env.SMTP_USER || process.env.EMAIL_USER || '';
  const pass = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASS || '';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Send Email asynchronously with HTML template and log result
 */
const sendEmail = async ({ to, subject, html, eventType = 'General' }) => {
  if (!to) return false;

  try {
    const transporter = createTransporter();
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@pustakmarket.com';

    if (!transporter) {
      console.log(`[Email Service]: Credentials not configured. Simulating email send to ${to} (${subject})`);
      await EmailLog.create({
        to,
        subject,
        eventType,
        status: 'Sent',
        error: 'Simulated send - No SMTP credentials in .env',
      });
      return true;
    }

    const info = await transporter.sendMail({
      from: `"Pustak Market EMS" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log(`[Email Sent]: ${info.messageId} to ${to}`);
    await EmailLog.create({
      to,
      subject,
      eventType,
      status: 'Sent',
    });

    return true;
  } catch (err) {
    console.error(`[Email Failed]: ${err.message}`);
    await EmailLog.create({
      to,
      subject,
      eventType,
      status: 'Failed',
      error: err.message,
    });
    return false;
  }
};

// HTML Email Template Wrappers
const generateBaseTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: #2563eb; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .content { padding: 28px; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #e0e7ff; color: #3730a3; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .details-table td.label { font-weight: bold; width: 35%; color: #4b5563; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Pustak Market EMS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Helper Template Generators for specific notifications
const sendTaskAssignedEmail = async (employee, task, assignedBy) => {
  const loginUrl = process.env.CLIENT_URL || 'http://localhost:3000/login';
  const html = generateBaseTemplate(
    'New Task Assigned',
    `
    <p>Hello <strong>${employee.fullName}</strong>,</p>
    <p>You have been assigned a new task on Pustak Market EMS.</p>
    <table class="details-table">
      <tr><td class="label">Task Title:</td><td><strong>${task.taskTitle}</strong></td></tr>
      <tr><td class="label">Task ID:</td><td>${task.taskId}</td></tr>
      <tr><td class="label">Description:</td><td>${task.description || 'N/A'}</td></tr>
      <tr><td class="label">Priority:</td><td><span class="badge">${task.priority}</span></td></tr>
      <tr><td class="label">Due Date:</td><td>${new Date(task.deadline).toLocaleDateString()}</td></tr>
      <tr><td class="label">Assigned By:</td><td>${assignedBy?.fullName || 'Admin'}</td></tr>
    </table>
    <a href="${loginUrl}" class="btn">View Task & Login</a>
    `
  );
  return sendEmail({ to: employee.email, subject: `[EMS Task] New Task Assigned: ${task.taskTitle}`, html, eventType: 'TaskAssigned' });
};

const sendTaskUpdatedEmail = async (employee, task, updatedBy) => {
  const loginUrl = process.env.CLIENT_URL || 'http://localhost:3000/login';
  const html = generateBaseTemplate(
    'Task Details Updated',
    `
    <p>Hello <strong>${employee.fullName}</strong>,</p>
    <p>The details for task <strong>${task.taskTitle}</strong> (${task.taskId}) have been updated.</p>
    <table class="details-table">
      <tr><td class="label">Task Title:</td><td><strong>${task.taskTitle}</strong></td></tr>
      <tr><td class="label">Task ID:</td><td>${task.taskId}</td></tr>
      <tr><td class="label">Status:</td><td><span class="badge">${task.taskStatus}</span></td></tr>
      <tr><td class="label">Priority:</td><td><span class="badge">${task.priority}</span></td></tr>
      <tr><td class="label">Progress:</td><td>${task.progressPercentage || 0}%</td></tr>
      <tr><td class="label">Deadline:</td><td>${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td></tr>
      <tr><td class="label">Updated By:</td><td>${updatedBy?.fullName || 'Admin'}</td></tr>
    </table>
    <a href="${loginUrl}" class="btn">View Task Details</a>
    `
  );
  return sendEmail({ to: employee.email, subject: `[EMS Task Update] ${task.taskTitle} (${task.taskId})`, html, eventType: 'TaskUpdated' });
};

const sendTaskDeadlineChangedEmail = async (employee, task) => {
  const html = generateBaseTemplate(
    'Task Deadline Changed',
    `<p>Hello <strong>${employee.fullName}</strong>,</p>
     <p>The deadline for task <strong>${task.taskTitle}</strong> has been changed to <strong>${new Date(task.deadline).toLocaleDateString()}</strong>.</p>`
  );
  return sendEmail({ to: employee.email, subject: `[EMS Deadline Update] ${task.taskTitle}`, html, eventType: 'TaskDeadlineChanged' });
};

const sendTaskCompletedEmail = async (employee, task) => {
  const html = generateBaseTemplate(
    'Task Completed',
    `<p>Hello <strong>${employee.fullName}</strong>,</p>
     <p>Your task <strong>${task.taskTitle}</strong> (${task.taskId}) has been marked as completed/approved.</p>`
  );
  return sendEmail({ to: employee.email, subject: `[EMS Task Approved] ${task.taskTitle}`, html, eventType: 'TaskCompleted' });
};

const sendLeaveStatusEmail = async (employee, leaveRequest) => {
  const status = leaveRequest.status;
  const isApproved = status === 'Approved';
  const html = generateBaseTemplate(
    `Leave Request ${status}`,
    `<p>Hello <strong>${employee.fullName}</strong>,</p>
     <p>Your leave request from <strong>${new Date(leaveRequest.startDate).toLocaleDateString()}</strong> to <strong>${new Date(leaveRequest.endDate).toLocaleDateString()}</strong> (${leaveRequest.totalDays} day(s)) has been <strong style="color:${isApproved ? '#16a34a' : '#dc2626'}">${status}</strong>.</p>
     <p>Reviewer Notes: ${leaveRequest.reviewNotes || 'N/A'}</p>`
  );
  return sendEmail({ to: employee.email, subject: `[EMS Leave Request] Leave ${status}`, html, eventType: `Leave${status}` });
};

const sendAdvanceStatusEmail = async (employee, advanceRequest) => {
  const status = advanceRequest.status;
  const isApproved = status === 'Approved';
  const html = generateBaseTemplate(
    `Advance Salary Request ${status}`,
    `<p>Hello <strong>${employee.fullName}</strong>,</p>
     <p>Your request for Advance Salary of <strong>₹${advanceRequest.amount}</strong> has been <strong style="color:${isApproved ? '#16a34a' : '#dc2626'}">${status}</strong>.</p>
     <p>Reason: ${advanceRequest.reason}</p>
     <p>Notes: ${advanceRequest.reviewNotes || 'N/A'}</p>`
  );
  return sendEmail({ to: employee.email, subject: `[EMS Advance Salary] Request ${status}`, html, eventType: `Advance${status}` });
};

const sendMeetingScheduledEmail = async (employee, meeting) => {
  const html = generateBaseTemplate(
    'New Meeting Scheduled',
    `<p>Hello <strong>${employee.fullName}</strong>,</p>
     <p>You have been invited to a meeting on Pustak Market EMS.</p>
     <table class="details-table">
       <tr><td class="label">Meeting Title:</td><td><strong>${meeting.title}</strong></td></tr>
       <tr><td class="label">Date & Time:</td><td>${meeting.date} at ${meeting.time} (${meeting.durationMinutes} mins)</td></tr>
       <tr><td class="label">Location / Link:</td><td>${meeting.location} ${meeting.meetingLink ? `<br/><a href="${meeting.meetingLink}">Join Meeting</a>` : ''}</td></tr>
       <tr><td class="label">Description:</td><td>${meeting.description || 'N/A'}</td></tr>
     </table>`
  );
  return sendEmail({ to: employee.email, subject: `[EMS Meeting] Invitation: ${meeting.title}`, html, eventType: 'MeetingScheduled' });
};

const sendSalarySlipGeneratedEmail = async (employee, salary) => {
  const html = generateBaseTemplate(
    'Salary Slip Generated',
    `<p>Hello <strong>${employee.fullName}</strong>,</p>
     <p>Your salary slip for <strong>${salary.month}/${salary.year}</strong> has been generated.</p>
     <p>Total Net Earnings: <strong>₹${salary.totalEarnings.toFixed(2)}</strong></p>
     <p>Login to your employee dashboard to view and print your detailed salary slip.</p>`
  );
  return sendEmail({ to: employee.email, subject: `[EMS Payroll] Salary Slip for ${salary.month}/${salary.year}`, html, eventType: 'SalarySlipGenerated' });
};

const sendWelcomeEmail = async (employee, plainPassword) => {
  const loginUrl = process.env.CLIENT_URL || 'http://localhost:3000/login';
  const html = generateBaseTemplate(
    'Welcome to Pustak Market EMS',
    `<p>Hello <strong>${employee.fullName}</strong>,</p>
     <p>Welcome to the Pustak Market team! Your account has been created.</p>
     <table class="details-table">
       <tr><td class="label">Employee ID:</td><td><strong>${employee.employeeId}</strong></td></tr>
       <tr><td class="label">Email:</td><td>${employee.email}</td></tr>
       <tr><td class="label">Temporary Password:</td><td><strong>${plainPassword || 'Set during creation'}</strong></td></tr>
     </table>
     <a href="${loginUrl}" class="btn">Login to Account</a>`
  );
  return sendEmail({ to: employee.email, subject: 'Welcome to Pustak Market EMS', html, eventType: 'WelcomeEmail' });
};

const sendPasswordResetEmail = async (employee, resetUrl) => {
  const html = generateBaseTemplate(
    'Password Reset Request',
    `
    <p>Hello <strong>${employee.fullName}</strong>,</p>
    <p>You requested a password reset for your Pustak Market EMS account.</p>
    <p>Click the button below to reset your password. This link is valid for 10 minutes.</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">If you did not request this, please ignore this email or contact support. Your password will remain unchanged.</p>
    <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">Link: <a href="${resetUrl}">${resetUrl}</a></p>
    `
  );
  return sendEmail({ to: employee.email, subject: '[EMS Account] Password Reset Request', html, eventType: 'PasswordReset' });
};

module.exports = {
  sendEmail,
  sendTaskAssignedEmail,
  sendTaskUpdatedEmail,
  sendTaskDeadlineChangedEmail,
  sendTaskCompletedEmail,
  sendLeaveStatusEmail,
  sendAdvanceStatusEmail,
  sendMeetingScheduledEmail,
  sendSalarySlipGeneratedEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
