// routes/doctorRoutes.js
const express = require('express');
const { registerDoctor, getDoctor, getAlldoctor } = require('../controllers/doctorController');
const { check } = require('express-validator'); // Validation
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


// Route to get all doctors details 
router.get('/list', getAlldoctor);



// Get doctor information
router.get('/individual', getDoctor); // Assumes doctor ID is passed in the URL

// Edit doctor details
// router.put('/individual/edit', 
//     [
//         check('first_name', 'First name is required').not().isEmpty(),
//         check('last_name', 'Last name is required').not().isEmpty(),
//         check('email', 'Please provide a valid email').isEmail(),
//         check('specialization', 'Specialization is required').not().isEmpty(),
//         check('phone', 'Phone number is required').not().isEmpty(),
//         check('schedule', 'Schedule is required').not().isEmpty()
//     ],
//     editDoctor
// );

module.exports = router;
