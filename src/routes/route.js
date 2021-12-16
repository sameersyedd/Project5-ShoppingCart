const express = require('express');
const userController = require('../controllers/userController')
    //const bookController = require('../controllers/bookController')
    //const Midd = require('../middleware/authMiddleware')
const router = express.Router();

module.exports = router;

router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)