const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidPassword = function(password) {
    if (password.length > 7 && password.length < 16)
        return true
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
        let { fname, lname, email, profileImage, phone, password, address } = requestBody; // Object destructing
        //Validation Starts
        if (!isValid(fname)) {
            res.status(400).send({ status: false, Message: "Please provide first name" })
            return
        }
        fname = fname.trim()

        if (!isValid(lname)) {
            res.status(400).send({ status: false, Message: "Please provide last name" })
            return
        }
        lname = lname.trim()

        if (!isValid(phone)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild phone number" })
            return
        }

        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone.split(' ').join('')))) {
            res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild email" })
            return
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.split(' ').join('')))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }

        if (!isValid(profileImage)) {
            res.status(400).send({ status: false, Message: "Please provide profile image" })
            return
        }

        profileImage = profileImage.trim()

        let jpgValid = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g //need to be replaced
        if (!jpgValid.test(profileImage)) {
            res.status(400).send({ status: false, message: `Please povide a valid URL for profile image` })
            return
        }

        // let httpValid = /(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/
        // if (!httpValid.test(profileImage)) {
        //     res.status(400).send({ status: false, message: `Please povide a valid URL for profile image` })
        //     return
        // }

        if (!isValid(password)) {
            res.status(400).send({ status: false, Message: "Please provide password" })
            return
        }

        const encryptedPassword = await bcrypt.hash(password, 10); //encrypting password using bcrypt

        if (!isValidPassword(password)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })
            return
        }

        if (!isValid(address)) {
            res.status(400).send({ status: false, Message: "Please provide address" })
            return
        }

        if (!isValid(address.shipping)) {
            res.status(400).send({ status: false, Message: "Please provide shipping address" })
            return
        }

        if (!isValid(address.shipping.street)) {
            res.status(400).send({ status: false, Message: "Please provide shipping street name" })
            return
        }

        if (!isValid(address.shipping.city)) {
            res.status(400).send({ status: false, Message: "Please provide shipping city" })
            return
        }

        if (!isValid(address.shipping.pincode)) {
            res.status(400).send({ status: false, Message: "Please provide shipping pincode" })
            return
        }


        if (!isValid(address.billing)) {
            res.status(400).send({ status: false, Message: "Please provide billing address" })
            return
        }

        if (!isValid(address.billing.street)) {
            res.status(400).send({ status: false, Message: "Please provide billing street" })
            return
        }

        if (!isValid(address.billing.city)) {
            res.status(400).send({ status: false, Message: "Please provide billing city" })
            return
        }

        if (!isValid(address.billing.pincode)) {
            res.status(400).send({ status: false, Message: "Please provide billing pincode" })
            return
        }

        let Email = email.split(' ').join('')
        const isEmailAlreadyUsed = await userModel.findOne({ email: Email }); // {email: email} object shorthand property

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${Email} email address is already registered` })
            return
        }
        let Phone = phone.split(' ').join('')
        const isPhoneAlreadyUsed = await userModel.findOne({ phone: Phone });

        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${Phone}  phone is already registered` })
            return
        }

        let FPhone = phone.split(' ').join('');
        let FEmail = email.split(' ').join('')
        const userData = { fname, lname, phone: FPhone, email: FEmail, password: encryptedPassword, address, profileImage }

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

        const user = await userModel.findOne({ email });

        if (!user) {
            res.status(401).send({ status: false, message: `Invalid email, cannot find any user with ${email} email address` });
            return
        }

        const matchPassword = await bcrypt.compareSync(password, user.password) //matching original and encrypted

        if (!matchPassword) {
            return res.status(401).send({ status: false, message: 'Password Incorrect' })
        }

        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12
        }, 'group7')



        res.status(200).send({ status: true, message: `user login successfull`, data: { token, userId: user._id } });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

//API 3 -Get User Details

const getUserDetail = async(req, res) => {
    try {
        const userId = req.params.userId
            // console.log(userId)
            // const IdFromToken = req.userId
            // console.log(IdFromToken)
            // if (userId == IdFromToken) {
        const profileUser = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!profileUser) {
            return res.status(404).send({ status: false, message: "user profile does not exist" });
        }
        const Data = await userModel.findOne({ userId: userId, isDeleted: false })
        return res.status(200).send({ status: true, message: 'user profile details', data: Data })
            // } else {
            //     res.status(404).send({ status: false, Message: "User Not Found!!" })
            // }
    } catch (error) {
        return res.status(500).send({ success: false, error: error.message });
    }
}

module.exports = { registerUser, loginUser, getUserDetail }