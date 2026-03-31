const express = require('express');
const router = express.Router();
const { createToken, COOKIE_NAME } = require('../utils/auth');
const { createCandidate, createEmployer, validateLogin } = require('../services/userService');

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Đăng nhập', error: null });
});

router.post('/login', async (req, res) => {
  const user = await validateLogin(req.body.email, req.body.password);
  if (!user) {
    return res.status(400).render('auth/login', { title: 'Đăng nhập', error: 'Email hoặc mật khẩu không đúng.' });
  }

  const token = createToken(user);
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax' });

  if (user.role === 'candidate') return res.redirect('/candidate/profile');
  if (user.role === 'employer') return res.redirect('/employer/dashboard');
  return res.redirect('/admin/dashboard');
});

router.get('/register/candidate', (req, res) => {
  res.render('auth/register-candidate', { title: 'Đăng ký ứng viên', error: null });
});

router.post('/register/candidate', async (req, res) => {
  try {
    await createCandidate(req.body);
    res.redirect('/login');
  } catch (error) {
    res.status(400).render('auth/register-candidate', { title: 'Đăng ký ứng viên', error: error.message });
  }
});

router.get('/register/employer', (req, res) => {
  res.render('auth/register-employer', { title: 'Đăng ký nhà tuyển dụng', error: null });
});

router.post('/register/employer', async (req, res) => {
  try {
    await createEmployer(req.body);
    res.redirect('/login');
  } catch (error) {
    res.status(400).render('auth/register-employer', { title: 'Đăng ký nhà tuyển dụng', error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.redirect('/');
});

module.exports = router;
