const express = require('express');
const router = express.Router();
const categoryApiController = require('../controllers/categoryApiController');
const demoMode = require('../middlewares/demoMode');

router
  .route('/categories')
  .get(categoryApiController.getAllCategories);


module.exports = router;
