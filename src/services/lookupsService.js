
const pool = require('../config/db');

async function getCareers() {
  const [rows] = await pool.query('SELECT id, name FROM careers WHERE status = 1 ORDER BY name ASC');
  return rows;
}

async function getLocations() {
  const [rows] = await pool.query(`
    SELECT DISTINCT province
    FROM jobs
    WHERE status = 'approved' AND province IS NOT NULL AND province <> ''
    ORDER BY province ASC
  `);
  return rows.map(item => item.province);
}

module.exports = { getCareers, getLocations };
