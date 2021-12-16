const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        enum: ['Mr', 'Mrs', 'Miss']
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(phone) {
                return (/^\d{10}$/.test(phone))
            },
            message: 'Please fill a valid mobile number',
            isAsync: false
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            },
            message: 'Please fill a valid email address',
            isAsync: false
        },
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 15,
        // validate: {
        //     validator: function(password) {
        //         return /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8,15}$/.test(password)
        //     },
        //     message: 'Please enter a vaild password',
        //     isAsync: false
        // },
        // trim: true
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true
        }
    }
}, { timestamps: true })


module.exports = mongoose.model('user', userSchema)