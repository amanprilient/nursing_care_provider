const express = require("express");
const { userModel } = require("../model/user.model");
const validation = require("../shared/validation");
const messages = require('../shared/messages');
const util = require("../shared/util");
const logger = require("../shared/logger");
const { serviceModel } = require("../model/service.model");

exports.AddService = async (req, res) => {
    try {
        const {name, description, service_image, _id} = req.body
        // if (!name || name == undefined || name == '' || !description || description == undefined || description == '' || !service_image || ervic  ) {
        //     const output = {
        //         status: messages.STATUS_CODE_FOR_INVALID_INPUT,
        //         message: "Name is mendatory"
        //     };
        //     return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
        // }
        let service;
        if (_id) {
            let existedService = await serviceModel.findById(_id);
             if(!existedService){
                const output = {
                    statusCode: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                    message: messages.DATA_NOT_FOUND,
                    data:{}
                };
                res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
             }else{
                const documentPath = path.join(__dirname, '../', existedService.service_image.url);
                await util.deleteFile(documentPath);
                 service = await serviceModel.findOneAndUpdate(
                     { _id },
                     { name, description, service_image },
                     { new: true, upsert: true }
                    );
                }
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
        let errors = []
        error.split(",").map(val=> {
            errors.push(val)
        })
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
        status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
        message: messages.CATCH_BLOCK_ERROR,
        errorMessage: errors
    });
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
        let errors = []
        error.split(",").map(val=> {
            errors.push(val)
        })
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
        status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
        message: messages.CATCH_BLOCK_ERROR,
        errorMessage: errors
    });
    }
}