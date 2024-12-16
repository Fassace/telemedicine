// controllers/appointmentController.js
const db = require('../config/db'); // Ensure db is configured properly

// Controller to book an appointment
exports.createAppointment = async (req, res) => {
    const patient_id = req.session.patientId; // Use session data for patient ID
    const { doctor_id, appointment_date, appointment_time } = req.body;

    // Check for missing fields
    if (!doctor_id || !appointment_date || !appointment_time) {
        console.log("Missing fields:", { doctor_id, appointment_date, appointment_time });
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the patient exists
        const patientQuery = 'SELECT * FROM patients WHERE id = ?';
        const [patientResult] = await db.query(patientQuery, [patient_id]);
        if (!patientResult.length) {
            console.log("Patient not found:", patient_id);
            return res.status(404).json({ message: 'Patient not found' });
        }
        console.log("Patient found:", patientResult[0]);

        // Check if the doctor exists
        const doctorQuery = 'SELECT * FROM doctors WHERE id = ?';
        const [doctorResult] = await db.query(doctorQuery, [doctor_id]);
        if (!doctorResult.length) {
            console.log("Doctor not found:", doctor_id);
            return res.status(404).json({ message: 'Doctor not found' });
        }
        console.log("Doctor found:", doctorResult[0]);

        // Insert appointment into the `appointment` table
        const appointmentQuery = `
            INSERT INTO appointment 
            (patient_id, doctor_id, appointment_date, appointment_time, status)
            VALUES (?, ?, ?, ?, 'scheduled')`;
        
        const [insertResult] = await db.query(appointmentQuery, [
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time
        ]);

        console.log("Appointment booked successfully:", insertResult);
        res.status(201).json({ message: 'Appointment booked successfully!' });

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: 'Error booking appointment' });
    }
};


// Get all scheduled appointments for a specific patient
exports.getAppointment = async (req, res) => {
    const patient_id = req.session.patientId;

    try {
        const query = `
            SELECT a.id, d.first_name AS doctor_name, a.appointment_date, a.appointment_time, a.status
            FROM appointment AS a
            JOIN doctors AS d ON a.doctor_id = d.id
            WHERE a.patient_id = ?
        `;
        const [appointments] = await db.query(query, [patient_id]);
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};



// Cancel a specific appointment
exports.cancelAppointment = async (req, res) => {
    const appointmentId = req.params.id;
    const patient_id = req.session.patientId; // For security, ensure this belongs to the patient

    try {
        const query = 'UPDATE appointment SET status = "canceled" WHERE id = ? AND patient_id = ?';
        const [result] = await db.query(query, [appointmentId, patient_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found or already canceled' });
        }
        res.status(200).json({ message: 'Appointment canceled successfully' });
    } catch (error) {
        console.error("Error canceling appointment:", error);
        res.status(500).json({ message: 'Error canceling appointment' });
    }
};
