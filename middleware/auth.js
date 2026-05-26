const isAdmin = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  req.flash('error', 'Please login to access admin panel');
  res.redirect('/admin/login');
};

module.exports = { isAdmin };
