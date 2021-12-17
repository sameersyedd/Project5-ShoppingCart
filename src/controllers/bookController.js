const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')
const isValid = function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true
}

 const isValidRequestBody = function(requestBody){
     return Object.keys(requestBody).length > 0
 }

 const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
 // Api 1    **  *************** Create book **************
 
 const createbook = async function(req, res) {
     try {
         const requestBody = req.body;
         if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide book details" })
            return
        }
        let {title,excerpt,userId,ISBN,category,subcategory,reviews,releasedAt} = requestBody
        //validation start
        if(!isValid(title)){
            res.status(400).send({status:false,msg:"tilte is required"})
        }
       // title =title.trim()
        const isTitleAlreadyExsit = await bookModel.findOne({title})
        if(isTitleAlreadyExsit){
            res.status(400).send({msg : "title already exsist"})
            return
        }
        if(!isValid(excerpt)){
            res.status(400).send({status:false,msg:"excerpt is required"}) 
            return
        }
       if(!isValid(userId)){
        res.status(400).send({status:false,msg:"userId is required"}) 
        return
       }
       if(!isValidObjectId(userId)){
           res.status(400).send({status:false,msg:"userId is invalid"})
           return
       }
       if(!isValid(ISBN)){
        res.status(400).send({status:false,msg:"ISBN is required"}) 
        return
       }
     //  ISBN = ISBN.trim()
       const isISBNalreadyExsist = await bookModel.findOne({ISBN})
       if(isISBNalreadyExsist){
        res.status(400).send({msg : "ISBN already exsist"})
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

    const isUserExist = await userModel.findOne({ userId })

    if (!isUserExist) {
        res.status(404).send({ status: false, message: "User doesn't exist" })
    }
    requestBody.releasedAt = new Date(requestBody.releasedAt)
    //console.log(requestBody.releasedAt)
    const bookDetails = await bookModel.create(requestBody)
    res.status(201).send({status: true,message:"Success",data:bookDetails})




     }catch(err){
         console.log(err)
        res.status(500).send({ status: false, msg: err.message })

     }
 }
       
       module.exports={createbook}