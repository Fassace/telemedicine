// controllers/doctorController.js
const db = require('../config/db'); // Connect to database
const { validationResult } = require('express-validator'); // Back validation

// Function for registering a doctor
exports.registerDoctor = async (req, res) => {
    const errors = validationResult(req);
    // Check if any errors present in validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });
    }

    // Fetching input parameters from the request body
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    try {
        // Check if a doctor exists
        const [doctor] = await db.execute('SELECT email FROM doctors WHERE email = ?', [email]);
        if (doctor.length > 0) {
            return res.status(400).json({ message: 'The doctor already exists' });
        }

        // Insert the record
        await db.execute('INSERT INTO doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)', 
            [first_name, last_name, specialization, email, phone, schedule]);

        //create session
        req.session.doctorId = email; 
        req.session.doctorFirstname = first_name;  
        req.session.doctorLastname = last_name;
        req.session.doctorSpecialization = specialization;

        // Response
        return res.status(201).json({ message: 'New doctor registered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration', error: error.message });
    }
};

// Function to get doctor information (optional, if needed)


exports.getDoctor = async (req, res) => { 
    try {
        const [doctors] = await db.execute('SELECT id, first_name, last_name FROM doctors');
        res.status(200).json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
};

// all doctors details
exports.getAlldoctor = async (req, res) => {
    try {
        const [doctors] = await db.query('SELECT * FROM doctors');
        res.json(doctors);
    } catch (err) {
        console.error('Error fetching doctors:', err);
        res.status(500).send('Error fetching doctors');
    }
};


// // Function for editing doctor details
// exports.editDoctor = async (req, res) => {
//     const doctorId = req.params.id; // Example: Get doctor ID from request parameters

//     const errors = validationResult(req);
//     // Check if any errors present in validation
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });
//     }

//     // Fetching input parameters from the request body
//     const { first_name, last_name, specialization, email, phone, schedule } = req.body;

//     try {
//         // Update doctor details
//         await db.execute('UPDATE doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE id = ?', 
//             [first_name, last_name, specialization, email, phone, schedule, doctorId]);
//         return res.status(200).json({ message: 'Doctor details updated successfully.' });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "An error occurred during edit.", error: error.message });
//     }
// };
