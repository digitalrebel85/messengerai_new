function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

function isGuest(req, res, next) {
  if (!req.session || !req.session.userId) {
    return next();
  }
  res.redirect('/dashboard');
}

module.exports = {
  isAuthenticated,
  isGuest
};