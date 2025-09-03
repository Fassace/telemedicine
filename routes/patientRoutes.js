// Patient routes - Importing packages and modules
const express = require('express');
const { registerPatient, loginPatient, logoutPatient, getPatient, editPatient } = require('../controllers/patientController');
const { check } = require('express-validator'); //validation
const router = express.Router();

// Registration route
router.post(
    '/register',
    [
        check('first_name', 'First name is required').not().isEmpty(),
        check('last_name', 'Last name is required').not().isEmpty(),
        check('email', 'Please provide a valid email').isEmail(),
        check('password', 'Password must be 6 characters or more.').isLength({ min: 6 })
    ],
    registerPatient
);

// Login route
router.post('/login',
    [
        check('email', 'Please provide a valid email').isEmail(),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    loginPatient);

// Get patient
router.get('/individual', getPatient);

// Edit patient
router.put(
    '/individual/edit', 
    [
        check('first_name', 'First name is required').not().isEmpty(),
        check('last_name', 'Last name is required').not().isEmpty(),
        check('email', 'Please provide a valid email').isEmail(),
        // check('password', 'Password must be 6 characters or more.').isLength({ min: 6 })
    ],
    editPatient
);

// Logout
router.get('/logout', logoutPatient);

module.exports = router;
