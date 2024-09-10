const express = require("express");
const fs = require('fs');
const path = require('path');
const { userModel } = require("../model/user.model");
const validation = require("../shared/validation");
const messages = require('../shared/messages');
const { createOtpForMobileNo } = require("../shared/util");
const util = require("../shared/util");
const logger = require("../shared/logger");
const { url } = require("inspector");

exports.Register = async (req, res) => {
    try {
        const body = req.body;
        const user = res.locals.user
        const { email, services, city, preferred_working_hours, pricing, name, dob, gender, specialties, qualifications, experience_years, payment_details, address, preferred_locality } = req.body;

        // const existUser = await userModel.findById(user._id,{registered:1});

        const validationResult = await validateFields(body, user.user_type);

        if (validationResult.length > 0 && (user.user_type == 'individual' || user.user_type == 'agency' || user.user_type == 'customer')) {
            const output = {
                status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                message: messages.DATA_NOT_FOUND,
                errors: validationResult
            };
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);
        }

        let documents;
        if ((user.user_type == 'individual' || user.user_type == 'agency')) {
            documents = util.handleDocuments(req.files);
        }
        let certifications
        if ((user.user_type == 'individual' || user.user_type == 'agency')) {
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
            email, services, city, preferred_working_hours: preferred_working_hours ? JSON.parse(preferred_working_hours) : {}, pricing, name, dob, gender, specialties, qualifications, experience_years, payment_details, documents, certifications, profile_photo, registered: true, address, preferred_locality
        }
        let updated = await userModel.findByIdAndUpdate(user._id, fieldsForSave, { new: true });
        if (updated) {
            const output = {
                status: messages.STATUS_CODE_FOR_DATA_UPDATE,
                message: messages.DATA_UPDATED
            };
            return res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
        }

    } catch (error) {
        console.log(error,"900909")
        let errors = [];
        error.message.split(",").map(val => {
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
exports.DeleteDocuments = async (req, res) => {
    try {
        const { documentsToDelete, deleteAll, fileType } = req.body; // List of document paths to delete
        const user = res.locals.user; //user

        if (user.user_type == 'admin' || user.user_type == 'customer') {
            const output = {
                status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                message: 'This type of user has no documents',
            };
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);
        }

        if (deleteAll == true) {
            if (fileType == 'document') {
                await deleteDocs('all', user._id, user.documents, 'document');
            } else if (fileType == 'certificate') {
                await deleteDocs('all', user._id, user.certifications, 'certificate');
            } else {
                const output = {
                    status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                    message: 'No documents specified for deletion',
                };
                return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);
            }
        } else {
            if (!documentsToDelete || !Array.isArray(documentsToDelete) || documentsToDelete.length === 0) {
                const output = {
                    status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                    message: 'No documents specified for deletion',
                };
                return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);
            }
            if (fileType == 'document' && documentsToDelete.some(doc=> doc.url.includes("documents"))) {
                await deleteDocs(documentsToDelete, user._id, user.documents, 'document');
            } else if (fileType == 'certificate'  && documentsToDelete.some(doc=> doc.url.includes("certifications"))) {
                await deleteDocs(documentsToDelete, user._id, user.certifications, 'certificate');
            } else {
                const output = {
                    status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                    message: 'No documents specified for deletion',
                };
                return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);
            }
        }
        const output = {
            status: messages.STATUS_CODE_FOR_DATA_UPDATE,
            message: 'Documents deleted successfully',
        };
        return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);

    } catch (error) {
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });
    }
};
exports.DeleteProfile = async (req, res) => {
    try {
        if (res?.locals?.user?.profile_photo?.url) {
            const documentPath = path.join(__dirname, '../', res.locals.user.profile_photo.url);
            await util.deleteFile(documentPath);
            let user = await userModel.findOneAndUpdate({ _id: res.locals.user._id }, { profile_photo: {} });
            const output = {
                status: messages.STATUS_CODE_FOR_DATA_UPDATE,
                message: 'Profile deleted successfully',
            };
            return res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
        } else {
            const output = {
                status: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
                message: 'Profile not found!',
            };
            return res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
        }
    } catch (error) {
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });
    }
};
exports.UpdateProfile = async (req, res) => {
    try {
        let profile_photo
        if (req.files && req.files.profile_photo) {
            const fileType = req.files['profile_photo'][0].mimetype.split('/')[0];
            profile_photo = {
                url: req.files['profile_photo'][0].path,
                type: fileType
            }
            if (res?.locals?.user?.profile_photo?.url) {
                const documentPath = path.join(__dirname, '../', res.locals.user.profile_photo.url);
                await util.deleteFile(documentPath);
            }
            let updateProfile = await userModel.findByIdAndUpdate(res.locals.user._id, { profile_photo: profile_photo });
            const output = {
                status: messages.STATUS_CODE_FOR_DATA_UPDATE,
                message: 'Profile updated successfully',
            };
            return res.status(messages.STATUS_CODE_FOR_DATA_UPDATE).json(output);
        } else {
            const output = {
                status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                message: 'Profile photo is required!',
            };
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST).json(output);
        }
    } catch (error) {
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.message
        });
    }
};

const validateFields = async (body, user_type) => {
    let requiredFields = [];
    if (user_type == 'individual' || user_type == 'agency') {
        requiredFields = [
            'services', 'preferred_working_hours', 'pricing', 'name','dob',
            'specialties', 'qualifications', 'experience_years', 'payment_details', 'preferred_locality', 'email'
        ];
    } else if (user_type == 'customer') {
        requiredFields = [
            'name', "address", 'city', 'email',
        ];
    }
    let errors = [];

    for (let field of requiredFields) {
        if (!body[field] || body[field] === 'undefined' || body[field] === undefined || body[field] === null) {
            errors.push(`"${field}" is required and cannot be blank.`);
        }
        if (field == "preferred_working_hours" && (user_type == 'individual' || user_type == 'agency')) {
            const { days, hours } = body[field] ? JSON.parse(body[field]) : '';
            if (days && days.length === 0) {
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
    return errors
};
const deleteDocs = async (selected, id, docs, doc_type) => {
    const validDocumentsToDelete = selected === 'all' ? docs : docs.filter(doc => selected.some(deleteDoc=> deleteDoc.url == doc.url));

    if (validDocumentsToDelete.length === 0) {
        return new Error('No matching documents found for deletion');
    }
    await Promise.all(validDocumentsToDelete.map(async (document) => {
        const documentPath = path.join(__dirname, '../', document.url);
        await util.deleteFile(documentPath);
    }));
    let user = await userModel.findById(id);
    if (doc_type == 'document') {
        user.documents = user.documents.filter(doc => !validDocumentsToDelete.some(deletedDoc=> deletedDoc.url == doc.url));
    } else if (doc_type == 'certificate') {
        user.certifications = user.certifications.filter(doc => !validDocumentsToDelete.some(deleteDocs => deleteDocs.url == doc.url));
    }
    await user.save();
};
