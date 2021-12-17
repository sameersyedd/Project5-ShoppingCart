const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')
const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId) {
        return mongoose.Types.ObjectId.isValid(objectId)
    }
    // Api 3    **  *************** Create book **************

const createbook = async function(req, res) {
    try {
        let id = req.body.userId
        let decodedId = req.decodedtoken
        if (id == decodedId) {
            const requestBody = req.body;
            if (!isValidRequestBody(requestBody)) {
                res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide book details" })
                return
            }
            let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = requestBody
            //validation start
            if (!isValid(title)) {
                res.status(400).send({ status: false, msg: "tilte is required" })
            }
            // title =title.trim()
            const isTitleAlreadyExsit = await bookModel.findOne({ title })
            if (isTitleAlreadyExsit) {
                res.status(400).send({ msg: "title already exsist" })
                return
            }
            if (!isValid(excerpt)) {
                res.status(400).send({ status: false, msg: "excerpt is required" })
                return
            }
            if (!isValid(userId)) {
                res.status(400).send({ status: false, msg: "userId is required" })
                return
            }
            if (!isValidObjectId(userId)) {
                res.status(400).send({ status: false, msg: "userId is invalid" })
                return
            }
            if (!isValid(ISBN)) {
                res.status(400).send({ status: false, msg: "ISBN is required" })
                return
            }
            //  ISBN = ISBN.trim()
            const isISBNalreadyExsist = await bookModel.findOne({ ISBN })
            if (isISBNalreadyExsist) {
                res.status(400).send({ msg: "ISBN already exsist" })
                return
            }
            if (!isValid(category)) {
                res.status(400).send({ status: false, message: "category is required" })
                return
            }
            if (!isValid(subcategory)) {
                res.status(400).send({ status: false, message: "subcategory is required" })
                return
            }

            if (!isValid(releasedAt)) {
                res.status(400).send({ status: false, message: "releasedAt is required" })
                return
            }
            if (!(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt))) {
                res.status(400).send({ status: false, message: `${releasedAt} is invalid format, please enter date in YYYY-MM-DD format` })
                return
            }
            //^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$

            const isUserExist = await userModel.findOne({ userId })

            if (!isUserExist) {
                res.status(404).send({ status: false, message: "User doesn't exist" })
            }

            requestBody.releasedAt = new Date(requestBody.releasedAt)

            const bookDetails = await bookModel.create(requestBody)
            res.status(201).send({ status: true, message: "Success", data: bookDetails })
        } else {
            res.status(400).send({ status: false, message: "Unauthorized access, Invalid User Id" })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })

    }
}

//API 4- Get Books

const getBooksByFilter = async function(req, res) {
    try {
        const filterQuery = { isDeleted: false, deletedAt: null }
        const queryParams = req.query

        if (isValidRequestBody(queryParams)) {
            const { userId, category, subcategory } = queryParams


            if (isValid(userId) && isValidObjectId(userId)) {
                filterQuery['userId'] = userId
            }

            if (isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if (isValid(subcategory)) {
                filterQuery['subcategory'] = subcategory.trim()
            }

        }
        const books = await bookModel.find(filterQuery)

        if (Array.isArray(books) && books.length === 0) {
            res.status(404).send({ status: false, message: 'No books found which matches the filters' })
            return
        }
        res.status(200).send({ status: true, message: 'Book List', data: books })
    } catch (error) {
        res.status(500).send({ Status: false, Message: error.message })
    }
}
module.exports = { createbook, getBooksByFilter }