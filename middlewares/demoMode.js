const demoMode = (req, res, next) => {
  if (process.env.DEMO_MODE === 'true') {
    req.session.flashMessage = 'Demo mode active, CRUD operations are not allowed.';
    res.redirect('back');
  } else {
    next();
  }
};

module.exports = demoMode;
