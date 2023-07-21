const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const demoMode = require('../utils/demo_mode');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/reviews')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.getAllReviews
  );

router
  .route('/review/:id')
  .get(reviewController.editReview)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.updateReview
  );

  router
  .route('/review/delete/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    reviewController.deleteReview
  );


module.exports = router;
