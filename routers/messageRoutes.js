const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');
const demoMode = require('../middlewares/demoMode');

router
  .route('/messages')
  .get(authController.protect, authController.restrictTo('admin'), messageController.getAllMessages);

router
  .route('/message/:id')
  .get(authController.protect, authController.restrictTo('admin'), messageController.detailMessage)
  .post(demoMode, authController.protect, authController.restrictTo('admin'), messageController.updateMessage);

router
  .route('/message/delete/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    messageController.deleteMessage
  );

module.exports = router;
