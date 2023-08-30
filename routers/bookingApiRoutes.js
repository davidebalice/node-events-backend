const express = require('express');
const router = express.Router();
const bookingApiController = require('../controllers/bookingApiController');
const demoMode = require('../middlewares/demoMode');

router.route('/payment-intent').post(bookingApiController.createStripeIntent);
router.route('/booking/create').post(bookingApiController.createBooking);

/*
router
  .route('/add/category')
  .get(authController.protect, categoryController.addCategory)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.createCategory
  );

router
  .route('/category/:id')
  .get(categoryController.editCategory)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.updateCategory
  );

router
  .route('/category/photo/:id')
  .get(categoryController.photoCategory)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.uploadImage,
    categoryController.resizeImage,
    categoryController.updatePhoto
  );

router
  .route('/category/delete/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );

router
  .route('/move/category')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.moveCategory
  );

router
  .route('/active/category/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.activeCategory
  );
*/
module.exports = router;
