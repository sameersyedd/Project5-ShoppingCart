const express = require('express');
const userController = require('../controllers/userController.js')
const mid = require('../middleware/mid.js')
const router = express.Router();
module.exports = router;



//User Routes
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", mid.userAuth, userController.getUserDetail)
router.put("/user/:userId/profile", mid.userAuth, userController.updateUserProfile)