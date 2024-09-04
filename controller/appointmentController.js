const express = require('express');
const { appointmentModel } = require('../model/appointment.model');
const router = express.Router();
const messages = require("../shared/messages");
const { userModel } = require('../model/user.model');
const { serviceModel } = require('../model/service.model');
const { findAppointment } = require('../service/appointmentservice');


exports.BookAppointment = async (req, res)=> {
    try {
        const {service_provider, service, price, appointment_date, timeSlot, status, payment_status, notes, reject_reason, location, _id} = req.body;
        const customer_id = res.locals.user._id;

        let detailsTosave = {
            customer:customer_id, service_provider, service, price, appointment_date, timeSlot, status, payment_status, notes, reject_reason, location
        }
        if(_id){
            let updated = await appointmentModel.findByIdAndUpdate(_id, detailsTosave);
        }else{
            let newAppointment = new appointmentModel(detailsTosave);
            let saved = await newAppointment.save();
        }
        const output = {
            statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
            message: messages.DATA_SAVED,
            _id: service._id
        };
        res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);

    } catch (error) {
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });   
    }
}  
exports.GetAppointment = async (req, res)=> {
    try {
        // let appointment = appointmentModel.find({}).populate([
        //     {path:'customer', model:userModel}, 
        //     {path:'service_provider', model:userModel},
        //     {path:'service', model:serviceModel}]);
        let appointments = await findAppointment(res.locals.user._id, res.locals.user.user_type);
        if(appointments.success){
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message: messages.DATA_FOUND,
                data:appointments.data
            };
            res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
        } else{
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                message: messages.DATA_NOT_FOUND,
                data:[]
            };
            res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
        }
    } catch (error) {
        console.log(error,"---------error")
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });   
    }
}