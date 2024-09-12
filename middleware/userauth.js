
const { userModel } = require("../model/user.model.js");
const messages = require("../shared/messages.js")
const { verifyJwtToken } = require("../shared/util.js");

var checkAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST)
                .json({
                    status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                    message: messages.AUTH_HEADER_MISSING_ERR
                });
        }

        const token = header.split("Bearer ")[1];
        if (!token) {
            return res.status(messages.STATUS_CODE_FOR_BAD_REQUEST)
                .json({
                    status: messages.STATUS_CODE_FOR_BAD_REQUEST,
                    message: messages.AUTH_TOKEN_MISSING_ERR
                });
        }

        const userAuth = await verifyJwtToken(token);
        if (!userAuth) {
            return res.status(messages.STATUS_CODE_FOR_UNAUTHORIZED)
                .json({
                    status: messages.STATUS_CODE_FOR_UNAUTHORIZED,
                    message: messages.JWT_DECODE_ERR
                });
        }

        // Find the user by mobile number
        // const user = await userModel.findOne({ "mobile_number": userAuth.mobile_number });
        const user = await userModel.findById(userAuth._id);
        res.locals.user = user;
        next();

    } catch (error) {
        return res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR)
            .json({
                "status": messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
                "message": messages.CATCH_BLOCK_ERROR,
                "errorMessage": error.message
            });
    }
};


module.exports = {
    checkAuth,
}