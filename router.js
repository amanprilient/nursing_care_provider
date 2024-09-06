const express = require('express');
const router = express.Router();
const { checkAuth } = require('./middleware/userauth');
const authController = require("./controller/authController");
const servicesController = require("./controller/servicesController");
const registrationController = require("./controller/registrationController");
const { uploadImage } = require('./middleware/upload');
const appointmentController = require("./controller/appointmentController")


router.post('/auth/send-otp',authController.SendOtp );
router.post('/auth/login',authController.Login );

// services
router.post('/service/add',checkAuth, servicesController.AddService );
router.delete('/service/delete',checkAuth, servicesController.DeleteService );

// register
router.put('/register', checkAuth, uploadImage, registrationController.Register );
router.post('/delete-docs', checkAuth, registrationController.DeleteDocuments );
router.put('/delete-profile', checkAuth, registrationController.DeleteProfile );
router.put('/update-profile', checkAuth, uploadImage, registrationController.updateProfile );

//appointment
router.post("/appointment/book", checkAuth, appointmentController.BookAppointment);
router.get("/appointment/get", checkAuth, appointmentController.GetAppointment);
router.put("/appointment/update", checkAuth, appointmentController.UpdateAppointment);
router.get("/appointment/get-appointment-details", checkAuth, appointmentController.AppointmentDetails);

module.exports = router
