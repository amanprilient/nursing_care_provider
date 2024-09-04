const express = require('express');
const { appointmentModel } = require('../model/appointment.model');
const router = express.Router();
const messages = require("../shared/messages");
const { userModel } = require('../model/user.model');
const { serviceModel } = require('../model/service.model');
const { findAppointment } = require('../service/appointmentservice');


exports.BookAppointment = async (req, res)=> {
    try {
        const {service_provider, service, price, appointment_date, timeSlot, status, payment_status, notes, reject_reason, location, _id, reschedule_date, reschedule_timeSlot} = req.body;
        const customer_id = res.locals.user._id;

        let detailsTosave = {
            customer:customer_id, service_provider, service, price, appointment_date, timeSlot, status, payment_status, notes, reject_reason, location, reschedule_date, reschedule_timeSlot
        }
        if(_id){
            if (detailsTosave.status === "rescheduled") {
                if (!detailsTosave.reschedule_date || new Date(detailsTosave.reschedule_date) < new Date()) {
                    throw new Error("Appointment date is required and cannot be in the past.");
                }
                if (!detailsTosave.reschedule_timeSlot || !detailsTosave.reschedule_timeSlot.start || new Date(detailsTosave.reschedule_timeSlot.start) < new Date()) {
                    throw new Error("Start time is required and cannot be in the past.");
                }
                if (!detailsTosave.reschedule_timeSlot || !detailsTosave.reschedule_timeSlot.end || new Date(detailsTosave.reschedule_timeSlot.end) < new Date()) {
                    throw new Error("End time is required and cannot be in the past.");
                }
            }
            let updated = await appointmentModel.findByIdAndUpdate(_id, detailsTosave);
        }else{
            let newAppointment = new appointmentModel(detailsTosave);
            let saved = await newAppointment.save();
        }
        const output = {
            statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
            message: messages.DATA_SAVED,
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
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });   
    }
}