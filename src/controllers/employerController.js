
const express = require('express');
const multer = require('multer');
const path = require('path');
const { requireRole } = require('../middleware/authMiddleware');
const { getEmployerProfile, updateEmployerProfile } = require('../services/userService');
const { getEmployerJobs, createJob, getJobForEmployer, updateJob, getApplicantsForEmployer } = require('../services/jobService');
const { getCareers } = require('../services/lookupsService');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/company')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage });

router.use(requireRole('employer'));

router.get('/dashboard', async (req, res) => {
  const jobs = await getEmployerJobs(req.user.id);
  const applicants = await getApplicantsForEmployer(req.user.id);
  res.render('employer/dashboard', { title: 'Dashboard nhà tuyển dụng', jobs, applicants });
});

router.get('/company', async (req, res) => {
  const profile = await getEmployerProfile(req.user.id);
  res.render('employer/company', { title: 'Giới thiệu công ty', profile, success: req.query.success || '' });
});

router.post('/company', upload.single('company_logo'), async (req, res) => {
  const companyName = req.body.company_name;
  await updateEmployerProfile(req.user.id, {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    companyName,
    companySlug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    companyDescription: req.body.company_description,
    companyWebsite: req.body.company_website,
    companyLogo: req.file ? `/static/uploads/company/${req.file.filename}` : null
  });
  res.redirect('/employer/company?success=Cập nhật công ty thành công');
});

router.get('/jobs', async (req, res) => {
  const jobs = await getEmployerJobs(req.user.id);
  res.render('employer/jobs', { title: 'Tin tuyển dụng', jobs });
});

router.get('/jobs/create', async (req, res) => {
  const careers = await getCareers();
  const profile = await getEmployerProfile(req.user.id);
  res.render('employer/job-form', { title: 'Đăng tin tuyển dụng', careers, job: null, profile, action: '/employer/jobs/create' });
});

router.post('/jobs/create', async (req, res) => {
  await createJob(req.user.id, {
    title: req.body.title,
    careerId: req.body.career_id,
    jobType: req.body.job_type,
    vacancy: req.body.vacancy,
    salary: req.body.salary,
    jobLevel: req.body.job_level,
    description: req.body.description,
    benefits: req.body.benefits,
    responsibility: req.body.responsibility,
    qualifications: req.body.qualifications,
    keywords: req.body.keywords,
    experience: req.body.experience,
    companyName: req.body.company_name,
    province: req.body.province,
    district: req.body.district,
    wards: req.body.wards,
    locationDetail: req.body.location_detail,
    companyWebsite: req.body.company_website,
    expirationDate: req.body.expiration_date,
    isFeatured: req.body.is_featured === '1'
  });
  res.redirect('/employer/jobs');
});

router.get('/jobs/:id/edit', async (req, res) => {
  const careers = await getCareers();
  const job = await getJobForEmployer(req.params.id, req.user.id);
  const profile = await getEmployerProfile(req.user.id);
  if (!job) return res.status(404).render('home/404', { title: '404' });
  res.render('employer/job-form', { title: 'Cập nhật tin tuyển dụng', careers, job, profile, action: `/employer/jobs/${job.id}/edit` });
});

router.post('/jobs/:id/edit', async (req, res) => {
  await updateJob(req.params.id, req.user.id, {
    title: req.body.title,
    careerId: req.body.career_id,
    jobType: req.body.job_type,
    vacancy: req.body.vacancy,
    salary: req.body.salary,
    jobLevel: req.body.job_level,
    description: req.body.description,
    benefits: req.body.benefits,
    responsibility: req.body.responsibility,
    qualifications: req.body.qualifications,
    keywords: req.body.keywords,
    experience: req.body.experience,
    companyName: req.body.company_name,
    province: req.body.province,
    district: req.body.district,
    wards: req.body.wards,
    locationDetail: req.body.location_detail,
    companyWebsite: req.body.company_website,
    expirationDate: req.body.expiration_date,
    isFeatured: req.body.is_featured === '1'
  });
  res.redirect('/employer/jobs');
});

router.get('/applicants', async (req, res) => {
  const applicants = await getApplicantsForEmployer(req.user.id);
  res.render('employer/applicants', { title: 'Hồ sơ ứng viên', applicants });
});

module.exports = router;
