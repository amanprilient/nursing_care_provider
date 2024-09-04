const express = require("express");
const { userModel } = require("../model/user.model");
const validation = require("../shared/validation");
const messages = require('../shared/messages');
const { createOtpForMobileNo } = require("../shared/util");
const util = require("../shared/util");
const logger = require("../shared/logger");

exports.Register = async (req, res) => {
    try {
        const body = req.body;
        const user = res.locals.user
        // console.log(req.body.email, "@@@", user.user_type);
        const { email, services, city, preferred_working_hours, pricing, name, dob, gender, specialties, qualifications, experience_years, payment_details, address } = req.body;
        
        const existUser = await userModel.findById(user._id,{registered:1});

        const requiredFields = [
            // 'email', 'city', 'dob', 'gender',
            'services', 'preferred_working_hours', 'pricing', 'name',
            'specialties', 'qualifications', 'experience_years', 'payment_details'
        ];
        let errors = [];

        for (let field of requiredFields) {
            if (!body[field] || body[field] === 'undefined' || body[field] === undefined || body[field] === null) {
                errors.push(`"${field}" is required and cannot be blank.`);
            }
            if(field == "preferred_working_hours"){
                const { days, hours } = JSON.parse(body[field]);
                if (days.length === 0) {
                    errors.push('Preferred working date is required.');
                }
                if (!hours || typeof hours !== 'object' || !hours.start || !hours.end) {
                    errors.push('Hours should include both start and end times.');
                } else {
                    if (isNaN(new Date(hours.start)) || isNaN(new Date(hours.end))) {
                        errors.push('Start and end of preferred hours should be valid dates.');
                    }
                }
            }
        }

        if (errors.length > 0 && (user.user_type == 'individual' || user.user_type == 'agency')) {
            const output = {
                status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                message: messages.DATA_NOT_FOUND,
                errors: errors
            };
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);
        }

        let documents;
        if ((user.user_type == 'individual' || user.user_type == 'agency') && !existUser.registered) {
            documents = util.handleDocuments(req.files);
        }
        let certifications
        if ((user.user_type == 'individual' || user.user_type == 'agency') && !existUser.registered) {
            certifications = util.handleCertificates(req.files);
        }
        let profile_photo
        if (req.files && req.files.profile_photo) {
            const fileType = req.files['profile_photo'][0].mimetype.split('/')[0];
            profile_photo = {
                url: req.files['profile_photo'][0].path,
                type: fileType
            }
        }
        let fieldsForSave = {
            email, services, city, preferred_working_hours: preferred_working_hours ? JSON.parse(preferred_working_hours) : {}, pricing, name, dob, gender, specialties, qualifications, experience_years, payment_details, documents, certifications, profile_photo, registered: true, address
        }
        let updated = await userModel.findByIdAndUpdate(user._id, fieldsForSave,{new:true});
        if (updated) {
            const output = {
                status: messages.STATUS_CODE_FOR_DATA_UPDATE,
                message: messages.DATA_UPDATED
            };
            return res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
        }

    } catch (error) {
        let errors = [];
        error.message.split(",").map(val=> {
            errors.push(val);
        })
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            // errorMessage: error.message
            errorMessage: errors
        });
    }
}