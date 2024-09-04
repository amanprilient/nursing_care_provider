const express = require("express");
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name:{type: String, required:true, unique:true},
    description: {type: String}
}, { timestamps:true });

const serviceModel = mongoose.model("service", serviceSchema);
module.exports = { serviceModel }