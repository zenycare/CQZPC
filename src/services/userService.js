const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function createCandidate({ name, email, password, phone, address }) {
  const existing = await findByEmail(email);
  if (existing) {
    throw new Error('Email đã tồn tại.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users(name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashedPassword, 'candidate', phone || null, address || null]
  );

  await pool.query(
    'INSERT INTO candidate_profiles(user_id, headline, cv_file) VALUES (?, ?, ?)',
    [result.insertId, 'Ứng viên mới', null]
  );

  return result.insertId;
}

async function createEmployer({ name, email, password, phone, address, companyName }) {
  const existing = await findByEmail(email);
  if (existing) {
    throw new Error('Email đã tồn tại.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users(name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashedPassword, 'employer', phone || null, address || null]
  );

  await pool.query(
    `INSERT INTO employer_profiles(user_id, company_name, company_slug, company_description, company_website, company_logo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      result.insertId,
      companyName,
      companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      'Cập nhật mô tả công ty tại trang nhà tuyển dụng.',
      null,
      null
    ]
  );

  return result.insertId;
}

async function validateLogin(email, password) {
  const user = await findByEmail(email);
  if (!user) return null;

  const isHashed = typeof user.password === 'string' && user.password.startsWith('$2');
  const ok = isHashed ? await bcrypt.compare(password, user.password) : password === user.password;
  if (!ok) return null;
  return user;
}

async function getCandidateProfile(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.address, cp.headline, cp.cv_file
     FROM users u
     LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function updateCandidateProfile(userId, { name, phone, address, headline, cvFile }) {
  await pool.query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [name, phone || null, address || null, userId]);
  if (cvFile) {
    await pool.query('UPDATE candidate_profiles SET headline = ?, cv_file = ? WHERE user_id = ?', [headline || null, cvFile, userId]);
  } else {
    await pool.query('UPDATE candidate_profiles SET headline = ? WHERE user_id = ?', [headline || null, userId]);
  }
}

async function getEmployerProfile(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.address,
            ep.company_name, ep.company_slug, ep.company_description, ep.company_website, ep.company_logo
     FROM users u
     LEFT JOIN employer_profiles ep ON ep.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function updateEmployerProfile(userId, data) {
  await pool.query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [data.name, data.phone || null, data.address || null, userId]);
  if (data.companyLogo) {
    await pool.query(
      `UPDATE employer_profiles
       SET company_name = ?, company_slug = ?, company_description = ?, company_website = ?, company_logo = ?
       WHERE user_id = ?`,
      [data.companyName, data.companySlug, data.companyDescription || null, data.companyWebsite || null, data.companyLogo, userId]
    );
  } else {
    await pool.query(
      `UPDATE employer_profiles
       SET company_name = ?, company_slug = ?, company_description = ?, company_website = ?
       WHERE user_id = ?`,
      [data.companyName, data.companySlug, data.companyDescription || null, data.companyWebsite || null, userId]
    );
  }
}

module.exports = {
  createCandidate,
  createEmployer,
  validateLogin,
  getCandidateProfile,
  updateCandidateProfile,
  getEmployerProfile,
  updateEmployerProfile
};
