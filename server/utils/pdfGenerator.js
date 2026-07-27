const PDFDocument = require('pdfkit');

const generateSalarySlipPDF = (salaryData, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe to HTTP response
  doc.pipe(res);

  // Header Banner
  doc
    .fillColor('#1E293B')
    .rect(0, 0, 612, 100)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('PUSTAK MARKET EMS', 50, 30);

  doc
    .fontSize(12)
    .font('Helvetica')
    .text('Book Publication & Distribution Company', 50, 58);

  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('SALARY SLIP', 430, 40, { align: 'right' });

  // Company info line
  doc
    .fillColor('#64748B')
    .fontSize(9)
    .text('Official Payroll Statement', 50, 110);

  doc
    .strokeColor('#E2E8F0')
    .lineWidth(1)
    .moveTo(50, 125)
    .lineTo(550, 125)
    .stroke();

  // Employee & Pay Period Details Box
  const startY = 140;
  
  // Left Box - Employee Details
  doc
    .fillColor('#F8FAFC')
    .rect(50, startY, 240, 120)
    .fillAndStroke('#E2E8F0', '#E2E8F0');

  doc
    .fillColor('#1E293B')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('EMPLOYEE DETAILS', 65, startY + 12);

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Name:', 65, startY + 35)
    .font('Helvetica')
    .text(salaryData.user.fullName, 130, startY + 35);

  doc
    .font('Helvetica-Bold')
    .text('Employee ID:', 65, startY + 52)
    .font('Helvetica')
    .text(salaryData.user.employeeId, 130, startY + 52);

  doc
    .font('Helvetica-Bold')
    .text('Department:', 65, startY + 69)
    .font('Helvetica')
    .text(salaryData.user.department, 130, startY + 69);

  doc
    .font('Helvetica-Bold')
    .text('Designation:', 65, startY + 86)
    .font('Helvetica')
    .text(salaryData.user.designation, 130, startY + 86);

  // Right Box - Pay Statement Details
  doc
    .fillColor('#F8FAFC')
    .rect(310, startY, 240, 120)
    .fillAndStroke('#E2E8F0', '#E2E8F0');

  doc
    .fillColor('#1E293B')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('PAYMENT DETAILS', 325, startY + 12);

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Slip ID:', 325, startY + 35)
    .font('Helvetica')
    .text(salaryData.salaryId, 410, startY + 35);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[salaryData.month - 1] || `Month ${salaryData.month}`;

  doc
    .font('Helvetica-Bold')
    .text('Pay Period:', 325, startY + 52)
    .font('Helvetica')
    .text(`${monthName} ${salaryData.year}`, 410, startY + 52);

  doc
    .font('Helvetica-Bold')
    .text('Salary Model:', 325, startY + 69)
    .font('Helvetica')
    .text(salaryData.salaryType, 410, startY + 69);

  doc
    .font('Helvetica-Bold')
    .text('Status:', 325, startY + 86)
    .font('Helvetica')
    .text(salaryData.status, 410, startY + 86);

  // Salary Breakdown Table
  const tableY = 280;

  // Table Header
  doc
    .fillColor('#0F172A')
    .rect(50, tableY, 500, 25)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Earnings Component', 65, tableY + 7)
    .text('Amount (₹ INR)', 450, tableY + 7, { align: 'right' });

  let itemY = tableY + 35;

  const addRow = (label, amount, isDeduction = false) => {
    doc
      .fillColor(isDeduction ? '#991B1B' : '#334155')
      .fontSize(10)
      .font('Helvetica')
      .text(label, 65, itemY)
      .text(`${isDeduction ? '-' : ''}Rs. ${Number(amount).toLocaleString('en-IN')}`, 450, itemY, { align: 'right' });

    doc
      .strokeColor('#F1F5F9')
      .lineWidth(1)
      .moveTo(50, itemY + 18)
      .lineTo(550, itemY + 18)
      .stroke();

    itemY += 25;
  };

  addRow('Fixed Monthly Base Salary', salaryData.fixedSalary || 0);
  addRow('Task Payout / Incentives', salaryData.taskIncentive || 0);
  addRow('Performance Bonus', salaryData.bonus || 0);
  addRow('Deduction / Penalty', salaryData.penalty || 0, true);
  if (salaryData.advanceSalary > 0) {
    addRow('Advance Salary Deduction', salaryData.advanceSalary || 0, true);
  }

  // Total Earnings Line
  itemY += 10;
  doc
    .fillColor('#475569')
    .rect(50, itemY, 500, 35)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('TOTAL NET PAYOUT', 65, itemY + 10)
    .text(`Rs. ${Number(salaryData.totalEarnings).toLocaleString('en-IN')}`, 450, itemY + 10, { align: 'right' });

  // Signature and Footer
  const footerY = 550;

  doc
    .strokeColor('#CBD5E1')
    .lineWidth(1)
    .moveTo(50, footerY)
    .lineTo(200, footerY)
    .moveTo(400, footerY)
    .lineTo(550, footerY)
    .stroke();

  doc
    .fillColor('#64748B')
    .fontSize(9)
    .font('Helvetica')
    .text('Employee Signature', 50, footerY + 8)
    .text('Authorized HR Signatory', 400, footerY + 8);

  doc
    .fillColor('#94A3B8')
    .fontSize(8)
    .text('This document is a computer-generated salary slip for Pustak Market EMS.', 50, 750, {
      align: 'center',
    });

  doc.end();
};

module.exports = {
  generateSalarySlipPDF,
};
