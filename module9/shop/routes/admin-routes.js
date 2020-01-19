const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin-controller');

const router = express.Router();


router.get('/add-product', adminController.getAddProduct);
router.get('/products', adminController.getProducts);
router.get('/edit-product/:id', adminController.getEditProduct)


router.post('/add-product', adminController.postAddProduct);
router.post('/edit-product', adminController.postEditProduct)
router.post('/delete-product', adminController.postDeleteProduct)

module.exports = router;
