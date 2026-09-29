const { sendSuccess } = require('../utils/responseUtil');
const { getDBStatus } = require('../utils/dbConnector');

/**
 * Health Check Controller
 */
class HealthController {
  getHealth(req, res) {
    const dbStatus = getDBStatus();
    return sendSuccess(res, 'Server is running healthily.', {
      status: 'UP',
      uptime: `${Math.floor(process.uptime())}s`,
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new HealthController();
