const express = require("express");
const fs = require('fs');
const path = require('path');
const { userModel } = require("../model/user.model");
const validation = require("../shared/validation");
const messages = require('../shared/messages');
const util = require("../shared/util");
const logger = require("../shared/logger");
const { serviceModel } = require("../model/service.model");
const { findUserByService } = require("../service/userservice");

exports.AddService = async (req, res) => {
    try {
        const { name, description, _id } = req.body;
        let service;
        if(res.locals.user.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        if (_id) {
            let existedService = await serviceModel.findById(_id);
            if (!existedService) {
                const output = {
                    statusCode: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                    message: messages.DATA_NOT_FOUND,
                    data: {}
                };
                res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
            } else {
                let service_image
                if (req.files && req.files.service_image) {
                    const fileType = req.files['service_image'][0].mimetype.split('/')[0];
                    service_image = {
                        url: req.files['service_image'][0].path,
                        type: fileType
                    }
                }
                if(existedService.service_image.url){
                    const documentPath = path.join(__dirname, '../', existedService.service_image.url);
                    await util.deleteFile(documentPath);
                }
                service = await serviceModel.findOneAndUpdate(  
                    { _id },
                    { name, description, service_image },
                    { new: true, upsert: true }
                );
                const output = {
                    statusCode: messages.STATUS_CODE_FOR_DATA_UPDATE,
                    message: messages.DATA_UPDATED,
                    data: service
                };
                res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
            }
        } else {
            let service_image
            if (req.files && req.files.service_image) {
                const fileType = req.files['service_image'][0].mimetype.split('/')[0];
                service_image = {
                    url: req.files['service_image'][0].path,
                    type: fileType
                }
            }
            const newService = new serviceModel({ name, description, service_image });
            service = await newService.save();
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message: messages.DATA_SAVED,
                _id: service._id
            };
            res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
        }

    } catch (error) { 
        let errors = []
        error.message.split(",").map(val => {
            errors.push(val)
        })
         res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.code == 11000 ? 'Service already exist!' : errors
        });
    }
}
exports.DeleteService = async (req, res) => {
    try {
        const _id = req.query._id;
        if(!_id){
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                message: "Service id se required!",
                data: {}
            };
           return res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
        }
        if(res.locals.user.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        let deleted = await serviceModel.findByIdAndDelete(_id);
        if(deleted.service_image.url){
            const documentPath = path.join(__dirname, '../', deleted.service_image.url);
            await util.deleteFile(documentPath);
        }
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
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });
    }
}
exports.getAllServices = async (req,res)=> {
    try {
        let services = await serviceModel.find({});
        let output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message: "Services found.",
                data: services
            }
        return res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
    } catch (error) { 
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
        status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
        message: messages.CATCH_BLOCK_ERROR,
        errorMessage: error.message
    });
    }
}
exports.serviceDetails = async (req,res)=> {
    try {
        let service_id = req.query.service_id
        let service = await serviceModel.findById({_id:service_id});
        let output = {  
                statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message: "Service found.",
                data: service
            }
        return res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
    } catch (error) { 
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
        status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
        message: messages.CATCH_BLOCK_ERROR,
        errorMessage: error.message
    });
    }
}
