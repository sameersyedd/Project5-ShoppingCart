const express = require('express');
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const mid = require('../middleware/mid.js')
const router = express.Router();

module.exports = router;

router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.post("/createbook", mid.userAuth, bookController.createbook)
router.get("/books", bookController.getBooksByFilter)
router.put("/books/:bookId", mid.userAuth, bookController.updateBookWithNewFeatures)
router.delete("/books/:bookId", mid.userAuth, bookController.deleteBookById)