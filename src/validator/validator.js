const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const bcrypt = require('bcrypt')
let phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

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
const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//API 1 Register User Validation =======================================================
const vUser = async function(req, res, next) {
    try {
        const requestBody = req.body
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }
        // Extract params
        let { fname, lname, email, phone, password, address } = requestBody;

        if (!isValid(fname)) {
            res.status(400).send({ status: false, Message: "Please provide first name" })
            return
        }

        if (!isValid(lname)) {
            res.status(400).send({ status: false, Message: "Please provide last name" })
            return
        }

        if (!isValid(phone)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild phone number" })
            return
        }
        if (!(phoneRegex.test(phone.split(' ').join('')))) {
            res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
            return
        }
        if (!isValid(email)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild email" })
            return
        }
        if (!(emailRegex.test(email.split(' ').join('')))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }
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
        next();
    } catch (err) {
        res.status(500).send(err.message)
    }
}

// Product Validator

const vProduct = async function(req, res, next) {
    try {
        const requestBody = req.body
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide product details" })
            return
        }
        // Extract params
        let { title, description, price, currencyId, currencyFormat, style, availableSizes, installments, isFreeShipping } = requestBody;

        if (!isValid(title)) {
            res.status(400).send({ status: false, Message: "Please provide product title" });
            return;
        }
        //title = title.trim();
        title = title.split(" ").join("").trim();
        const istitleAlreadyUsed = await productModel.findOne({ title: title }); // {email: email} object shorthand property
        if (istitleAlreadyUsed) {
            res.status(400).send({ status: false, message: `${title} title is already registered`, });
            return;
        }
        if (!isValid(description)) {
            res.status(400).send({ status: false, Message: "Please provide product description" });
            return;
        }
        description = description.trim();
        if (!isValid(price)) {
            res.status(400).send({ status: false, Message: "Please provide price", });
            return;
        }
        if ((isNaN(price)) || (price <= 0)) {
            res.status(400).send({ status: false, Message: "Pleave provide price in number & greater than zero", });
            return;
        }
        if (!isValid(currencyId)) {
            res.status(400).send({ status: false, Message: "Please provide currency ID", });
            return;
        }
        if (!(currencyId == "INR")) {
            return res.status(400).send({ status: false, message: 'currency ID should be INR only' })
        }
        if (!isValid(currencyFormat)) {
            res.status(400).send({ status: false, Message: "Please provide currency Format" });
            return;
        }
        if (!(currencyFormat == '₹')) {
            res.status(400).send({ status: false, Message: "currencyFormat should only be ₹" });
            return;
        }
        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: 'Please provide at least one available size' })
        }
        if (installments) {
            if (isNaN(installments)) {
                return res.status(400).send({ status: false, message: `Please provide a valid number in Installments field` })
            }
        }
        next();
    } catch (err) {
        res.status(500).send(err.message)
    }
}

//Validate login

const validLogin = async function(req, res, next) {
    try {
        const requestBody = req.body
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

        const user = await userModel.findOne({ email: email });
        console.log(user)

        if (!user) {
            res.status(401).send({ status: false, message: `Invalid email, cannot find any user with ${email} email address` });
            return
        }

        const matchPassword = await bcrypt.compareSync(password, user.password) //matching original and encrypted

        if (!matchPassword) {
            return res.status(401).send({ status: false, message: 'Password Incorrect' })
        }
        next()
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

const vUserUpdate = async function(req, res, next) {
    try {
        const requestBody = req.body
        const { fname, lname, email, phone, password, address } = requestBody
        const userData = {}

        if (fname) {
            if (!isValid(fname)) {
                res.status(400).send({ status: false, Message: "Please provide user's first name" })
                return
            }
            userData.fname = fname
        }

        if (lname) {
            if (!isValid(lname)) {
                res.status(400).send({ status: false, Message: "Please provide user's last name" })
                return
            }
            userData.lname = lname
        }

        if (email) {
            if (!(emailRegex.test(email))) {
                return res.status(400).send({ status: false, msg: 'enter valid email' })
            }
            let Email = email.split(' ').join('')
            const isEmailAlreadyUsed = await userModel.findOne({ email: Email });
            if (isEmailAlreadyUsed) {
                res.status(400).send({ status: false, message: `${Email} email address is already registered` })
                return
            }
            userData.email = email
        }

        if (phone) {
            if (!(phoneRegex.test(phone))) {
                res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
                return
            }
            const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });

            if (isPhoneAlreadyUsed) {
                res.status(400).send({ status: false, message: `${phone}  phone is already registered` })
                return
            }
            userData.phone = phone
        }

        if (password) {
            if (!isValidPassword(password)) {
                res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })
                return
            }
            const encryptedPassword = await bcrypt.hash(password, 10)

            userData.password = encryptedPassword

        }
        const files = req.files

        if ((files && files.length > 0)) {
            const ProfilePicture = await uploadFile(files[0])
            userData.profileImage = ProfilePicture

        }

        if (address) {

            if (address.shipping) {

                if (address.shipping.street) {

                    if (!isValid(address.shipping.street)) {
                        res.status(400).send({ status: false, Message: "Please provide street name in shipping address" })
                        return
                    }
                    userData["address.shipping.street"] = address.shipping.street
                }

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) {
                        res.status(400).send({ status: false, Message: "Please provide city name in shipping address" })
                        return
                    }
                    userData["address.shipping.city"] = address.shipping.city
                }

                if (address.shipping.pincode) {
                    if (!isValid(address.shipping.pincode)) {
                        res.status(400).send({ status: false, Message: "Please provide pincode in shipping address" })
                        return
                    }
                    userData["address.shipping.pincode"] = address.shipping.pincode
                }

            }

            if (address.billing) {

                if (address.billing.street) {

                    if (!isValid(address.billing.street)) {
                        res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
                        return
                    }
                    userData["address.billing.street"] = address.billing.street
                }

                if (address.billing.city) {
                    if (!isValid(address.billing.city)) {
                        res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
                        return
                    }

                    userData["address.billing.city"] = address.billing.city
                }

                if (address.billing.pincode) {

                    if (!isValid(address.billing.pincode)) {
                        res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
                        return
                    }

                    userData["address.billing.pincode"] = address.billing.pincode
                }

            }
        }
        next()
    } catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}

module.exports = { vUser, vProduct, validLogin, vUserUpdate }