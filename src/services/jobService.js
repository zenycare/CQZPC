const pool = require('../config/db');

async function getHomeData(filters = {}) {
  const conditions = ["j.status = 'approved'"];
  const values = [];

  if (filters.careerId) {
    conditions.push('j.career_id = ?');
    values.push(filters.careerId);
  }
  if (filters.province) {
    conditions.push('j.province = ?');
    values.push(filters.province);
  }
  if (filters.keyword) {
    conditions.push('(j.title LIKE ? OR j.company_name LIKE ? OR j.keywords LIKE ?)');
    values.push(`%${filters.keyword}%`, `%${filters.keyword}%`, `%${filters.keyword}%`);
  }

  const [featuredJobs] = await pool.query(
    `SELECT j.*, c.name AS career_name
     FROM jobs j
     JOIN careers c ON c.id = j.career_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY j.is_featured DESC, j.created_at DESC
     LIMIT 12`,
    values
  );

  const [careerSections] = await pool.query(
    `SELECT c.id, c.name,
            (SELECT COUNT(*) FROM jobs j WHERE j.career_id = c.id AND j.status = 'approved') AS total_jobs
     FROM careers c
     WHERE c.status = 1
     ORDER BY total_jobs DESC, c.name ASC
     LIMIT 8`
  );

  const [locationSections] = await pool.query(
    `SELECT province, COUNT(*) AS total_jobs
     FROM jobs
     WHERE status = 'approved' AND province IS NOT NULL AND province <> ''
     GROUP BY province
     ORDER BY total_jobs DESC, province ASC
     LIMIT 8`
  );

  return { featuredJobs, careerSections, locationSections };
}

async function getJobById(id) {
  const [rows] = await pool.query(
    `SELECT j.*, c.name AS career_name, u.name AS recruiter_name, ep.company_description, ep.company_website, ep.company_logo
     FROM jobs j
     JOIN careers c ON c.id = j.career_id
     JOIN users u ON u.id = j.user_id
     LEFT JOIN employer_profiles ep ON ep.user_id = j.user_id
     WHERE j.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function hasApplied(jobId, candidateId) {
  const [rows] = await pool.query('SELECT id FROM job_applications WHERE job_id = ? AND candidate_id = ?', [jobId, candidateId]);
  return !!rows[0];
}

async function applyJob(jobId, candidateId, note) {
  const existed = await hasApplied(jobId, candidateId);
  if (existed) {
    throw new Error('Bạn đã ứng tuyển công việc này rồi.');
  }

  const [profileRows] = await pool.query('SELECT cv_file FROM candidate_profiles WHERE user_id = ?', [candidateId]);
  const profile = profileRows[0];
  if (!profile || !profile.cv_file) {
    throw new Error('Bạn cần tải CV trước khi ứng tuyển.');
  }

  await pool.query(
    'INSERT INTO job_applications(job_id, candidate_id, cv_file, note, status) VALUES (?, ?, ?, ?, ?)',
    [jobId, candidateId, profile.cv_file, note || null, 'pending']
  );
}

async function getCandidateApplications(candidateId) {
  const [rows] = await pool.query(
    `SELECT ja.*, j.title, j.company_name, j.province, c.name AS career_name
     FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id
     JOIN careers c ON c.id = j.career_id
     WHERE ja.candidate_id = ?
     ORDER BY ja.created_at DESC`,
    [candidateId]
  );
  return rows;
}

async function getEmployerJobs(userId) {
  const [rows] = await pool.query(
    `SELECT j.*, c.name AS career_name,
            (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) AS total_applications
     FROM jobs j
     JOIN careers c ON c.id = j.career_id
     WHERE j.user_id = ?
     ORDER BY j.created_at DESC`,
    [userId]
  );
  return rows;
}

async function createJob(userId, data) {
  await pool.query(
    `INSERT INTO jobs(
      title, career_id, job_type, user_id, vacancy, salary, job_level, description, benefits,
      responsibility, qualifications, keywords, experience, company_name, province, district,
      wards, location_detail, company_website, expiration_date, status, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.careerId,
      data.jobType,
      userId,
      data.vacancy,
      data.salary,
      data.jobLevel,
      data.description,
      data.benefits,
      data.responsibility,
      data.qualifications,
      data.keywords,
      data.experience,
      data.companyName,
      data.province,
      data.district || null,
      data.wards || null,
      data.locationDetail || null,
      data.companyWebsite || null,
      data.expirationDate || null,
      'pending',
      data.isFeatured ? 1 : 0
    ]
  );
}

