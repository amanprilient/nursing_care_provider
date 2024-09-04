const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
var axios = require('axios');
require("dotenv").config();
const admin = require('firebase-admin');
const notificationService = require('../service/notification.js');
const logger = require("./logger.js");


exports.createJwtToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.JWT_SECRET, { "algorithm": "HS256" }, { expiresIn: "365d" });
  return token;
};
exports.verifyJwtToken = async (token) => {
  try {
    const user_id = await jwt.verify(token, process.env.JWT_SECRET);
    return user_id;
  } catch (err) {
    return false;
  }
};
exports.createOtpForMobileNo = () => {
  var otp = Math.floor(1000 + Math.random() * 9000);
  return otp;
};
exports.sendNotification = async (token, title, body, screenName, user_id) => {
  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: {
      screenName
    },
  };

  try {
    const response = await admin.messaging().send(message);
    logger.info('Notification sent successfully:', response);
    notificationService.save_notification({ user_id, title, body, screenName })
    return true;

  } catch (error) {
    logger.error('Error sending notification:', error);
    return false;

  }
}
exports.sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: email,
    subject: subject,
    text: text
  };

  try {
    await transporter.sendMail(mailOptions);

    logger.info('Email sent successfully')
    return true;
  } catch (error) {
    logger.error(error)
    return false;
  }
}
exports.send_whatsapp_message = async () => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        body: "Hi [Recipient's Name],\nGreat news! Your registration with Brokers together has been approved. 🎉 You're all set to listing property, view etc.\n\n!If you have any further questions feel free to reach out.\nThank you!",
        from: 'whatsapp:+12099008073',
        to: 'whatsapp:+916378598181'
      })
      .then(message => logger.info(message))

  }
  catch (e) {
    logger.error
  }
}
exports.handleDocuments = (files) => {
  let documents = [];

  if (files && files.documents) {
    files.documents.forEach(file => {
      const fileType = file.mimetype.split('/')[0];
      if (['image','application'].includes(fileType)) {
        const fileExtension = file.mimetype.split('/')[1];
        if (['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension)) {
          documents.push({
            url: file.path,
            type: fileType
          });
        } else {
          throw new Error('Invalid file type');
        }
      } else {
        throw new Error('Invalid file type');
      }
    });

    if (documents.length === 0) {
      throw new Error('No valid documents provided');
    }
  } else {
    throw new Error('No documents provided');
  }

  return documents;
};
exports.handleCertificates = (files) => {
  let certifications = [];

  if (files && files.certifications) {
    files.certifications.forEach(file => {
      const fileType = file.mimetype.split('/')[0];
      if (['image', 'application'].includes(fileType)) {
        const fileExtension = file.mimetype.split('/')[1];
        if (['jpeg', 'png', 'pdf'].includes(fileExtension)) {
          certifications.push({
            url: file.path,
            type: fileType
          });
        } else {
          throw new Error('Invalid file type');
        }
      } else {
        throw new Error('Invalid file type');
      }
    });

    if (certifications.length === 0) {
      throw new Error('No valid certificates provided');
    }
  } else {
    throw new Error('No certificates provided');
  }

  return certifications;
};
