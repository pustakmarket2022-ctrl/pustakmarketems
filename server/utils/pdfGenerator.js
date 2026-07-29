const PDFDocument = require('pdfkit');

const generateSalarySlipPDF = (salaryData, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Pipe to HTTP response
  doc.pipe(res);

  // 1. Header Banner
  doc
    .fillColor('#1E293B')
    .rect(0, 0, 612, 90)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('PUSTAK MARKET EMS', 40, 25);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Book Publication & Distribution Enterprise', 40, 52);

  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('SALARY SLIP STATEMENT', 320, 35, { align: 'right', width: 252 });

  doc
    .fillColor('#94A3B8')
    .fontSize(9)
    .font('Helvetica')
    .text('Official Payroll Document', 320, 58, { align: 'right', width: 252 });

  // Divider
  doc
    .strokeColor('#2563EB')
    .lineWidth(2)
    .moveTo(40, 100)
    .lineTo(572, 100)
    .stroke();

  // 2. Employee & Payment Details Box
  const startY = 112;

  // Employee Box
  doc
    .fillColor('#F8FAFC')
    .rect(40, startY, 255, 105)
    .fillAndStroke('#E2E8F0', '#CBD5E1');

  doc
    .fillColor('#1E3A8A')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('EMPLOYEE INFORMATION', 52, startY + 10);

  const emp = salaryData.user || {};

  doc
    .fontSize(8.5)
    .fillColor('#475569')
    .font('Helvetica-Bold').text('Employee Name:', 52, startY + 30)
    .font('Helvetica').fillColor('#0F172A').text(emp.fullName || 'N/A', 135, startY + 30)

    .fillColor('#475569')
    .font('Helvetica-Bold').text('Employee ID:', 52, startY + 46)
    .font('Helvetica').fillColor('#0F172A').text(emp.employeeId || 'N/A', 135, startY + 46)

    .fillColor('#475569')
    .font('Helvetica-Bold').text('Department:', 52, startY + 62)
    .font('Helvetica').fillColor('#0F172A').text(emp.department || 'N/A', 135, startY + 62)

    .fillColor('#475569')
    .font('Helvetica-Bold').text('Designation:', 52, startY + 78)
    .font('Helvetica').fillColor('#0F172A').text(emp.designation || 'N/A', 135, startY + 78);

  // Payment Details Box
  doc
    .fillColor('#F8FAFC')
    .rect(317, startY, 255, 105)
    .fillAndStroke('#E2E8F0', '#CBD5E1');

  doc
    .fillColor('#1E3A8A')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('STATEMENT DETAILS', 329, startY + 10);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[salaryData.month - 1] || `Month ${salaryData.month}`;

  doc
    .fontSize(8.5)
    .fillColor('#475569')
    .font('Helvetica-Bold').text('Slip ID / Ref:', 329, startY + 30)
    .font('Helvetica').fillColor('#2563EB').text(salaryData.salaryId || 'N/A', 415, startY + 30)

    .fillColor('#475569')
    .font('Helvetica-Bold').text('Pay Period:', 329, startY + 46)
    .font('Helvetica').fillColor('#0F172A').text(`${monthName} ${salaryData.year}`, 415, startY + 46)

    .fillColor('#475569')
    .font('Helvetica-Bold').text('Salary Model:', 329, startY + 62)
    .font('Helvetica').fillColor('#0F172A').text(salaryData.salaryType || 'Monthly', 415, startY + 62)

    .fillColor('#475569')
    .font('Helvetica-Bold').text('Status:', 329, startY + 78)
    .font('Helvetica')
    .fillColor(salaryData.status === 'Paid' ? '#16A34A' : '#D97706')
    .text(salaryData.status || 'Pending', 415, startY + 78);

  // 3. Task Breakdown Table
  let currentY = 232;

  doc
    .fillColor('#1E293B')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('COMPLETED TASKS & DELIVERABLES BREAKDOWN', 40, currentY);

  currentY += 16;

  // Table Header
  doc
    .fillColor('#0F172A')
    .rect(40, currentY, 532, 22)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Task ID / Title', 50, currentY + 6)
    .text('Completion Date', 340, currentY + 6)
    .text('Amount (₹)', 480, currentY + 6, { align: 'right', width: 82 });

  currentY += 22;

  const tasks = salaryData.tasksDetails || [];

  if (tasks.length === 0) {
    doc
      .fillColor('#F8FAFC')
      .rect(40, currentY, 532, 22)
      .fillAndStroke('#E2E8F0', '#E2E8F0');

    doc
      .fillColor('#64748B')
      .fontSize(8.5)
      .font('Helvetica-Oblique')
      .text('No individual task payouts recorded for this period.', 50, currentY + 6);

    currentY += 22;
  } else {
    tasks.forEach((task, index) => {
      const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      doc
        .fillColor(rowBg)
        .rect(40, currentY, 532, 22)
        .fillAndStroke('#E2E8F0', '#E2E8F0');

      const dateStr = task.completedDate
        ? new Date(task.completedDate).toLocaleDateString('en-IN')
        : 'N/A';

      const taskLabel = task.taskId ? `[${task.taskId}] ${task.taskTitle}` : task.taskTitle;

      doc
        .fillColor('#1E293B')
        .fontSize(8)
        .font('Helvetica')
        .text(taskLabel.length > 55 ? taskLabel.substring(0, 52) + '...' : taskLabel, 50, currentY + 6, { width: 280 })
        .text(dateStr, 340, currentY + 6)
        .font('Helvetica-Bold')
        .fillColor('#16A34A')
        .text(`Rs. ${Number(task.amount || 0).toLocaleString('en-IN')}`, 480, currentY + 6, { align: 'right', width: 82 });

      currentY += 22;
    });
  }

  // 4. Earnings vs Deductions Table
  currentY += 15;

  doc
    .fillColor('#1E293B')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('PAYROLL SUMMARY & BREAKDOWN', 40, currentY);

  currentY += 16;

  // Earnings/Deductions Header
  doc
    .fillColor('#0F172A')
    .rect(40, currentY, 532, 22)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Earnings Component', 50, currentY + 6)
    .text('Amount (₹)', 480, currentY + 6, { align: 'right', width: 82 });

  currentY += 22;

  const addSummaryRow = (label, amount, isDeduction = false, isHighlight = false) => {
    doc
      .fillColor(isHighlight ? '#FEF3C7' : '#FFFFFF')
      .rect(40, currentY, 532, 20)
      .fillAndStroke('#E2E8F0', '#E2E8F0');

    doc
      .fillColor(isDeduction ? (isHighlight ? '#B45309' : '#991B1B') : '#334155')
      .fontSize(8.5)
      .font(isHighlight ? 'Helvetica-Bold' : 'Helvetica')
      .text(label, 50, currentY + 5)
      .text(`${isDeduction ? '-' : ''}Rs. ${Number(amount || 0).toLocaleString('en-IN')}`, 480, currentY + 5, {
        align: 'right',
        width: 82,
      });

    currentY += 20;
  };

  addSummaryRow('Fixed Monthly Base Salary', salaryData.fixedSalary || 0);
  addSummaryRow('Task Payouts / Incentives', salaryData.taskIncentive || 0);
  if (salaryData.overtimeAmount > 0) {
    addSummaryRow(`Overtime (${salaryData.overtimeHours || 0} Hours)`, salaryData.overtimeAmount || 0);
  }
  addSummaryRow('Performance Bonus', salaryData.bonus || 0);
  addSummaryRow('Deduction / Fine / Penalty', salaryData.penalty || 0, true);

  if (salaryData.advanceSalary > 0) {
    addSummaryRow('Advance Salary Deduction (This Cycle)', salaryData.advanceSalary || 0, true);
  }

  if (salaryData.pendingAdvance > 0) {
    addSummaryRow('Pending Advance Balance (Deducted)', salaryData.pendingAdvance || 0, true, true);
  }

  const grossEarningsVal = (salaryData.fixedSalary || 0) + (salaryData.taskIncentive || 0) + (salaryData.overtimeAmount || 0) + (salaryData.bonus || 0);
  const totalDeductionsVal = (salaryData.penalty || 0) + (salaryData.advanceSalary || 0) + (salaryData.pendingAdvance || 0);
  const netPayableVal = Math.max(0, grossEarningsVal - totalDeductionsVal);

  // 5. Total Net Payable Box
  currentY += 10;

  doc
    .fillColor('#0284C7')
    .rect(40, currentY, 532, 34)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('FINAL NET SALARY PAYABLE', 52, currentY + 11)
    .fontSize(13)
    .text(`Rs. ${Number(netPayableVal).toLocaleString('en-IN')}`, 430, currentY + 10, {
      align: 'right',
      width: 132,
    });

  // 6. Signatures Footer
  const footerY = Math.max(currentY + 50, 710);

  doc
    .strokeColor('#CBD5E1')
    .lineWidth(1)
    .moveTo(40, footerY)
    .lineTo(190, footerY)
    .moveTo(420, footerY)
    .lineTo(570, footerY)
    .stroke();

  doc
    .fillColor('#64748B')
    .fontSize(8.5)
    .font('Helvetica')
    .text('Employee Signature', 40, footerY + 6, { width: 150, align: 'center' })
    .text('Authorized Admin / HR Signatory', 420, footerY + 6, { width: 150, align: 'center' });

  doc
    .fillColor('#94A3B8')
    .fontSize(7.5)
    .text('This is an official computer-generated salary slip statement from Pustak Market EMS.', 40, 785, {
      align: 'center',
      width: 532,
    });

  doc.end();
};

module.exports = {
  generateSalarySlipPDF,
};
