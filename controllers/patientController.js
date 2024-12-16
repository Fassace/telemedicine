const db = require('../config/db'); //connect to database 
const bcrypt = require('bcryptjs'); //hashing
const { validationResult } = require('express-validator'); // back validation 

// Function for registering patient
exports.registerPatient = async (req, res) => {
    const errors = validationResult(req);
    // Check if any errors present in validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });
    }

    // Fetching input parameters from the request body
    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    try {
        // Check if a patient exists
        const [patient] = await db.execute('SELECT email FROM patients WHERE email = ?', [email]);
        if (patient.length > 0) {
            return res.status(400).json({ message: 'The patient already exists' });
        }

        // Prepare our data - hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert the record
        await db.execute('INSERT INTO patients (first_name, last_name, email, password, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [first_name, last_name, email, hashedPassword, phone, date_of_birth, gender, address]);
        // Response
        return res.status(201).json({ message: 'New patient registered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration', error: error.message });
    }
}

// Function for login
exports.loginPatient = async (req, res) => {

    const errors = validationResult(req);
    // Check if any errors present in validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Please fill input', errors: errors.array() });
    }

    // Fetch email & password from request body
    const { email, password } = req.body;

    try {
        // Check if patient exists
        const [patient] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
        if (patient.length === 0) {
            return res.status(400).json({ message: 'The patient does not exist' });
        }
        
        // Check the passwords
        const isMatch = await bcrypt.compare(password, patient[0].password); 

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email/password combination.' });
        }
        // Create a session data
        req.session.patientId = patient[0].id;
        req.session.patientFirstname = patient[0].first_name;  
        req.session.patientLastname = patient[0].last_name;
        req.session.patientEmail = patient[0].email;


        return res.status(200).json({ message: 'Successful login!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during login', error: error.message });
    }
}

// Function for logout 
exports.logoutPatient = (req, res) => { 
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred.', error: err.message });
        }
        // Optionally send the home URL to redirect to
        return res.status(200).json({ message: 'Successfully logged out.', /*redirect: '/telemedicine/api/patients/login'*/ });
    });
};



// Function to get patient information for editing
exports.getPatient = async (req, res) => {

    if (!req.session.patientId) {
        return res.status(400).json({ message: "Unauthorized! login" });
    }

    try {

        // Retrieve patient details from the database
        const [patient] = await db.query('SELECT first_name, last_name, email, address FROM patients WHERE id = ?', [req.session.patientId]);
        
        if (patient.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        return res.status(200).json({ message: "Patient details fetched for editing.", patient: patient[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching patient details.', error: error.message });
    }
}

// Function for editing patient
exports.editPatient = async (req, res) => {
    
    if (!req.session.patientId) {
        return res.status(401).json({ message: 'Unauthorized. Please login to continue.' });
    }

    const errors = validationResult(req);
    // Check if any errors present in validation
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });
    }

    // Fetch patient details from request body
    const { first_name, last_name, email, address } = req.body;

    // // Prepare data - hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Update patient details
        await db.execute('UPDATE patients SET first_name = ?, last_name = ?, email = ?, address = ? WHERE id = ?', 
            [first_name, last_name, email, address, req.session.patientId]);
        return res.status(200).json({ message: 'Patient details updated successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred during edit.", error: error.message });
    }
}
