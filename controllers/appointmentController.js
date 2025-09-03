// controllers/appointmentController.js
import pool from '../config/db.js';

// Book an appointment
export const createAppointment = async (req, res) => {
    const patient_id = req.session.patientId; // session patient id
    const { doctor_id, appointment_date, appointment_time } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if patient exists
        const patientResult = await pool.query(
            'SELECT id FROM patients WHERE id = $1',
            [patient_id]
        );
        if (patientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Check if doctor exists
        const doctorResult = await pool.query(
            'SELECT id FROM doctors WHERE id = $1',
            [doctor_id]
        );
        if (doctorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Insert appointment
        await pool.query(
            `INSERT INTO appointment 
             (patient_id, doctor_id, appointment_date, appointment_time, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'scheduled', NOW(), NOW())`,
            [patient_id, doctor_id, appointment_date, appointment_time]
        );

        res.status(201).json({ message: 'Appointment booked successfully!' });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
};

// View all appointments of a patient
export const getAppointment = async (req, res) => {
    const patient_id = req.session.patientId;

    try {
        const result = await pool.query(
            `SELECT a.id, 
                    d.first_name AS doctor_firstname, 
                    d.last_name AS doctor_lastname, 
                    a.appointment_date, 
                    a.appointment_time, 
                    a.status
             FROM appointment a
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.patient_id = $1
             ORDER BY a.appointment_date DESC`,
            [patient_id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
    const appointmentId = req.params.id;
    const patient_id = req.session.patientId;

    try {
        const result = await pool.query(
            `UPDATE appointment 
             SET status = 'canceled', updated_at = NOW() 
             WHERE id = $1 AND patient_id = $2`,
            [appointmentId, patient_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Appointment not found or already canceled' });
        }

        res.status(200).json({ message: 'Appointment canceled successfully' });
    } catch (error) {
        console.error('Error canceling appointment:', error);
        res.status(500).json({ message: 'Error canceling appointment', error: error.message });
    }
};
