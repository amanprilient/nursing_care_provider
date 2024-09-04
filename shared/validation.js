const messages = require("./messages");

exports.validateRequestBody = (req, res, next)=> {
    const { first_name, last_name, mobile_number, city, rera_number, whatsapp_number } = req.body;
    if (!first_name || !last_name || !mobile_number || !city || !rera_number || !whatsapp_number) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (typeof first_name !== 'string' || typeof last_name !== 'string' || typeof city !== 'string' || typeof rera_number !== 'string') {
        return res.status(400).json({ error: 'Invalid data type for fields' });
    }
    if (typeof mobile_number !== 'number' || isNaN(mobile_number) || mobile_number.toString().length !== 10) {
        return res.status(400).json({ error: 'Mobile number must be a 10-digit number' });
    }
    next();
}

exports.phoneNumberValidation = (phone) => {
    if (phone == undefined || phone.toString().length != 10 || typeof phone !== 'number' || isNaN(phone)) {
        return false;
    }
    return true;
}

exports.otpValidation = (otp) => {
    if (otp == undefined || otp.length != 4) {
        return false;
    }
    return true;
}
