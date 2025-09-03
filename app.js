// ==================== IMPORTS ====================
const db = require('./config/db'); // PostgreSQL pool
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const pgSession = require('connect-pg-simple')(session); // ✅ PostgreSQL session store
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();
const app = express();

// ==================== MIDDLEWARE ====================
app.use(express.static('public'));
app.use(cors({
  origin: ["http://localhost:3500"], // Adjust if frontend is different
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ configure PostgreSQL session store
app.use(session({
  store: new pgSession({
    pool: db,             // PostgreSQL pool from db.js
    tableName: 'session', // Must exist (create once with SQL script)
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Middleware to check if patient is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.patientId) {
    return next();
  }
  res.redirect('/telemedicine/api/patients/login');
};

// ==================== TABLE CREATION ROUTES ====================

// Patients
app.get('/patientsTable', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS patients(
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      date_of_birth DATE,
      gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await db.query(sql);
    res.send('✅ Patients table created successfully');
  } catch (err) {
    console.error('Error creating Patients table:', err);
    res.status(500).send('Error creating Patients table');
  }
});

// Doctors
app.get('/doctorsTable', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS doctors(
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      specialization VARCHAR(100),
      phone VARCHAR(20),
      schedule JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await db.query(sql);
    res.send('✅ Doctors table created successfully');
  } catch (err) {
    console.error('Error creating Doctors table:', err);
    res.status(500).send('Error creating Doctors table');
  }
});

// Appointments
app.get('/appointmentsTable', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS appointment(
      id SERIAL PRIMARY KEY,
      patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'canceled')) DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await db.query(sql);
    res.send('✅ Appointment table created successfully');
  } catch (err) {
    console.error('Error creating Appointment table:', err);
    res.status(500).send('Error creating Appointment table');
  }
});

// Admin
app.get('/adminTable', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS admin(
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) CHECK (role IN ('admin')) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await db.query(sql);
    res.send('✅ Admin table created successfully');
  } catch (err) {
    console.error('Error creating Admin table:', err);
    res.status(500).send('Error creating Admin table');
  }
});

// ==================== SAMPLE DATA ROUTES ====================
app.get('/patientsRecords', async (req, res) => {
  const sql = `
    INSERT INTO patients (first_name, last_name, email, password, phone, date_of_birth, gender, address)
    VALUES 
    ('John', 'Doe', 'john.doe@gmail.com', 'hashed_password', '555-1234', '1990-01-01', 'Male', '123 Main St'),
    ('Jane', 'Smith', 'jane.smith@gmail.com', 'hashed_password', '555-5678', '1985-05-20', 'Female', '456 Elm St')
    ON CONFLICT (email) DO NOTHING
  `;
  try {
    await db.query(sql);
    res.send('✅ Patients records inserted');
  } catch (err) {
    console.error('Error inserting Patients records:', err);
    res.status(500).send('Error inserting Patients records');
  }
});

app.get('/doctorsRecords', async (req, res) => {
  const sql = `
    INSERT INTO doctors (first_name, last_name, email, password, specialization, phone, schedule)
    VALUES 
    ('Alice', 'Johnson', 'alice.johnson@example.com', 'hashed_password', 'Cardiologist', '555-1111', '{"Monday": "9-5", "Wednesday": "9-5"}'),
    ('Bob', 'Williams', 'bob.williams@example.com', 'hashed_password', 'Dermatologist', '555-2222', '{"Tuesday": "10-4", "Thursday": "10-4"}')
    ON CONFLICT (email) DO NOTHING
  `;
  try {
    await db.query(sql);
    res.send('✅ Doctors records inserted');
  } catch (err) {
    console.error('Error inserting Doctors records:', err);
    res.status(500).send('Error inserting Doctors records');
  }
});

app.get('/appointmentsRecords', async (req, res) => {
  const sql = `
    INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status)
    VALUES 
    (1, 1, '2024-10-10', '10:00', 'scheduled'),
    (2, 2, '2024-10-12', '14:00', 'scheduled')
  `;
  try {
    await db.query(sql);
    res.send('✅ Appointments records inserted');
  } catch (err) {
    console.error('Error inserting Appointments records:', err);
    res.status(500).send('Error inserting Appointments records');
  }
});

app.get('/createAdmin', async (req, res) => {
  const sql = `
    INSERT INTO admin (username, password_hash, role)
    VALUES ('admin_user', 'hashed_password', 'admin')
    ON CONFLICT (username) DO NOTHING
  `;
  try {
    await db.query(sql);
    res.send('✅ Admin record inserted');
  } catch (err) {
    console.error('Error inserting Admin record:', err);
    res.status(500).send('Error inserting Admin record');
  }
});

// ==================== ROUTES ====================
app.use('/telemedicine/api/patients', require('./routes/patientRoutes'));
app.use('/telemedicine/api/doctors', require('./routes/doctorRoutes'));
app.use('/telemedicine/api/appointments', require('./routes/appointmentRoutes'));

// ==================== PAGES ====================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/telemedicine/api/patients/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/telemedicine/api/patients/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/telemedicine/api/patients/dashboard', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/telemedicine/api/patients/individual/edit', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/telemedicine/api/appointments/createAppointment', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public', 'booking.html')));
app.get('/telemedicine/api/appointments/viewAppointments', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public', 'view.html')));
app.get('/telemedicine/api/doctors/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'doctorReg.html')));
app.get('/telemedicine/api/doctors/viewProviders', (req, res) => res.sendFile(path.join(__dirname, 'public', 'provider.html')));

// ==================== SERVER ====================
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`✅ Server is running at: http://localhost:${PORT}`);
});
