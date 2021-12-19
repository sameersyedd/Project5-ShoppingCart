const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const mongoose = require('mongoose')

//==========================================================================
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

const isValidRating = function(rating) {
    if ((typeof(rating) == Number) && (rating == 1 || rating == 2 || rating == 3 || rating == 4 || rating == 5))
        return true
}


//API 8==========================================================================

const newReview = async function(req, res) {

    try {
        const requestBody = req.requestBody
        const idFromParams = req.params.bookId
        console.log(idFromParams)
        console.log(typeof idFromParams)

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, please provide review details" })
            return
        }

        //Extract params
        const { bookId, reviewedBy, rating, review } = requestBody

        // Validation Starts
        if (!isValid(bookId)) {
            res.status(400).send({ status: false, message: "Please provide book ID" })
            return
        }

        if (!isValidObjectId(bookId)) {
            res.status(400).send({ status: false, Message: "Invalid Book id in request body, please provide a vaild book ID" })
            return
        }

        if (!isValid(idFromParams)) {
            res.status(400).send({ status: false, message: "Please provide book ID" })
            return
        }

        if (!isValidObjectId(idFromParams)) {
            res.status(400).send({ status: false, Message: "Invalid Book id in path params, please provide a vaild book ID" })
            return
        }

        if (!isValid(reviewedBy)) {
            res.status(400).send({ status: false, message: "Please provide reviewedBy name" })
            return
        }

        // if (!isValid(reviewedAt)) {
        //     res.status(400).send({ status: false, message: 'reviewedAt date is required' })
        //     return
        // }

        if (!isValid(rating)) {
            res.status(400).send({ status: false, Message: "Please provide rating" })
            return
        }

        if (!isValidRating(rating)) {
            res.status(400).send({ status: false, Message: "Invalid rating, please provide a rating number in 1 to 5 range" })
            return
        }

        if (!isValid(review)) {
            res.status(400).send({ status: false, Message: "Please provide review" })
            return
        }
        //Validation Ends

        const findBook = await bookModel.findOne({ _id: idFromParams, isDeleted: false })

        if (findBook) {
            const reviewData = { bookId, reviewedBy, rating, review }

            // if (isValid(review)) {
            //     reviewData['review'] = review.trim(); //Optional Field
            // }

            const createReview = await reviewModel.create(reviewData)
                //The $inc operator increments a field by a specified value
            const updatedBook = await bookModel.findOneAndUpdate({ _id: idFromParams, isDeleted: false }, { $inc: { reviews: 1 } })
            res.status(200).send({ status: true, Message: "New review created successfully", data: createReview })
        } else {
            res.status(400).send({ status: false, Message: "Can't find book!, book doesn't exists or is deleted" })
        }

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { newReview }