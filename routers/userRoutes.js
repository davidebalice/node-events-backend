const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const bodyParser = require('body-parser');
const demoMode = require('../middlewares/demoMode');
const urlencodeParser = bodyParser.urlencoded({ extended: false });

router.route('/signup').post(demoMode, bodyParser.raw({ type: 'application/json' }), authController.signup);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.post('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);

router.route('/forgotPassword').post(demoMode, authController.forgotPassword);
router.route('/resetPassword/:token').patch(demoMode, authController.resetPassword);
router.route('/updatePassword').patch(demoMode, authController.updatePassword);
router.route('/updateUser').patch(demoMode, userController.updateUser);

router
  .route('/user/delete/:id')
  .post(demoMode, authController.protect, authController.restrictTo('admin', 'lead-guide'), userController.deleteUser);

router.use(authController.restrictTo('admin'));

router.route('/users').get(userController.getAllUsers).post(demoMode, userController.createUser);

router
  .route('/add/user')
  .get(authController.protect, function (req, res) {
    res.locals = { title: 'Add user', currentUser: res.locals.currentUser };
    res.render('Users/add', { formData: '', message: '' });
  })
  .post(demoMode, authController.protect, authController.restrictTo('admin', 'lead-guide'), userController.createUser);

router
  .route('/user/:id')
  .get(userController.editUser)
  .post(demoMode, authController.protect, authController.restrictTo('admin', 'lead-guide'), userController.updateUser);

router
  .route('/user/password/:id')
  .get(userController.editPassword)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    userController.updatePassword
  );

router
  .route('/user/photo/:id')
  .get(userController.photoUser)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updatePhoto
  );

router.route('/profile').get(userController.profile, async function (req, res) {
  res.locals = { title: 'Profile', currentUser: res.locals.currentUser };
});

router.route('/passwordMe').get(userController.passwordMe).post(demoMode, userController.updatePasswordMe);

module.exports = router;
