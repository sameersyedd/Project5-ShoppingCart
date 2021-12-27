// const { userModel, productModel } = require('../models')

// const User = async(req, res, next) => {

//     try {
//         const isValid = function(value) {
//             if (typeof value === 'undefined' || value === null) return false
//             if (typeof value === "string" && value.trim().length === 0) return false
//             return true;
//         }

//         const isValidRequestBody = function(requestBody) {
//             return Object.keys(requestBody).length > 0
//         }

//         const isValidObjectId = function(objectId) {
//             return mongoose.Types.ObjectId.isValid(objectId)
//         }

//         const isValidSize = function(title) {
//             return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(title) !== -1
//         }
//     } catch (error) {

//     }
// }



// const checkProduct = async function(req, res, next) {
//     try {
//         const productBody = req.body
//         if (!isValidRequestBody(productBody)) {
//             return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
//         }
//         let { title, description, price, productImage, style, availableSizes } = productBody;
//         if (!isValid(title)) {
//             return res.status(400).send({ status: false, message: "Please provide title or title field" });
//         }
//         if (!isValid(description)) {
//             return res.status(400).send({ status: false, message: "Please provide description or description field" });
//         }
//         if (!isValid(price)) {
//             return res.status(400).send({ status: false, message: "Please provide price or price field" });;
//         }
//         if (!isNumber(price)) {
//             return res.status(400).send({ status: false, message: "Price should be a number or an integer" });;
//         }
//         if (!isValid(productImage)) {
//             return res.status(400).send({ status: false, message: "Please provide productImage or productImage field" });
//         }
//         if (!isKeyPresent(availableSizes)) {
//             return res.status(400).send({ status: false, message: "Please provide phone number or phone field" });
//         }
//         let alreadyused = await userModel.find();
//         let dbLen = alreadyused.length;
//         if (dbLen != 0) {
//             const duplicateTitle = await productModel.find({ title: title });
//             const titleFound = duplicateTitle.length;
//             if (titleFound != 0) {
//                 return res.status(400).send({ status: false, message: "This title is already exists with another product" });
//             }
//         }
//         next();
//     } catch (err) {
//         res.status(500).send(err.message)
//     }
// }

// const createProduct = async function(req, res) {
//     try {

//         const product = req.body
//         product.currencyId = "INR"
//         product.currencyFormat = "₹"

//         const productCreate = await productModel.create(product);

//         return res.status(201).send({ status: true, message: 'Success', data: productCreate });
//     } catch (err) {
//         res.status(500).send(err.message)
//     }
// }