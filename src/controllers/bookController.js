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
            let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestBody
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
            const reviews = 0
            const bookDetails = { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt }
            const createBook = await bookModel.create(bookDetails)
            res.status(201).send({ status: true, message: "Success", data: createBook })
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
        const books = await bookModel.find(filterQuery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

        if (Array.isArray(books) && books.length === 0) {
            res.status(404).send({ status: false, message: 'No books found which matches the filters' })
            return
        }
        // const sortBooks = books.sort(function(a, b) { return a.title - b.title }) // Sorting a-z

        res.status(200).send({ status: true, message: 'Book List', data: books })

    } catch (error) {
        res.status(500).send({ Status: false, Message: error.message })
    }
}

//API 6 Update books by ID (PUT Books)
const updateBookWithNewFeatures = async function(req, res) {
    try {
        let requestBody = req.body
        let bookId = req.params.bookId
        let unchangedBook = await bookModel.find({ _id: bookId }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
        let fliterForUpdate = { _id: bookId, userId: req.decodedtoken, isDeleted: false }

        if (!isValidRequestBody(requestBody)) {
            res.status(200).send({ Message: "No updates applied, book data is unchanged", data: unchangedBook })
        }

        let { title, excerpt, releasedAt, ISBN } = requestBody

        if (title) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid title' })
            }
        }

        if (excerpt) {
            if (!isValid(excerpt)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid excerpt' })
            }
        }

        if (ISBN) {
            if (!isValid(ISBN)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' })
            }
        }

        if (releasedAt) {
            if (!isValid(releasedAt)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid release date' })
            }

            if (!(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt))) {
                res.status(400).send({ status: false, message: `${releasedAt} is invalid format, please enter date in YYYY-MM-DD format` })
                return
            }
        }

        let updatedBookData = await bookModel.findOneAndUpdate(fliterForUpdate, requestBody, { new: true }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        if (updatedBookData) {
            res.status(201).send({ status: true, message: "Book updated successfully", data: updatedBookData })
            return
        } else {
            res.status(201).send({ status: false, message: "Either your book is deleted or you are not an authorized user" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};

//API 7 - Delete books by ID

let deleteBookById = async function(req, res) {
    try {
        let bookId = req.params.bookId
        let filterForDelete = { _id: bookId, userId: req.decodedtoken, isDeleted: false }
        let deletedBook = await bookModel.findOneAndUpdate(filterForDelete, { isDeleted: true, deletedAt: new Date() }, { new: true })
        if (deletedBook) {
            res.status(200).send({ status: true, Message: "Book deleted successfully", data: deletedBook })
        } else {
            res.status(400).send({ status: false, message: "Cannot find book!, book is deleted already or you are not an authorized user to delete this book" })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { createbook, getBooksByFilter, updateBookWithNewFeatures, deleteBookById }