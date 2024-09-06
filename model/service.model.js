const express = require("express");
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: { 
        type: String,
        required:[true, "Serive name is required."],
        unique: true },
    description: { type: String, required:[true, "Description is reuired."] },
    service_image: {
        url: {
            type: String,
            required:[true, 'service image is required']
        },
        type: {
            type: String,
            required:[true, 'service image is required']
        },
    }
}, { timestamps: true });

const serviceModel = mongoose.model("service", serviceSchema);
module.exports = { serviceModel }