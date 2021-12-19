const express = require('express');
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const mid = require('../middleware/mid.js')
const router = express.Router();

module.exports = router;

//User Routes
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)

//Book Routes
router.post("/createbook", mid.userAuth, bookController.createbook)
router.get("/books", bookController.getBooksByFilter)
router.put("/books/:bookId", mid.userAuth, bookController.updateBookWithNewFeatures)
router.delete("/books/:bookId", mid.userAuth, bookController.deleteBookById)

//Review Routes
router.post("/books/:bookId/review", reviewController.newReview)