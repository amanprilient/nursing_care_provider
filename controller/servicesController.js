const express = require("express");
const { userModel } = require("../model/user.model");
const validation = require("../shared/validation");
const messages = require('../shared/messages');
const util = require("../shared/util");
const logger = require("../shared/logger");
const { serviceModel } = require("../model/service.model");

exports.AddService = async (req, res) => {
    try {
        const name = req.body.name
        const description = req.body.description
        const _id = req.body._id
        if (!name || name == undefined || name == '') {
            const output = {
                status: messages.STATUS_CODE_FOR_INVALID_INPUT,
                message: "Name is mendatory"
            };
            return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
        }
        let service;
        if (_id) {
            service = await serviceModel.findOneAndUpdate(
                { _id, name },
                { name, description },
                { new: true, upsert: true }
            );
        } else {
            const newService = new serviceModel({ name, description });
            service = await newService.save();
        }
        const output = {
            statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
            message: messages.DATA_SAVED,
            _id: service._id
        };
        res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);

    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: error.message, code: error.code });
    }
}
exports.DeleteService = async (req, res) => {
    try {
        const _id = req.query._id;
        let deleted = await serviceModel.findByIdAndDelete(_id);
        if (deleted) {
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message: messages.DATA_UPDATED
            };
            res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
        } else {
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                message: messages.DATA_NOT_FOUND,
            };
            res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
        }
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: error.message, code: error.code });
    }
}