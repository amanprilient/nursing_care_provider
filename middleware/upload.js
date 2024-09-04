const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const constant = require("../shared/constants");

const storage = multer.diskStorage({
    destination: './upload',
    filename: async (req, file, cb) => {
        if (file.fieldname == "documents") {
            return cb(null, `documents_${await uuidv4()}${path.extname(file.originalname)}`)
        }
        if (file.fieldname == "certifications") {
            return cb(null, `certifications_${await uuidv4()}${path.extname(file.originalname)}`)
        }
        if (file.fieldname == "profile_photo") {
            return cb(null, `profile_photo_${await uuidv4()}${path.extname(file.originalname)}`)
        }
    }
});

var mul = multer({ storage: storage });
exports.uploadImage = mul.fields(constant.UPLOADABLE_FILE_NAMES);