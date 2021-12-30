const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const mongoose = require('mongoose')


const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//Feature 3- API1 -create cart
const createCart = async function(req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "No item to add in cart" })
        }
        let { items } = requestBody
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid user id" })
        }
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(400).send({ status: false, msg: "user not found" })
        }

        const cartCheck = await cartModel.findOne({ userId: userId })

        if (!cartCheck) {
            //create cart and add products
            const totalItems1 = items.length
            console.log(totalItems1, "one")


            const product = await productModel.findOne({ _id: items[0].productId, isDeleted: false })

            if (!product) {
                return res.status(404).send({ status: false, message: "product don't exist or it's deleted" })
            }

            const totalPrice1 = product.price * items[0].quantity //This is checking the quantity number which we are giving in postman and then will multiply it with product price.

            const cartData = { items: items, totalPrice: totalPrice1, totalItems: totalItems1, userId: userId }
            const createCart = await cartModel.create(cartData)
            return res.status(201).send({ status: true, message: `cart created successfully & product added`, data: createCart })
        } else {
            //add products to existing cart
            const product = await productModel.findOne({ _id: items[0].productId }, { isDeleted: false })
            if (!product) {
                return res.status(404).send({ status: false, message: "product don't exist or it's deleted" })
            }
            const totalPrice1 = cartCheck.totalPrice + (product.price * items[0].quantity) //Firstly this will go into the db and check the userid's total price and then add product's price in it with it's respective quantities
                //Checking if the products exists in the cart already, to just increase the quantity
            for (let i = 0; i < cartCheck.items.length; i++) {
                if (cartCheck.items[i].productId == items[0].productId) {
                    cartCheck.items[i].quantity += items[0].quantity
                    const response = await cartModel.findOneAndUpdate({ userId: userId }, { items: cartCheck.items, totalPrice: totalPrice1 }, { new: true })
                    return res.status(201).send({ status: true, message: `product added in the cart successfully`, data: response })
                }
            }
            const totalItems1 = items.length + cartCheck.totalItems

            const cartData = await cartModel.findOneAndUpdate({ userId: userId }, { $addToSet: { items: { $each: items } }, totalPrice: totalPrice1, totalItems: totalItems1 }, { new: true })
            return res.status(201).send({ status: true, message: `product added in the cart successfully`, data: cartData })

        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//Feature 3 //API 3-get cart
const getCart = async(req, res) => {
    try {
        let paramsId = req.params.userId
        let checkId = isValidObjectId(paramsId);
        if (!checkId) {
            return res.status(400).send({ status: false, message: "Please Provide a valid userId in path params" });;
        }
        if (!(req.userId == paramsId)) {
            return res.status(400).send({ message: "You are not authorized to use cart" })
        }
        const cartGet = await cartModel.findOne({ userId: paramsId });
        return res.status(201).send({ status: true, message: 'Success', data: cartGet });
    } catch (err) {
        res.status(500).send(err.message)
    }
}

//Feature 3 - API 3 - Delete Cart/Empty Cart
const cartDelete = async function(req, res) {
    try {
        let paramsId = req.params.userId
        let checkId = isValidObjectId(paramsId);
        if (!checkId) {
            return res.status(400).send({ status: false, message: "Please Provide a valid userId in path params" });
        }
        if (!(req.userId == paramsId)) {
            return res.status(400).send({ message: "You are not authorized to delete this cart" })
        }

        const deletedCart = await cartModel.findOneAndUpdate({ userId: paramsId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        res.status(200).send({ status: true, msg: 'All items removed from cart, cart is now empty', data: deletedCart })
    } catch (err) {
        res.status(500).send(err.message)
    }
}


module.exports = { createCart, getCart, cartDelete }