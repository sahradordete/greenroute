exports.showRegister = (req, res) => {
  return res.render('auth/register', { title: 'Register', query: req.query });
};

exports.showLogin = (req, res) => {
  return res.render('auth/login', { title: 'Login', query: req.query });
};