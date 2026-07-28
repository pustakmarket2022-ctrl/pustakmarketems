const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Salary = require('../models/Salary');
const Payment = require('../models/Payment');

const generateEmployeeId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `EMP-${currentYear}-`;
  const count = await User.countDocuments();
  let nextSeq = count + 1;

  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await User.findOne({ employeeId: candidateId });

  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await User.findOne({ employeeId: candidateId });
  }

  return candidateId;
};

const generateProjectId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `PM-${currentYear}-`;
  const count = await Project.countDocuments();
  let nextSeq = count + 1;

  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await Project.findOne({ projectId: candidateId });

  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await Project.findOne({ projectId: candidateId });
  }

  return candidateId;
};

const generateTaskId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `TSK-${currentYear}-`;
  const count = await Task.countDocuments();
  let nextSeq = count + 1;

  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await Task.findOne({ taskId: candidateId });

  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await Task.findOne({ taskId: candidateId });
  }

  return candidateId;
};

const generateSalaryId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `SAL-${currentYear}-`;
  const count = await Salary.countDocuments();
  let nextSeq = count + 1;

  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await Salary.findOne({ salaryId: candidateId });

  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await Salary.findOne({ salaryId: candidateId });
  }

  return candidateId;
};

const generatePaymentId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `PAY-${currentYear}-`;
  const count = await Payment.countDocuments();
  let nextSeq = count + 1;

  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await Payment.findOne({ paymentId: candidateId });

  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await Payment.findOne({ paymentId: candidateId });
  }

  return candidateId;
};

const AdvanceRequest = require('../models/AdvanceRequest');
const Overtime = require('../models/Overtime');
const Meeting = require('../models/Meeting');
const Group = require('../models/Group');

const generateAdvanceId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `ADV-${currentYear}-`;
  const count = await AdvanceRequest.countDocuments();
  let nextSeq = count + 1;
  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await AdvanceRequest.findOne({ advanceId: candidateId });
  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await AdvanceRequest.findOne({ advanceId: candidateId });
  }
  return candidateId;
};

const generateOvertimeId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `OVT-${currentYear}-`;
  const count = await Overtime.countDocuments();
  let nextSeq = count + 1;
  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await Overtime.findOne({ overtimeId: candidateId });
  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await Overtime.findOne({ overtimeId: candidateId });
  }
  return candidateId;
};

const generateMeetingId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `MTG-${currentYear}-`;
  const count = await Meeting.countDocuments();
  let nextSeq = count + 1;
  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await Meeting.findOne({ meetingId: candidateId });
  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await Meeting.findOne({ meetingId: candidateId });
  }
  return candidateId;
};

const generateGroupId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `GRP-${currentYear}-`;
  const count = await Group.countDocuments();
  let nextSeq = count + 1;
  let candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  let exists = await Group.findOne({ groupId: candidateId });
  while (exists) {
    nextSeq++;
    candidateId = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    exists = await Group.findOne({ groupId: candidateId });
  }
  return candidateId;
};

module.exports = {
  generateEmployeeId,
  generateProjectId,
  generateTaskId,
  generateSalaryId,
  generatePaymentId,
  generateAdvanceId,
  generateOvertimeId,
  generateMeetingId,
  generateGroupId,
};
