const express = require("express");
const { userModel } = require("../model/user.model");
const validation = require("../shared/validation");
const messages = require('../shared/messages');
const { createOtpForMobileNo } = require("../shared/util");
const util = require("../shared/util");
const logger = require("../shared/logger");

exports.sendOtp = async (req, res)=> {
    try {
        const  mobile_number  = req.body.mobile_number
        const  user_type  = req.body.user_type
        if (!validation.phoneNumberValidation(mobile_number)) {
            const output = {
                status: messages.STATUS_CODE_FOR_INVALID_INPUT,
                message: messages.MOBILE_NUMBER_INVALID
            };
            return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
        }

        const otp = await createOtpForMobileNo();

        // Update or Create User with OTP
        const user = await userModel.findOneAndUpdate(
          { mobile_number, user_type },
        //   { otp, user_type },
          { otp },
          { new: true, upsert: true }
        );
        const output = {
            statusCode: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
            message: messages.OTP_GENERATE_SUCCESS,
            otp: otp
        };
        // Send OTP via SMS or Email
        // sendOtp(mobile_number, otp);
    
        res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND).json(output);
    } catch (error) {
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR).json({
            status: messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            message: messages.CATCH_BLOCK_ERROR,
            errorMessage: error.code == 11000 ? 'Account already exist with another role!' : error.message
        });
    }
}

exports.Login = async (req, res) => {
    const { mobile_number, otp } = req.body;
    if (!validation.otpValidation(otp)) {
        const output = {
            status: messages.STATUS_CODE_FOR_INVALID_INPUT,
            message: messages.OTP_INVALID
        };
      return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
    }
  
    try {
      // Find the user by mobile number
      const user = await userModel.findOne({ mobile_number });
  
      if (!user) { 
        const output = {
            status: messages.STATUS_CODE_FOR_DATA_NOT_FOUND,
            message: messages.USER_NOT_FOUND_ERR
        };
        return res.status(messages.STATUS_CODE_FOR_DATA_NOT_FOUND).json(output);
      }
  
      // Verify OTP
      if (user.otp !== otp) {
            const output = {
                status: messages.STATUS_CODE_FOR_INVALID_INPUT,
                message: messages.OTP_INVALID
            };
            return res.status(messages.STATUS_CODE_FOR_INVALID_INPUT).json(output);
      }
      if(user.user_type == 'admin'){
          user.profile_status = 'approved';
          user.registered = true;
        }else{
            user.profile_status = 'inprocess';
        }
      user.otp = undefined;
      await user.save();
      
      var token = await util.createJwtToken({ _id: user._id, mobile_number: user.mobile_number, user_type: user.user_type  });
      output = {
        status: messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND,
        message: messages.LOGIN_SUCCESSFULLY,
        token: token,
        user_id: user._id,
        mobile_number: user.mobile_number,
        user_type: user.user_type
    }
        res.status(messages.STATUS_CODE_FOR_DATA_SUCCESSFULLY_FOUND)
        .json(output);
    } catch (error) {
        output = {
            "status": messages.STATUS_CODE_FOR_RUN_TIME_ERROR,
            "message": messages.CATCH_BLOCK_ERROR,
            "errorMessage": error
        }
        logger.error(error)
        res.status(messages.STATUS_CODE_FOR_RUN_TIME_ERROR)
            .json(output);
    }
  };