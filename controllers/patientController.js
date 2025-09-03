// controllers/patientController.js
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

// Register patient
export const registerPatient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });

    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    try {
        // Check if patient already exists
        const { rows: existing } = await pool.query(
            'SELECT email FROM patients WHERE email = $1',
            [email]
        );
        if (existing.length > 0)
            return res.status(400).json({ message: 'The patient already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert patient
        await pool.query(
            `INSERT INTO patients 
             (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) 
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [first_name, last_name, email, hashedPassword, phone, date_of_birth, gender, address]
        );

        return res.status(201).json({ message: 'New patient registered successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during registration', error: error.message });
    }
};

// Login patient
export const loginPatient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ message: 'Please fill input', errors: errors.array() });

    const { email, password } = req.body;

    try {
        // Find patient
        const { rows } = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
        if (rows.length === 0)
            return res.status(400).json({ message: 'The patient does not exist' });

        const patient = rows[0];

        // Compare password with hash
        const isMatch = await bcrypt.compare(password, patient.password_hash);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid email/password combination.' });

        // Create session
        req.session.patientId = patient.id;
        req.session.patientFirstname = patient.first_name;
        req.session.patientLastname = patient.last_name;
        req.session.patientEmail = patient.email;

        return res.status(200).json({ message: 'Successful login!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during login', error: error.message });
    }
};

// Logout patient
export const logoutPatient = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'An error occurred.', error: err.message });
        return res.status(200).json({ message: 'Successfully logged out.' });
    });
};

// Get patient for edit
export const getPatient = async (req, res) => {
    if (!req.session.patientId)
        return res.status(401).json({ message: "Unauthorized! login" });

    try {
        const { rows } = await pool.query(
            'SELECT first_name, last_name, email, address FROM patients WHERE id = $1',
            [req.session.patientId]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: 'Patient not found' });

        return res.status(200).json({ message: "Patient details fetched for editing.", patient: rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching patient details.', error: error.message });
    }
};

// Edit patient
export const editPatient = async (req, res) => {
    if (!req.session.patientId)
        return res.status(401).json({ message: 'Unauthorized. Please login to continue.' });

    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });

    const { first_name, last_name, email, address } = req.body;

    try {
        await pool.query(
            'UPDATE patients SET first_name=$1, last_name=$2, email=$3, address=$4 WHERE id=$5',
            [first_name, last_name, email, address, req.session.patientId]
        );

        return res.status(200).json({ message: 'Patient details updated successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred during edit.", error: error.message });
    }
};
