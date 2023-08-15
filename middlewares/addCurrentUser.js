module.exports = (req, res, next) => {
  res.locals.currentUser = res.locals.currentUser;
  next();
};
