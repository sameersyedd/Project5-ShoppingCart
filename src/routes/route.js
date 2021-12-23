const express = require('express');
const userController = require('../controllers/userController.js')
const awsController = require('../controllers/awsController.js')
const mid = require('../middleware/mid.js')
const aws = require("aws-sdk");
const router = express.Router();
module.exports = router;



//User Routes
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", mid.userAuth, userController.getUserDetail)

//AWS s3 URL creating Route
router.post("/write-file-aws", awsController.Aws)