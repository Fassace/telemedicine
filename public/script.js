const messageDiv = document.getElementById('message');
const patientSection = document.getElementById('patientSection');
const patientfirstnameSpan = document.getElementById('patientFirstname');
const patientlastnameSpan = document.getElementById('patientLastname');
const patientemailSpan = document.getElementById('patientEmail');
const patientaddressSpan = document.getElementById('patientAddress');
const logoutButton = document.getElementById('logoutButton');

function showMessage(type, text){
    messageDiv.style.display = 'block';
    if(type == 'success'){
        messageDiv.style.color = 'green'
    } else  {
    messageDiv.style.color = 'red';
    }
    messageDiv.textContent = text;


    setTimeout(() => {
        messageDiv.style.display = 'none';

    }, 3000);

}

//Registration form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const first_name = document.getElementById('regFirstname').value;
    const last_name = document.getElementById('regLastname').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    const date_of_birth = document.getElementById('regDob').value;
    const gender = document.getElementById('regGender').value;
    const address = document.getElementById('regAddress').value;


    // Transmit the data
    const response = await fetch('/telemedicine/api/patients/register', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ first_name, last_name, email, password, phone, date_of_birth, gender, address })
    });

    const result = await response.json();

    if (response.status === 201) {
        showMessage('success', result.message);
    } else {
        showMessage('failed', result.message);
    }
});


// Login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Transmit the data
    const response = await fetch('/telemedicine/api/patients/login', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.status === 200) {  // Updated to 200
        showMessage('success', result.message);
        getPatient();
    } else {
        showMessage('failed', result.message || 'Login failed. Please try again.');
    }
});


// fetch Patient details
// async function getPatient() {
//     try {
//         const response = await fetch('/telemedicine/api/patients/individual', {
//             method: 'GET'
//         });
        
//         if (response.status === 200) {
//             const result = await response.json();
//             patientfirstnameSpan.textContent = result.patient.first_name;
//             patientlastnameSpan.textContent = result.patient.last_name;
//             patientemailSpan.textContent = result.patient.email;
//             patientaddressSpan.textContent = result.patient.address;
//         } else {
//             const result = await response.json();
//             showMessage('failed', result.message);
//         }
//     } catch (error) {
//         showMessage('failed', 'An error occurred while fetching patient details.');
//         console.error(error);
//     }
// }

async function getPatient(){
    const response = await fetch('/telemedicine/api/patients/individual' , {
     method: 'GET'   
    });

    if(response.status === 200){
        const result = await response.json();
        patientfirstnameSpan.textContent = result.patient.first_name;
        patientlastnameSpan.textContent = result.patient.last_name;
        patientemailSpan.textContent = result.patient.email;  
        patientaddressSpan.textContent = result.patient.address;
        patientSection.style.display = 'block';
    } else{
        showMessage('failed', result.message);
    }
    const result = await response.json();
    showMessage('failed', result.message);
}

// edit Patient details
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const first_name = document.getElementById('editFirstname').value;
    const last_name = document.getElementById('editLastname').value;
    const email = document.getElementById('editEmail').value;
    const address = document.getElementById('editAddress').value;


    // Transmit the data
    const response = await fetch('/telemedicine/api/patients/individual/edit', { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ first_name, last_name, email, address })
    });

    const result = await response.json();

    if (response.status === 200) {
        showMessage('success', result.message);
        getPatient();
    } else {
        showMessage('failed', result.message);
    }
});

//logout
logoutButton.addEventListener('click', async () => {
    const response = await fetch('/telemedicine/api/patients/logout', {
        method: 'GET'
    });
    if(response.status === 200){
        const result = response.json();
        showMessage('success', result.message);
        patientSection.style.display = 'none';
    } else {
        showMessage('failed', result.message);
    }
});