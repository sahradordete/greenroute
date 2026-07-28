exports.requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  // if the user is logged in but it is not an admin redirect to error page
  // this will be used in cases where the user is logged in but tries to 
  // access /admin in the search bar
  if (req.session.user.role !== 'admin') {
    return res.status(403).render('errors/403', { title: 'Forbidden' });
  }
  next();
};