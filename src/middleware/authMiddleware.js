const { COOKIE_NAME, verifyToken } = require('../utils/auth');

function attachUser(req, res, next) {
  res.locals.currentUser = null;
  const token = req.cookies[COOKIE_NAME];

  if (token) {
    try {
      const user = verifyToken(token);
      req.user = user;
      res.locals.currentUser = user;
    } catch (error) {
      res.clearCookie(COOKIE_NAME);
    }
  }

  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    if (!roles.includes(req.user.role)) return res.status(403).render('home/403', { title: '403' });
    next();
  };
}

module.exports = { attachUser, requireAuth, requireRole };
