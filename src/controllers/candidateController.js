
const express = require('express');
const multer = require('multer');
const path = require('path');
const { requireRole } = require('../middleware/authMiddleware');
const { getCandidateProfile, updateCandidateProfile } = require('../services/userService');
const { getCandidateApplications } = require('../services/jobService');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/cv')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage });

router.use(requireRole('candidate'));

router.get('/profile', async (req, res) => {
  const profile = await getCandidateProfile(req.user.id);
  res.render('candidate/profile', { title: 'Hồ sơ ứng viên', profile, success: req.query.success || '', error: '' });
});

router.post('/profile', upload.single('cv_file'), async (req, res) => {
  try {
    await updateCandidateProfile(req.user.id, {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      headline: req.body.headline,
      cvFile: req.file ? `/static/uploads/cv/${req.file.filename}` : null
    });
    res.redirect('/candidate/profile?success=Cập nhật hồ sơ thành công');
  } catch (error) {
    const profile = await getCandidateProfile(req.user.id);
    res.status(400).render('candidate/profile', { title: 'Hồ sơ ứng viên', profile, success: '', error: error.message });
  }
});

router.get('/applications', async (req, res) => {
  const applications = await getCandidateApplications(req.user.id);
  res.render('candidate/applications', { title: 'Danh sách ứng tuyển', applications });
});

module.exports = router;
