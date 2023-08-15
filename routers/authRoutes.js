const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const bodyParser = require('body-parser');
const demoMode = require('../middlewares/demoMode');
const urlencodeParser = bodyParser.urlencoded({ extended: false });
const DEMO_MODE = process.env.DEMO_MODE === true;

router
  .route('/login')
  .get(function (req, res) {
    res.render('Auth/auth-login', {
      title: 'Login',
      DEMO_MODE: process.env.DEMO_MODE,
      message: req.flash('message'),
      error: req.flash('error'),
    });
  })
  .post(urlencodeParser, authController.login);

router.route('/logout').get(authController.logout);

module.exports = router;
