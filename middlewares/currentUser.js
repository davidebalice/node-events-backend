// middleware/userData.js
const User = require('../models/userModel');

module.exports = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      res.locals.currentUser = user;
    } else {
      if (req.session && req.session.user) {
        const user = await User.findById(req.session.user._id);
        res.locals.currentUser = user;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
