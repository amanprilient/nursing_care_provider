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
            let newAppointment = new appointmentModel(detailsTosave);
            let saved = await newAppointment.save();
        const output = {
            statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
            message: messages.DATA_SAVED,
        };
       return res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);

    } catch (error) {
         return res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });   
    }
}  
exports.UpdateAppointment = async (req, res)=> {
    try {
        const {status, notes, reject_reason, reschedule_date, reschedule_timeSlot} = req.body;
        const _id = req.query._id
        let detailsTosave = {
            status:status?.toLowerCase(), notes, reject_reason, reschedule_date, reschedule_timeSlot
        }
            if (detailsTosave.status === "rescheduled") {
                if (!detailsTosave.reschedule_date || new Date(detailsTosave.reschedule_date) < new Date()) {
                    const output = {
                        statusCode: messages.STATUS_CODE_FOR_INVALID_INPUT,
                        message: "Appointment date is required and can not be in the past!",
                    };
                     return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
                }
                if (!detailsTosave.reschedule_timeSlot || !detailsTosave.reschedule_timeSlot.start || new Date(detailsTosave.reschedule_timeSlot.start) < new Date()) {
                    const output = {
                        statusCode: messages.STATUS_CODE_FOR_INVALID_INPUT,
                        message: "Start time is required and can not be is the past!",
                    };
                     return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
                }
                if (!detailsTosave.reschedule_timeSlot || !detailsTosave.reschedule_timeSlot.end || new Date(detailsTosave.reschedule_timeSlot.end) < new Date()) {
                    const output = {
                    statusCode: messages.STATUS_CODE_FOR_INVALID_INPUT,
                    message: "End time is required and can not be is the past!",
                };
                 return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
                }
            }
            if(detailsTosave.status == 'rejected'){
                if(!reject_reason || reject_reason == ''){
                    const output = {
                        statusCode: messages.STATUS_CODE_FOR_INVALID_INPUT,
                        message: "Reason for rejection is required!",
                    };
                     return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
                }
            }
            let updated = await appointmentModel.findByIdAndUpdate(_id, detailsTosave);
        const output = {
            statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
            message: messages.DATA_SAVED,
        };
         return res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);

    } catch (error) {
         return res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
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
             return res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
        } else{
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                message: messages.DATA_NOT_FOUND,
                data:[]
            };
             return res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
        }
    } catch (error) {
         return res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });   
    }
}
exports.AppointmentDetails = async (req, res)=> {
    try {
        const appointment_id = req.query._id;
        let appointment = await appointmentModel.findById(appointment_id).populate([
            {model:userModel, path:'customer'},{model:userModel,path:'service_provider'},{model:serviceModel,path:'service'}
        ]);
        if(!appointment){
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                message: messages.DATA_NOT_FOUND,
                data:{}
            };
             return res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
        }else{
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message: messages.DATA_FOUND,
                data:appointment
            };
             return res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
        }
    } catch (error) {
         return res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });   
    }
}
exports.AppointmentFeedback = async (req, res)=> {
    try {
        const appointment_id = req.query._id;
        const {rating, comment} = req.body;
        if(!rating || rating < 1 || rating > 5 || !comment || comment == ''){
            const output = {
                statusCode: messages.STATUS_CODE_FOR_INVALID_INPUT,
                message: "All fields are mendatory and Rating can not be less than 1 and greater than 5.",
                data:{}
            };
           return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
        }
        let appointment = await appointmentModel.findById(appointment_id);
        if(!appointment){
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                message: messages.DATA_NOT_FOUND,
                data:{}
            };
           return res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
        }else{
            let feedback = {
                rating:rating,
                comment:comment,
                date:new Date()
            }
            let updated = await appointmentModel.findByIdAndUpdate(appointment_id, {feedback:feedback});
            let updated_user = await userModel.findByIdAndUpdate(appointment.service_provider, {$push:{ratings:rating}});
            const output = {
                statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
                message: messages.DATA_FOUND,
                data:appointment
            };
           return res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
        }
    } catch (error) {
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });   
    }
}