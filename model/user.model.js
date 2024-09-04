const express = require("express");
const { Timestamp } = require("firebase-admin/firestore");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    mobile_number: {
        type: Number,
        require: true,
        unique: true,
    },
    otp: { type: String },
    profile_status: { type: String, enum: ['approved', 'rejected', 'inprocess']},
    user_type: { type: String, enum: ['individual', 'agency', 'customer', 'admin']},
    email: { 
        type: String,
        unique: true,
        sparse: true 
    },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    city: { type: String },
    documents: [{
        url: {
            type: String,
        },
        type: {
            type: String,
        }
    }],
    preferred_working_hours: {
        days: [String],
        hours: {
            start: Date,
            end: Date,
        },
    },
    pricing: [{ serviceId: mongoose.Schema.Types.ObjectId, price: Number }],
    name: { type: String},
    dob: { type: Date},
    gender: { type: String},
    profile_photo: {
        url: {
            type: String,
        },
        type: {
            type: String,
        }
    },
    address:{
        type:String
    },
    specialties: [String],
    qualifications: [String],
    experience_years: { type: Number },
    certifications: [{
        url: {
            type: String,
        },
        type: {
            type: String,
        }
    }],
    payment_details: {   
        paymentNumber:{type:Number}
    // method: { type: String }, // e.g., 'credit_card', 'paypal', 'bank_transfer'
    // card_number: { type: String }, // for credit card payments (ensure to encrypt this field)
    // card_expiry_date: { type: String }, // e.g., 'MM/YY'
    // card_cvv: { type: String }, // for credit card payments (ensure to encrypt this field)
    // bank_account_number: { type: String }, // for bank transfers
    // bank_routing_number: { type: String }, // for bank transfers
    // billing_address: {
    //     street: { type: String },
    //     city: { type: String },
    //     state: { type: String },
    //     zip_code: { type: String },
    //     country: { type: String }
    // }
},
    registered:{type:Boolean, default:false},
    fcm_token:{
        type:String
    },
    is_enable:{
        type:Boolean,
        default:true
    }
}, {timestamps:true});

// const validateFields = (next)=> {
//     const requiredFields = [
//         // 'agency_name', 'email', 'city', 'dob', 'gender',  'name'
//         'services', 'preferred_working_hours', 'pricing', 'name',
//         'specialties', 'qualifications','experience_years', 'payment_details'
//     ];

//     const doc = this._update || this

//     for (let field of requiredFields) {
//         if (!doc[field] || (typeof doc[field] === 'string' && doc[field].trim() === '')) {
//             const error = new Error(`${field} is required and cannot be null, undefined, or blank.`);
//             error.status = 400; // Bad Request
//             return next(error);
//         }
//     }

//     // If all required fields are valid, proceed to save
//     next();
// };

// userSchema.pre('save', validateFields);
// userSchema.pre('updateMany', validateFields);
// userSchema.pre('updateOne', validateFields);
// userSchema.pre('findOneAndUpdate', validateFields);
// userSchema.pre('findByIdAndUpdate', validateFields);

const userModel = mongoose.model('user', userSchema);
module.exports = { userModel }