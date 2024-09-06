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
    profile_status: { type: String, enum: ['approved', 'rejected', 'inprocess'] },
    user_type: { type: String, enum: ['individual', 'agency', 'customer', 'admin'] },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        // required:[true, 'Email address is required.'],
        validate: {
        validator: function(v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);  // Simple email regex
        },
        message: props => `${props.value} is not a valid email address!`
        }
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
        execptions: [Date]
    },
    preferred_locality: [String],
    pricing: [{ serviceId: mongoose.Schema.Types.ObjectId, price: Number }],
    name: { type: String },
    dob: { type: Date },
    gender: { type: String },
    profile_photo: {
        url: {
            type: String,
        },
        type: {
            type: String,
        }
    },
    address: {
        address:{
            type:String,
        },
        latitude:{
            type:Number,
        },
        longitude:{
            type:Number,
        },
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
        paymentNumber: { type: Number },
        bank_account_number: { type: String }, // for bank transfers
        IFSC_code: { type: String }, // for bank transfers
        branch_name: { type: String }, // for bank transfers
    },
    registered: { type: Boolean, default: false },
    fcm_token: {
        type: String
    },
    ratings:[Number],
    is_enable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const userModel = mongoose.model('user', userSchema);
module.exports = { userModel }