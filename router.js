const express = require('express');
const router = express.Router();
const { checkAuth } = require('./middleware/userauth');
const authController = require("./controller/authController");
const servicesController = require("./controller/servicesController");
const registrationController = require("./controller/registrationController");
const { uploadImage } = require('./middleware/upload');
const appointmentController = require("./controller/appointmentController")


router.post('/auth/send-otp',authController.sendOtp );
router.post('/auth/login',authController.Login );

// services
router.post('/service/add',checkAuth, servicesController.AddService );
router.delete('/service/delete',checkAuth, servicesController.DeleteService );

// register
router.put('/register', checkAuth, uploadImage, registrationController.Register );

//appointment
router.post("/appointment/book", checkAuth, appointmentController.BookAppointment);
router.get("/appointment/get", checkAuth, appointmentController.GetAppointment);
// router.post("/get-appointment-details", checkAuth, appointmentController.BookAppointment);

module.exports = router
