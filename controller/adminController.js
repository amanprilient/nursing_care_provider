const express = require('express');
const router = express.Router();
const messages = require("../shared/messages");
const { userModel } = require('../model/user.model');

exports.ChangeProfileStatus = async (req, res)=> {
    try {
        const {status, reject_reason, user_id} = req.body;
        if(res.locals.user.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        if(status == 'rejected'){
            if(!reject_reason || reject_reason == ''){
                let output = {
                    status:messages.STATUS_CODE_FOR_INVALID_INPUT,
                    message:"Reject reason is required."
                }
                res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
            }else{
                let updated = await userModel.findByIdAndUpdate(user_id, {$set:{profile_status:status, reject_reason:reject_reason}})
                let output = {
                    status:messages.STATUS_CODE_FOR_DATA_UPDATE,
                    message:messages.DATA_UPDATED
                }
                res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
            }
        }else{
            let updated = await userModel.findByIdAndUpdate(user_id, {$set:{profile_status:status}}, {new: true});
            let output = {
                status:messages.STATUS_CODE_FOR_DATA_UPDATE,
                message:messages.DATA_UPDATED
            }
            res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
        }
    } catch (error) { 
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
        status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
        message: messages.CATCH_BLOCK_ERROR,
        errorMessage: error.message
    });
    }
}
exports.ChangeUserType = async (req, res)=> {
    try {
        const {user_type, user_id} = req.body;
        if(res.locals.user.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        if(user_type == 'individual' || user_type == 'agency' || user_type == 'customer'){
            let updated = await userModel.findByIdAndUpdate(user_id, {$set:{user_type:user_type}})
            let output = {
                status:messages.STATUS_CODE_FOR_DATA_UPDATE,
                message:messages.DATA_UPDATED
            }
            res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
            }else{
                let output = {
                    status:messages.STATUS_CODE_FOR_INVALID_INPUT,
                    message:"Can not update! Not a valid user type."
                }
                res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
            }
    } catch (error) { 
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
        status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
        message: messages.CATCH_BLOCK_ERROR,
        errorMessage: error.message
    });
    }
}
exports.getUserList = async (req, res)=> {
    try {
        const user_type = req.query.user_type;
        if(res.locals.user.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        if(user_type == 'customer' || user_type == 'provider'){
            let searchQuery = {}
            user_type == 'customer' ? searchQuery = {user_type : 'customer'} : user_type == 'provider' ? searchQuery = {$or :[ {user_type : 'agency'}, {user_type:'individual'}] } : '' 
            let users = await userModel.find(searchQuery);
            let output = {
                status:messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message:messages.DATA_FOUND,
                data:users
            }
            res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
        }else{   
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json({
            status:messages.STATUS_CODE_FOR_BAD_REQUEST,
            messages:"Not a valid user type!"
        });
        }
    } catch (error) { 
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
        status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
        message: messages.CATCH_BLOCK_ERROR,
        errorMessage: error.message
    });
    }
}
