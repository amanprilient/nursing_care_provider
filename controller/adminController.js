const express = require('express');
const router = express.Router();
const messages = require("../shared/messages");
const { userModel } = require('../model/user.model');
const { appointmentModel } = require('../model/appointment.model');
const { orderModel } = require('../model/order.model');
const { serviceModel } = require('../model/service.model');
const { findUserById } = require('../service/userservice');
const util = require("../shared/util");

exports.ChangeProfileStatus = async (req, res)=> {
    try {
        const {status, reject_reason, user_id} = req.body;
        if(!res.locals?.user?.user_type && res.locals?.user?.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        if(!status || !user_id || !['approved', 'rejected', 'inprocess'].includes(status)){
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json({
                status:messages.STATUS_CODE_FOR_BAD_REQUEST,
                messages:messages.INVALID_INPUT
            });
        }
        let existUser = await userModel.findById(user_id);
        if(!existUser){
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json({
                status:messages.STATUS_CODE_FOR_BAD_REQUEST,
                messages:"User not found"
            });
        }
        let notificationMessage = null;
        if(status == 'rejected'){
            notificationMessage = 'Your Account has been rejected.';
            if(!reject_reason || reject_reason == ''){
                let output = {
                    status:messages.STATUS_CODE_FOR_INVALID_INPUT,
                    message:"Reject reason is required."
                }
                res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
            }else{
                let updated = await userModel.findByIdAndUpdate(user_id, {$set:{profile_status:status, reject_reason:reject_reason}});
                let userToSendNotification = await findUserById(user_id);
                const title = 'Account rejected';
                const body = notificationMessage;
                const screenName = 'Profile';
                // await util.sendNotification(userToSendNotification.data.fcm_token, title, body, screenName, userToSendNotification.data._id);
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
        if(!res.locals?.user?.user_type && res.locals?.user?.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        if(user_id){
            let existUser = await userModel.findById(user_id);
            if(!existUser){
                return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json({
                    status:messages.STATUS_CODE_FOR_BAD_REQUEST,
                    messages:"User not found!"
                });
            }
        }
        if((user_type == 'individual' || user_type == 'agency' || user_type == 'customer') && user_id){
            let updated = await userModel.findByIdAndUpdate(user_id, {$set:{user_type:user_type}});
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
        if(!res.locals?.user?.user_type && res.locals?.user?.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        if(user_type == 'customer' || user_type == 'provider'){
            let searchQuery = {}
            user_type == 'customer' ? searchQuery = {user_type : 'customer', is_enable:true} : user_type == 'provider' ? searchQuery = {$or :[ {user_type : 'agency', is_enable:true}, {user_type:'individual', is_enable:true}] } : '' 
            let users = await userModel.find(searchQuery);
            let output = {
                status:messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message:messages.DATA_FOUND,
                data:users
            }
           return res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
        }else{   
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json({
            status:messages.STATUS_CODE_FOR_BAD_REQUEST,
            messages:"Invalid user type!"
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
exports.deleteRestoreUser = async (req, res)=> {
    try {
        const {user_id, is_enable} = req.body;
        if(!res.locals?.user?.user_type && res.locals?.user?.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        if(!user_id || (is_enable !== 1 && is_enable !== 0)){
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json({
                status:messages.STATUS_CODE_FOR_BAD_REQUEST,
                messages:"user id or data to update not found!!"
            });
        }
        let user = await userModel.findByIdAndUpdate(user_id, {is_enable:is_enable == 1 ? true : false});
        if(user){
            let output = {
                status:messages.STATUS_CODE_FOR_DATA_UPDATE,
                message:is_enable == 0 ? 'User successfully deleted.' : 'User successfully restored.',
            }
           return res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
        }else{
            let output = {
                status:messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                message:'User not found!',
            }
           return res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
        }
        
    } catch (error) {
         res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
        status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
        message: messages.CATCH_BLOCK_ERROR,
        errorMessage: error.message
    });
    }
}
exports.getAllOrders = async (req, res)=> {
    try {
        if(!res.locals?.user?.user_type && res.locals?.user?.user_type != 'admin'){
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED).json({
                status:messages.STATUS_CODE_FOR_UNAUTHORIZED,
                messages:"Unauthorized user!"
            });
        }
        let orders = await orderModel.find({}).populate([{path:"service_id", model:serviceModel},{path:"service_provider_id", model:userModel},{path:"customer_id", model:userModel},{path:"appointment_id",model:appointmentModel}]);
        let output = {
            status:messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
            message:messages.DATA_FOUND,
            data:orders
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