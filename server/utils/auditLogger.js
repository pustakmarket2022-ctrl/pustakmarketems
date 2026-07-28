const ActivityLog = require('../models/ActivityLog');

/**
 * Log user action into ActivityLog database
 * @param {Object} options
 * @param {String} options.user - User ID who performed action
 * @param {String} options.action - Action title/summary
 * @param {String} options.details - Action details
 * @param {Object} [options.req] - Express request object for IP extraction
 */
const logAudit = async ({ user, action, details = '', req = null }) => {
  try {
    let ipAddress = '';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '';
    }

    await ActivityLog.create({
      user: user || null,
      action,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('[Audit Log Error]:', err.message);
  }
};

module.exports = logAudit;
