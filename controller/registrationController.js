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
        // console.log(req.body.email, "@@@", res.locals.user.user_type);
        const { email, services, city, preferred_working_hours, pricing, name, dob, gender, specialties, qualifications, experience_years, payment_details, address } = req.body;

        const requiredFields = [
            // 'agency_name', 'email', 'city', 'dob', 'gender',
            'services', 'preferred_working_hours', 'pricing', 'name',
            'specialties', 'qualifications', 'experience_years', 'payment_details'
        ];
        let errors = [];

        for (let field of requiredFields) {
            if (!body[field] || body[field] === 'undefined' || body[field] === undefined || body[field] === null) {
                errors.push(`"${field}" is required and cannot be blank.`);
            }
        }

        if (errors.length > 0 && (res.locals.user.user_type == 'individual' || res.locals.user.user_type == 'agency')) {
            const output = {
                status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                message: messages.DATA_NOT_FOUND,
                errors: errors
            };
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);
        }


        let documents;
        if (req.files && req.files.documents && req.files.documents.length > 0 && (res.locals.user.user_type == 'individual' || res.locals.user.user_type == 'agency')) {
            documents = util.handleDocuments(req.files);
        }
        let certifications
        if (req.files && req.files.certifications && req.files.certifications.length > 0 && (res.locals.user.user_type == 'individual' || res.locals.user.user_type == 'agency')) {
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
        let updated = await userModel.findByIdAndUpdate(res.locals.user._id, fieldsForSave);
        if (updated) {
            const output = {
                status: messages.STATUS_CODE_FOR_DATA_UPDATE,
                message: messages.DATA_UPDATED
            };
            return res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
        }

    } catch (error) {
        console.log(error, "-----------er");
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });
    }
}