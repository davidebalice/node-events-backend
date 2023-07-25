const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const demoMode = require('../utils/demo_mode');
const User = require('../models/userModel');

router
  .route('/categories')
  .get(authController.protect, categoryController.getAllCategories);

router
  .route('/add/category')
  .get(authController.protect, function (req, res) {
    res.locals = { title: 'Add category' };
    res.render('Categories/add', { formData: '', message: '' });
  })
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

/*
app.post('/categories/move', async (req, res) => {
  try {
    const { categoryId, direction } = req.body;
    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Categoria non trovata' });
    }

    // Ottieni tutte le categorie ordinate per il campo "order"
    const allCategories = await db.Category.findAll({
      order: [['order', 'ASC']],
    });

    const currentIndex = allCategories.findIndex(
      (cat) => cat.id === categoryId
    );

    if (direction === 'up' && currentIndex > 0) {
      // Scambia l'ordine della categoria corrente con quella precedente
      [
        allCategories[currentIndex].order,
        allCategories[currentIndex - 1].order,
      ] = [
        allCategories[currentIndex - 1].order,
        allCategories[currentIndex].order,
      ];
    } else if (
      direction === 'down' &&
      currentIndex < allCategories.length - 1
    ) {
      // Scambia l'ordine della categoria corrente con quella successiva
      [
        allCategories[currentIndex].order,
        allCategories[currentIndex + 1].order,
      ] = [
        allCategories[currentIndex + 1].order,
        allCategories[currentIndex].order,
      ];
    } else {
      return res.status(400).json({ message: 'Operazione non valida' });
    }

    await Promise.all(allCategories.map((cat) => cat.save()));

    res.json({ message: 'Ordine delle categorie aggiornato con successo' });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: "Errore durante l'aggiornamento dell'ordine delle categorie",
      });
  }
});
*/

module.exports = router;
