// controllers/doctorController.js
import pool from '../config/db.js';
import { validationResult } from 'express-validator';

// Register Doctor
export const registerDoctor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ message: 'Please correct input errors', errors: errors.array() });

    const { first_name, last_name, email, specialization, phone, schedule } = req.body;

    try {
        // Check if doctor already exists
        const { rows: existing } = await pool.query(
            'SELECT email FROM doctors WHERE email = $1',
            [email]
        );
        if (existing.length > 0)
            return res.status(400).json({ message: 'Doctor already exists' });

        // Insert doctor
        await pool.query(
            `INSERT INTO doctors (first_name, last_name, email, specialization, phone, schedule) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [first_name, last_name, email, specialization, phone, schedule]
        );

        // Save session
        req.session.doctorId = email;
        req.session.doctorFirstname = first_name;
        req.session.doctorLastname = last_name;
        req.session.doctorSpecialization = specialization;

        return res.status(201).json({ message: 'New doctor registered successfully.' });
    } catch (error) {
        console.error('Error registering doctor:', error);
        return res.status(500).json({ message: 'An error occurred during registration', error: error.message });
    }
};

// Get basic doctor info
export const getDoctor = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, first_name, last_name FROM doctors'
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
};

// Get all doctor details
export const getAllDoctor = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM doctors');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
};
