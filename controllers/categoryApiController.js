const multer = require('multer');
const sharp = require('sharp');
const Category = require('../models/categoryModel');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const factory = require('./handlerFactory');
const multerStorage = multer.memoryStorage();

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find().sort('order');

  if (categories) {
    res.status(200).json({
      categories,
    });
  } else {
    return res.status(404).json({
      status: 'fail',
      message: 'categories not found',
    });
  }
});
