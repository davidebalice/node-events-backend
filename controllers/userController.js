const User = require('../models/userModel');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const catchAsync = require('../middlewares/catchAsync');
const mongoose = require('mongoose');
const factory = require('./handlerFactory');
const AppError = require('../middlewares/error');
const multer = require('multer');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/assets/images/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let filterData = {};
  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = { name: { $regex: regex } };
  }
  const setLimit = 20;
  const limit = req.query.limit * 1 || setLimit;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;
  const users = await User.find(filterData).sort({ createdAt: -1, surname: 1 }).skip(skip).limit(limit);
  const count = await User.countDocuments();
  const totalPages = Math.ceil(count / limit);

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'User added';
    } else if (req.query.m === '2') {
      message = 'User deleted';
    }
  }
  res.render('Users/users', {
    title: 'Users',
    users,
    page,
    limit,
    totalPages,
    currentPage: page,
    message,
    flashMessage: flashMessage || null,
  });
});

exports.addUser = catchAsync(async (req, res, next) => {
  res.locals = { title: 'Add user', currentUser: res.locals.currentUser };
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.render('Users/add', {
    formData: '',
    message: '',
    flashMessage: flashMessage || null,
  });
});

exports.editUser = catchAsync(async (req, res, next) => {
  let query = await User.findById(req.params.id);

  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  let message = '';

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Users/edit', {
    status: 200,
    title: 'Edit user',
    formData: doc,
    message: message,
    flashMessage: flashMessage || null,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const doc = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.redirect(doc._id);
});

exports.photoUser = catchAsync(async (req, res, next) => {
  let query = await User.findById(req.params.id);

  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  let message = '';
  res.render('User/photo', {
    status: 200,
    title: 'Photo user',
    formData: doc,
    message: message,
  });
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  req.body.photo = req.file.filename;
  const doc = await User.findByIdAndUpdate(req.params.id, req.body);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.redirect('/user/photo/' + doc._id);
});

exports.createUser = catchAsync(async (req, res, next) => {
  try {
    req.body._id = new mongoose.Types.ObjectId();
    await User.create(req.body);
    res.redirect('/users?m=1');
  } catch (err) {
    const flashMessage = req.session.flashMessage;
    req.session.flashMessage = null;

    res.render('Users/add', {
      status: 200,
      title: 'Add user',
      formData: req.body,
      message: err.message,
      flashMessage: flashMessage || null,
    });
  }
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const doc = await User.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.redirect('/users?m=2');
});

exports.editPassword = catchAsync(async (req, res, next) => {
  let query = await User.findById(req.params.id).select('+password');
  const doc = await query;
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Users/password', {
    status: 200,
    title: 'Edit password',
    formData: doc,
    message: '',
    flashMessage: flashMessage || null,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  try {
    const { password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      return res.render('Users/password', {
        status: 400,
        title: 'Update password',
        formData: null,
        message: 'Password not match',
      });
    }

    const hashedNewPassword = await bcrypt.hash(password, 12);

    const doc = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedNewPassword },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    const flashMessage = req.session.flashMessage;
    req.session.flashMessage = null;

    const message = 'Password updated';
    res.render('Users/password', {
      status: 200,
      title: 'Update password',
      formData: doc,
      message: message,
      flashMessage: flashMessage || null,
    });
  } catch (err) {
    const doc = await User.findById(req.params.id, req.body);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    const flashMessage = req.session.flashMessage;
    req.session.flashMessage = null;

    res.render('Users/password', {
      status: 500,
      title: 'Update password',
      formData: doc,
      message: err.message,
      flashMessage: flashMessage || null,
    });
  }
});

exports.photoUser = catchAsync(async (req, res, next) => {
  let query = await User.findById(req.params.id);

  const doc = await query;
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  let message = '';
  res.render('Users/photo', {
    status: 200,
    title: 'Photo user',
    formData: doc,
    message: message,
    flashMessage: flashMessage || null,
  });
});

exports.profile = catchAsync(async (req, res, next) => {
  const user = req.user;

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Users/profile', {
    title: 'Profile',
    formData: user,
    DEMO_MODE: process.env.DEMO_MODE,
    message: req.flash('message'),
    error: req.flash('error'),
    flashMessage: flashMessage || null,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }

  const filteredBody = filterObj(req.body, 'surname', 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  req.flash('message', 'Profile updated successfully');
  req.flash('error', 'Error during update');

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Users/profile', {
    title: 'Profile',
    formData: updatedUser,
    DEMO_MODE: process.env.DEMO_MODE,
    message: req.flash('message'),
    error: req.flash('error'),
    flashMessage: flashMessage || null,
  });
});

exports.passwordMe = catchAsync(async (req, res, next) => {
  const user = req.user;

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Users/passwordMe', {
    title: 'Change password',
    formData: user,
    DEMO_MODE: process.env.DEMO_MODE,
    message: req.flash('message'),
    error: req.flash('error'),
    flashMessage: flashMessage || null,
  });
});

exports.updatePasswordMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  try {
    const { password, passwordConfirm, oldPassword } = req.body;

    if (password !== passwordConfirm) {
      const flashMessage = req.session.flashMessage;
      req.session.flashMessage = null;

      return res.render('Users/passwordMe', {
        status: 400,
        title: 'Update password',
        formData: user,
        message: 'Password not match',
        flashMessage: flashMessage || null,
      });
    }

    const isOldPasswordCorrect = await user.correctPassword(oldPassword, user.password);

    if (!isOldPasswordCorrect) {
      const flashMessage = req.session.flashMessage;
      req.session.flashMessage = null;

      return res.render('Users/passwordMe', {
        status: 400,
        title: 'Update password',
        formData: user,
        message: 'Old password is incorrect',
        flashMessage: flashMessage || null,
      });
    }

    const hashedNewPassword = await bcrypt.hash(password, 12);

    const doc = await User.findByIdAndUpdate(
      user._id,
      { password: hashedNewPassword },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    const flashMessage = req.session.flashMessage;
    req.session.flashMessage = null;

    const message = 'Password updated';
    res.render('Users/passwordMe', {
      status: 200,
      title: 'Update password',
      formData: doc,
      message: message,
      flashMessage: flashMessage || null,
    });
  } catch (err) {
    const doc = await User.findById(user._id, req.body);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    const flashMessage = req.session.flashMessage;
    req.session.flashMessage = null;

    res.render('Users/passwordMe', {
      status: 500,
      title: 'Update password',
      formData: user,
      message: err.message,
      flashMessage: flashMessage || null,
    });
  }
});
