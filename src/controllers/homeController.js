const express = require('express');
const router = express.Router();
const { getHomeData, getJobById, applyJob, hasApplied } = require('../services/jobService');
const { getCareers, getLocations } = require('../services/lookupsService');
const { requireRole } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  const careers = await getCareers();
  const locations = await getLocations();
  const data = await getHomeData({
    keyword: req.query.keyword || '',
    careerId: req.query.career_id || '',
    province: req.query.province || ''
  });

  res.render('home/index', {
    title: 'Trang chủ',
    careers,
    locations,
    filters: req.query,
    ...data
  });


  
});

router.get('/jobs/:id', async (req, res) => {
  const job = await getJobById(req.params.id);
  if (!job) return res.status(404).render('home/404', { title: '404' });

  let applied = false;
  if (req.user?.role === 'candidate') {
    applied = await hasApplied(job.id, req.user.id);
  }

  res.render('home/job-detail', {
    title: job.title,
    job,
    applied
  });
});

router.post('/jobs/:id/apply', requireRole('candidate'), async (req, res) => {
  try {
    await applyJob(req.params.id, req.user.id, req.body.note);
    res.redirect('/candidate/applications');
  } catch (error) {
    const job = await getJobById(req.params.id);
    res.status(400).render('home/job-detail', {
      title: job?.title || 'Chi tiết việc làm',
      job,
      applied: false,
      error: error.message
    });
  }
});

module.exports = router;
