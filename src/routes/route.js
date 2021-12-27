const express = require('express');
const userController = require('../controllers/userController.js')
const productController = require('../controllers/productController.js')
const mid = require('../middleware/mid.js')
    // const validator = require('../validator/validator.js')
const router = express.Router();
module.exports = router;



//User Routes
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", mid.userAuth, userController.getUserDetail)
router.put("/user/:userId/profile", mid.userAuth, userController.updateUserProfile)

//Product Routes
router.post("/products", productController.registerProduct)
router.get("/products/:productId", productController.getProductById)
router.delete("/products/:productId", productController.deleteProductById)
router.get("/products", productController.productByQuery)