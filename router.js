const express = require('express');
const router = express.Router();
const { checkAuth } = require('./middleware/userauth');
const { uploadImage } = require('./middleware/upload');
const authController = require("./controller/authController");
const servicesController = require("./controller/servicesController");
const registrationController = require("./controller/registrationController");
const appointmentController = require("./controller/appointmentController")
const adminController = require("./controller/adminController")
const orderController = require("./controller/orderController")

// auth
router.post('/auth/send-otp',authController.SendOtp );
router.post('/auth/login',authController.Login );
router.put('/auth/save-fcm',authController.saveFCM );

// services
router.post('/service/add',checkAuth, uploadImage, servicesController.AddService );
router.delete('/service/delete',checkAuth, servicesController.DeleteService );

// register
router.put('/register', checkAuth, uploadImage, registrationController.Register );
router.post('/delete-docs', checkAuth, registrationController.DeleteDocuments );
router.put('/delete-profile', checkAuth, registrationController.DeleteProfile );
router.put('/update-profile', checkAuth, uploadImage, registrationController.UpdateProfile );

// admin
router.put('/admin/update-account-status', checkAuth, adminController.ChangeProfileStatus );
router.put('/admin/update-account-type', checkAuth, adminController.ChangeUserType );
router.get('/admin/get-user-list', checkAuth, adminController.getUserList );

// appointment
router.post("/appointment/book", checkAuth, appointmentController.BookAppointment);
router.get("/appointment/get", checkAuth, appointmentController.GetAppointment);
router.put("/appointment/update", checkAuth, appointmentController.UpdateAppointment);
router.get("/appointment/get-appointment-details", checkAuth, appointmentController.AppointmentDetails);
router.put("/appointment/feedback", checkAuth, appointmentController.AppointmentFeedback);

// order
router.post('/order/generate-order', checkAuth, orderController.generateOrder);
router.post('/order/verfiy-payment', checkAuth, orderController.verifyPayment);
module.exports = router
