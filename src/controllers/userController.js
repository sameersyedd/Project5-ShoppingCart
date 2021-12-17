const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle = function(title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}


//API 1 Register User =================================================================================================

const registerUser = async function(req, res) {
    try {
        const requestBody = req.body

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }

        // Extract params
        const { title, name, phone, email, password, address } = requestBody; // Object destructing
        //Validation Starts
        if (!isValidTitle(title)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild title" })
            return
        }

        if (!isValid(title)) {
            res.status(400).send({ status: false, Message: "Please provide title" })
            return
        }

        if (!isValid(name)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild name" })
            return
        }

        if (!isValid(phone)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild phone number" })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild email" })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild password" })
            return
        }

        if (!isValid(address)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild address" })
            return
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        }

        const isPhoneAlreadyUsed = await userModel.findOne({ phone });

        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone}  phone is already registered` })
            return
        }
        const userData = { title, name, phone, email, password, address }
        const newUser = await userModel.create(userData);

        res.status(201).send({ status: true, message: `User registered successfully`, data: newUser });

    } catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }

}

//API 2 - Login User===================================================================================================
const loginUser = async function(req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
            return
        }

        // Extract params
        const { email, password } = requestBody;

        // Validation starts
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: `Email is required` })
            return
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        }

        const user = await userModel.findOne({ email, password });

        if (!user) {
            res.status(401).send({ status: false, message: `Invalid login credentials` });
            return
        }
        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 30
        }, 'group1')

        res.header('x-api-key', token);
        res.status(200).send({ status: true, message: `user login successfull`, data: { token } });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}





module.exports = { registerUser, loginUser }