async function getJobForEmployer(jobId, userId) {
  const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ? AND user_id = ?', [jobId, userId]);
  return rows[0] || null;
}

async function updateJob(jobId, userId, data) {
  await pool.query(
    `UPDATE jobs SET
      title = ?, career_id = ?, job_type = ?, vacancy = ?, salary = ?, job_level = ?, description = ?, benefits = ?,
      responsibility = ?, qualifications = ?, keywords = ?, experience = ?, company_name = ?, province = ?, district = ?,
      wards = ?, location_detail = ?, company_website = ?, expiration_date = ?, is_featured = ?, status = 'pending'
     WHERE id = ? AND user_id = ?`,
    [
      data.title,
      data.careerId,
      data.jobType,
      data.vacancy,
      data.salary,
      data.jobLevel,
      data.description,
      data.benefits,
      data.responsibility,
      data.qualifications,
      data.keywords,
      data.experience,
      data.companyName,
      data.province,
      data.district || null,
      data.wards || null,
      data.locationDetail || null,
      data.companyWebsite || null,
      data.expirationDate || null,
      data.isFeatured ? 1 : 0,
      jobId,
      userId
    ]
  );
}

async function getApplicantsForEmployer(userId) {
  const [rows] = await pool.query(
    `SELECT ja.id, ja.status, ja.note, ja.cv_file, ja.created_at,
            j.id AS job_id, j.title,
            u.name AS candidate_name, u.email AS candidate_email, u.phone AS candidate_phone,
            cp.headline
     FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id
     JOIN users u ON u.id = ja.candidate_id
     LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
     WHERE j.user_id = ?
     ORDER BY ja.created_at DESC`,
    [userId]
  );
  return rows;
}

async function getAdminStats() {
  const [[stats]] = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'candidate') AS total_candidates,
      (SELECT COUNT(*) FROM users WHERE role = 'employer') AS total_employers,
      (SELECT COUNT(*) FROM jobs) AS total_jobs,
      (SELECT COUNT(*) FROM job_applications) AS total_applications,
      (SELECT COUNT(*) FROM jobs WHERE status = 'pending') AS pending_jobs`
  );

  const [recentJobs] = await pool.query(
    `SELECT j.id, j.title, j.company_name, j.status, j.created_at, c.name AS career_name
     FROM jobs j
     JOIN careers c ON c.id = j.career_id
     ORDER BY j.created_at DESC
     LIMIT 10`
  );

  return { stats, recentJobs };
}

async function getAdminJobs() {
  const [rows] = await pool.query(
    `SELECT j.id, j.title, j.company_name, j.status, j.created_at, c.name AS career_name, u.name AS recruiter_name
     FROM jobs j
     JOIN careers c ON c.id = j.career_id
     JOIN users u ON u.id = j.user_id
     ORDER BY j.created_at DESC`
  );
  return rows;
}

async function updateJobStatus(jobId, status) {
  await pool.query('UPDATE jobs SET status = ? WHERE id = ?', [status, jobId]);
}

async function getAdminEmployers() {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, ep.company_name, ep.company_website,
            (SELECT COUNT(*) FROM jobs j WHERE j.user_id = u.id) AS total_jobs
     FROM users u
     LEFT JOIN employer_profiles ep ON ep.user_id = u.id
     WHERE u.role = 'employer'
     ORDER BY u.created_at DESC`
  );
  return rows;
}

module.exports = {
  getHomeData,
  getJobById,
  applyJob,
  getCandidateApplications,
  getEmployerJobs,
  createJob,
  getJobForEmployer,
  updateJob,
  getApplicantsForEmployer,
  getAdminStats,
  getAdminJobs,
  updateJobStatus,
  getAdminEmployers,
  hasApplied
};
