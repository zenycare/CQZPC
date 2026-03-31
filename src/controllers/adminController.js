const express = require('express');
const { requireRole } = require('../middleware/authMiddleware');
const { getAdminStats, getAdminJobs, updateJobStatus, getAdminEmployers } = require('../services/jobService');

const router = express.Router();
router.use(requireRole('admin'));

router.get('/dashboard', async (req, res) => {
  const { stats, recentJobs } = await getAdminStats();
  res.render('admin/dashboard', { title: 'Dashboard admin', stats, recentJobs });
});

router.get('/jobs', async (req, res) => {
  const jobs = await getAdminJobs();
  res.render('admin/jobs', { title: 'Quản lý tuyển dụng', jobs });
});

router.post('/jobs/:id/status', async (req, res) => {
  await updateJobStatus(req.params.id, req.body.status);
  res.redirect('/admin/jobs');
});

router.get('/employers', async (req, res) => {
  const employers = await getAdminEmployers();
  res.render('admin/employers', { title: 'Quản lý nhà tuyển dụng', employers });
});

module.exports = router;
