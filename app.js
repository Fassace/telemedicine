//import necessary packages
const db = require('./config/db'); // for database connection
const express = require('express'); // for the web server
const bodyParser = require('body-parser'); // for capturing form data
const session = require('express-session'); // session management
const dotenv = require('dotenv'); //managing environment 
const MySQLStore = require('express-mysql-session')(session); //storage for session management
const path = require('path')
const cors = require('cors');  // Import the CORS module, 


//initialize env management
dotenv.config();

//initialize app
const app = express();

//configure middleware

app.use(express.static('public'));
app.use(cors({
  origin: [
    "http://localhost:3500", // Local frontend
    "https://telemedicine-website.onrender.com", // Live frontend
  ],
  credentials: true, // Allow cookies or sessions
}));
// app.use(cors());  // Enable CORS for all routes
// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); //use json
app.use(bodyParser.urlencoded({ extended: true })); //capture form data



const sessionStore = new MySQLStore({}, db);


//configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 hour => 3600s
    }
}));



// // Middleware to check if patient is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.patientId) {
      return next();
  }
  res.redirect('/telemedicine/api/patients/login'); // Redirect to login if not authenticated
};



// Create table for Patients
app.get('/patientsTable', async (req, res) => {
    const sql = `
    CREATE TABLE IF NOT EXISTS patients(
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      date_of_birth DATE,
      gender ENUM('Male', 'Female', 'Other'),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `
  
    try {
      await db.query(sql);
      res.send('Patients table created successfully');
    } catch (err) {
      console.log('Error creating Patients table:', err);
      res.status(500).send('Error creating Patients table');
    }
  });
  

//Populating Patients Table
// Create patients records
app.get('/patientsRecords', async (req, res) => {
    const sql = `
    INSERT INTO patients (first_name, last_name, email, password, phone, date_of_birth, gender, address)
    VALUES 
    ('John', 'Doe', 'john.doe@gmail.com', 'hashed_password', '555-1234', '1990-01-01', 'Male', '123 Main St'),
    ('Jane', 'Smith', 'jane.smith@gmail.com', 'hashed_password', '555-5678', '1985-05-20', 'Female', '456 Elm St')
    `
  
    try {
      await db.query(sql);
      res.send('Patients records created successfully');
    } catch (err) {
      console.log('Error creating Patients records:', err);
      res.status(500).send('Error creating Patients records');
    }
  });



// Create doctors table
app.get('/doctorsTable', async (req, res) => {
  const sql = `
  CREATE TABLE IF NOT EXISTS doctors(
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    schedule TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `

  try {
    await db.query(sql);
    res.send('Doctors table created successfully');
  } catch (err) {
    console.log('Error creating Doctors table:', err);
    res.status(500).send('Error creating Doctors table');
  }
});

// Create doctors records
app.get('/doctorsRecords', async (req, res) => {
  const sql = `
  INSERT INTO doctors (first_name, last_name, specialization, email, phone, schedule)
  VALUES 
  ('Dr. Alice', 'Johnson', 'Cardiologist', 'alice.johnson@example.com', '555-1111', '{"Monday": "9-5", "Wednesday": "9-5"}'),
  ('Dr. Bob', 'Williams', 'Dermatologist', 'bob.williams@example.com', '555-2222', '{"Tuesday": "10-4", "Thursday": "10-4"}')
  `

  try {
    await db.query(sql);
    res.send('Doctors records created successfully');
  } catch (err) {
    console.log('Error creating Doctors records:', err);
    res.status(500).send('Error creating Doctors records');
  }
});



// Create appointment table
app.get('/appointmentsTable', async (req, res) => {
  const sql = `
  CREATE TABLE IF NOT EXISTS appointment(
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('scheduled', 'completed', 'canceled') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
  )
  `

  try {
    await db.query(sql);
    // Add indexes on patient_id and doctor_id columns
    await db.query("ALTER TABLE appointment ADD INDEX idx_patient_id (patient_id)");
    await db.query("ALTER TABLE appointment ADD INDEX idx_doctor_id (doctor_id)");
    res.send('Appointment table created successfully');
  } catch (err) {
    console.log('Error creating Appointment table:', err);
    res.status(500).send('Error creating Appointment table');
  }
});


// Create appointments records
app.get('/appointmentsRecords', async (req, res) => {
  const sql = `
  INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status)
  VALUES 
  (1, 1, '2024-10-10', '10:00', 'scheduled'),
  (2, 2, '2024-10-12', '14:00', 'scheduled')
  `

  try {
    await db.query(sql);
    res.send('Appointments records created successfully');
  } catch (err) {
    console.log('Error creating Appointments records:', err);
    res.status(500).send('Error creating Appointments records');
  }
});


// admin table
// Create table for admin
app.get('/admin', (req, res) => {
  const sql = `
  CREATE TABLE IF NOT EXISTS admin(
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',  -- Define roles for different levels of access
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
  `

  db.query(sql, (err) => {

      if(err){
          console.log('Error creating Admin table:', err)
          return response.status(500).send('Error creating Admin table')
      }
    
    res.send('Admin table created successfully')
  })
  
  
})


//Populating Admin Table
app.get('/createAdmin', (req, res) => {
  const sql = `
  INSERT INTO admin (username, password_hash, role)
  VALUES 
  ('admin_user', 'hashed_password', 'admin');
 `
  db.query(sql, (err) => {
      if(err){
          console.log('Error creating Admin record:', err)
          return response.status(500).send('Error creating Admin record')
      }

      res.send('Admin record created successfully')
  })
})


//routes

app.use('/telemedicine/api/patients', require('./routes/patientRoutes'));
app.use('/telemedicine/api/doctors', require('./routes/doctorRoutes'));
app.use('/telemedicine/api/appointments', require('./routes/appointmentRoutes'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/telemedicine/api/patients/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/telemedicine/api/patients/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protected routes for patients
app.get('/telemedicine/api/patients/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// app.get('/telemedicine/api/patients/dashboard', (req, res) => {
//   if (req.session && req.session.patientId) {
//       res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
//   } else {
//       res.redirect('/telemedicine/api/patients/login'); // Redirect if not logged in
//   }
// });


app.get('/telemedicine/api/patients/individual/edit', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// app.get('/telemedicine/api/patients/individual/edit', (req, res) => {
//   if (req.session && req.session.patientId){
//     res.sendFile(path.join(__dirname, 'public', 'profile.html'));
//   }
// });


app.get('/telemedicine/api/appointments/createAppointment', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});


// app.get('/telemedicine/api/appointments/createAppointment', (req, res) => {
//   if (req.session && req.session.patientId) {
//       // Serve the booking.html file if patientId exists in the session
//       res.sendFile(path.join(__dirname, 'public', 'booking.html'));
//   } else {
//       // Redirect or respond with a message if patientId is not in the session
//       res.redirect('/telemedicine/api/patients/login'); // Change this path to your login or appropriate page
//   }
// });


app.get('/telemedicine/api/appointments/viewAppointments', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

// app.get('/telemedicine/api/appointments/viewAppointments', (req, res) => {
//   if (req.session && req.session.patientId) {
//       // Serve the viewAppointments.html file if patientId exists in the session
//       res.sendFile(path.join(__dirname, 'public', 'view.html'));
//   } else {
//       // Redirect or respond with a message if patientId is not in the session
//       res.redirect('/telemedicine/api/patients/login'); // Change this path to your login or appropriate page
//   }
// });

app.get('/telemedicine/api/doctors/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'doctorReg.html'));
});

app.get('/telemedicine/api/doctors/viewProviders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'provider.html'));
});



const PORT = process.env.PORT || 3500;

//start server
app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
