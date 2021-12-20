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

// const isValidRating = function(rating) {
//     if ((typeof(rating) === Number) && (rating == 1 || rating == 2 || rating == 3 || rating == 4 || rating == 5)) return true
// }


//API 8==========================================================================

const newReview = async function(req, res) {

        try {
            const requestBody = req.body
            const idFromParams = req.params.bookId

            if (!isValidRequestBody(requestBody)) {
                res.status(400).send({ status: false, Message: "Invalid request parameters, please provide review details" })
                return
            }

            //Extract params
            const { reviewedBy, rating, review } = requestBody

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


            if (!isValid(rating)) {
                res.status(400).send({ status: false, Message: "Please provide rating" })
                return
            }

            if (!(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: false, Message: "Invalid rating, please provide numbers only between 1 to 5" })
            }

            //Validation Ends

            const findBook = await bookModel.findOne({ _id: idFromParams, isDeleted: false })

            if (findBook) {
                const reviewData = { bookId: idFromParams, reviewedBy, rating }


                if (isValid(review)) {
                    reviewData['review'] = review.trim(); //Optional Field
                }

                const createReview = await reviewModel.create(reviewData)
                    //The $inc operator increments a field by a specified value
                const updatedBook = await bookModel.findOneAndUpdate({ _id: idFromParams, isDeleted: false }, { $inc: { reviews: 1 } })
                res.status(201).send({ status: true, Message: "New review created successfully", data: createReview })
            } else {
                res.status(404).send({ status: false, Message: "Can't find book!, book doesn't exists or is deleted" })
            }

        } catch (error) {
            res.status(500).send({ status: false, message: error.message })
        }
    }
    //API 9 - Update review
const updateReview = async function(req, res) {
    try {
        let requestBody = req.body
        let bookId = req.params.bookId.trim()
        let reviewId = req.params.reviewId.trim()
        let findBook = await bookModel.find({ _id: bookId, isDeleted: false })
        let findReview = await reviewModel.find({ _id: reviewId, isDeleted: false })

        if (!findBook) {
            return res.status(400).send({ status: false, message: 'Please provide a valid bookId' })
        }
        if (!findReview) {
            return res.status(400).send({ status: false, message: 'Please provide a valid reviewId' })
        }

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ Message: "plz provide valid review data for update" })
        }

        let { review, rating, reviewedBy } = requestBody

        if (review) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid review' })
            }
        }
        if (rating) {
            if (!isValid(rating)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid rating' })
            }
        }
        if (reviewedBy) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid reviewer name' })
            }
        }
        let updatedReviewData = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId }, requestBody, { new: true })
        if (updatedReviewData) {
            // let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false });
            let book = await bookModel.findOne({ _id: req.params.bookId, isDeleted: false })
            if (book) {
                let bookData = {
                    bookId: book._id,
                    title: book.title,
                    excerpt: book.excerpt,
                    userId: book.userId,
                    category: book.category,
                    subcategory: book.subcategory,
                    reviews: book.reviews,
                    reviewsData: []
                }
                let reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
                bookData.reviewsData = reviewsData
                res.status(201).send({ status: true, message: "Review updated successfully", data: bookData })
                return
            }
        } else {
            res.status(404).send({ status: false, message: "Either your book is deleted or your review is not present" })
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


//API 10 - Delete Review
const deleteReview = async function(req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let findBook = await bookModel.find({ _id: bookId, isDeleted: false })
        let findReview = await reviewModel.find({ _id: reviewId, isDeleted: false })

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, Message: "Invalid Book id in path params, please provide a vaild book ID" })
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, Message: "Invalid reviewId in path params, please provide a vaild reviewId" })
        }


        if (!(findBook && findReview)) {
            return res.status(400).send({ status: false, Message: "Please provide BookId and Review ID" })
        }

        let deletedReviewData = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })

        if (deletedReviewData) {
            const updateBookReviewCount = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: -1 } })
            res.status(200).send({ Message: "Review is Deleted", data: deletedReviewData })
        } else {
            res.status(404).send({ status: false, message: "Book not present or review already deleted" })
        }

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { newReview, updateReview, deleteReview }