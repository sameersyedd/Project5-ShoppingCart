const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validator = require('../validator/validator')

const createCart = async function(req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body
        const decodedId = req.userId
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        }

        const user = await userModel.findOne({ _id: userId })

        if (!user) {
            return res.status(404).send({ status: false, message: `user not found` })
        }

        if (decodedId.toString() !== userId) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'No paramateres passed' })
        }
        const { productId, quantity } = requestBody
        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, message: 'productId id is required' })
        }

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is an invalid productId` })
        }
        if (!validator.isValid(quantity)) {
            return res.status(400).send({ status: false, message: ' quantity is required' })
        }
        let product = await productModel.findOne({ _id: productId })

        let totalPrice = 0
        for (let i = 0; i < quantity; i++) {
            totalPrice += product.price
        }
        const totalItems = quantity
        const items = { productId, quantity }
        const cartData = { userId, items, totalPrice, totalItems }
        let newCart = await cartModel.create(cartData);
        return res.status(201).send({ status: true, message: `product added to cart successfully`, data: newCart });
    } catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}

module.exports = { createCart }