// routes/doctorRoutes.js
const express = require('express');
const { registerDoctor, getDoctor, getAllDoctor } = require('../controllers/doctorController.js');
const { check } = require('express-validator');

const router = express.Router();

// Registration route
router.post(
    '/register',
    [
        check('first_name', 'First name is required').not().isEmpty(),
        check('last_name', 'Last name is required').not().isEmpty(),
        check('email', 'Please provide a valid email').isEmail(),
        check('specialization', 'Specialization is required').not().isEmpty(),
        check('phone', 'Phone number is required').not().isEmpty(),
        check('schedule', 'Schedule is required').not().isEmpty()
    ],
    registerDoctor
);

// Route to get all doctors
router.get('/list', getAllDoctor);

// Get basic doctor info
router.get('/individual', getDoctor);

module.exports = router;
