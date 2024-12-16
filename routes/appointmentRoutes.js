// routes/appointmentRoutes.js
const express = require('express');
const { createAppointment, getAppointment, cancelAppointment } = require('../controllers/appointmentController');

const router = express.Router();

// Route to create an appointment
router.post(
    '/book',    createAppointment
);

router.get('/view', getAppointment);
router.delete('/cancel/:id', cancelAppointment);



module.exports = router;