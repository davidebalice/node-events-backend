const express = require('express');
const router = express.Router();
const messageApiController = require('../controllers/messageApiController');
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const recaptcha = new Recaptcha('TUA_CHIAVE_DEL_SITO_RECAPTCHA', 'TUA_CHIAVE_SEGRETA_RECAPTCHA');

router.route('/message/send').post(messageApiController.sendMessage);
router.route('/recaptcha/verify', recaptcha.middleware.verify, (req, res) => {
  if (req.recaptcha.error) {
    res.status(400).send('Verifica reCAPTCHA not passed.');
  } else {
    res.status(200).send('Verifica reCAPTCHA passed.');
  }
});

module.exports = router;
