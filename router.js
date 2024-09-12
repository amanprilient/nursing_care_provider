const express = require('express');
const router = express.Router();
const { checkAuth } = require('./middleware/userauth');
const { uploadImage } = require('./middleware/upload');
const authController = require("./controller/authController");
const servicesController = require("./controller/servicesController");
const appointmentController = require("./controller/appointmentController");
const adminController = require("./controller/adminController");
const orderController = require("./controller/orderController");
const userController = require("./controller/userController");

// auth
router.post('/auth/send-otp',authController.SendOtp );
router.post('/auth/login',authController.Login );
router.put('/auth/save-fcm',authController.saveFCM );

// services
router.post('/service/add', checkAuth, uploadImage, servicesController.AddService );
router.delete('/service/delete', checkAuth, servicesController.DeleteService );
router.get('/service/get', checkAuth, servicesController.getAllServices );
router.get('/service/details', checkAuth, servicesController.serviceDetails );

// user
router.get('/user/get-providers', checkAuth, userController.getServiceProvider );
router.get('/user/get-profile', checkAuth, userController.getUserProfile );
router.put('/user/register', checkAuth, uploadImage, userController.Register );
router.post('/user/delete-docs', checkAuth, userController.DeleteDocuments );
router.put('/user/delete-profile', checkAuth, userController.DeleteProfile );
router.put('/user/update-profile', checkAuth, uploadImage, userController.UpdateProfile );

// admin
router.put('/admin/update-account-status', checkAuth, adminController.ChangeProfileStatus );
router.put('/admin/update-account-type', checkAuth, adminController.ChangeUserType );
router.get('/admin/get-user-list', checkAuth, adminController.getUserList );
router.put('/admin/delete-restore-user', checkAuth, adminController.deleteRestoreUser );
router.get('/admin/get-orders', checkAuth, adminController.getAllOrders );

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
