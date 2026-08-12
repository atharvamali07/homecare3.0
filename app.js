// Base API URL (Update this when deploying to Render/Vercel)
const API_BASE_URL = 'http://localhost:3000/api';

let currentRole = '';
let userEmail = '';
let workerProfession = '';
let currentJob = null;

/**
 * Role Selection (Customer vs Worker)
 */
function selectRole(role) {
    currentRole = role;
    document.getElementById('roleScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('loginTitle').innerText = (role === 'customer' ? 'Customer' : 'Worker') + ' Email OTP Login';
}

/**
 * Send OTP via Backend Server
 */
async function sendOTP() {
    userEmail = document.getElementById('emailInput').value.trim();
    if (!userEmail || !userEmail.includes('@')) {
        alert('Please enter a valid email address!');
        return;
    }

    const sendBtn = document.getElementById('sendOtpBtn');
    sendBtn.innerText = 'Sending OTP...';
    sendBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail })
        });

        const data = await response.json();

        if (data.success) {
            alert('A 6-digit OTP has been sent to ' + userEmail);
            document.getElementById('otpSection').classList.remove('hidden');
            sendBtn.classList.add('hidden');
        } else {
            alert('Error: ' + data.message);
            sendBtn.innerText = 'Send OTP';
            sendBtn.disabled = false;
        }
    } catch (error) {
        console.error('API Error:', error);
        alert('Failed to connect to backend server. Make sure server.js is running.');
        sendBtn.innerText = 'Send OTP';
        sendBtn.disabled = false;
    }
}

/**
 * Verify OTP via Backend Server
 */
async function verifyOTP() {
    const otp = document.getElementById('otpInput').value.trim();
    if (otp.length !== 6) {
        alert('Please enter the full 6-digit OTP!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, otp: otp })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('userStatus').innerText = `${userEmail} (${currentRole.toUpperCase()})`;
            document.getElementById('loginScreen').classList.add('hidden');

            if (currentRole === 'worker') {
                document.getElementById('workerProfScreen').classList.remove('hidden');
            } else {
                document.getElementById('customerDashboard').classList.remove('hidden');
            }
        } else {
            alert('Invalid or expired OTP. Please try again.');
        }
    } catch (error) {
        console.error('API Error:', error);
        alert('Server verification failed.');
    }
}

/**
 * Toggle Custom Text Field for "Other" Selection
 */
function toggleCustomProfInput(val, targetGroupId) {
    const group = document.getElementById(targetGroupId);
    if (val === 'Other') {
        group.classList.remove('hidden');
    } else {
        group.classList.add('hidden');
    }
}

/**
 * Save Worker Profession Setup
 */
function saveWorkerProfession() {
    const selected = document.getElementById('workerProfSelect').value;
    if (selected === 'Other') {
        workerProfession = document.getElementById('workerProfCustom').value.trim();
    } else {
        workerProfession = selected;
    }

    if (!workerProfession) {
        alert('Please enter your profession');
        return;
    }

    document.getElementById('workerProfScreen').classList.add('hidden');
    document.getElementById('workerDashboard').classList.remove('hidden');
    document.getElementById('currentWorkerProf').innerText = workerProfession;

    renderWorkerJobs();
}

/**
 * Fetch High-Accuracy GPS Coordinates
 */
function getPreciseGPSLocation() {
    const status = document.getElementById('gpsStatusText');
    if (navigator.geolocation) {
        status.innerText = "Fetching precise GPS location...";
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                status.innerText = `Precise Location: Lat ${pos.coords.latitude.toFixed(4)}, Long ${pos.coords.longitude.toFixed(4)}`;
            },
            () => {
                status.innerText = "GPS access denied. Please enter manual location.";
            },
            { enableHighAccuracy: true }
        );
    } else {
        status.innerText = "Geolocation is not supported by this browser.";
    }
}

/**
 * Submit Customer Job Request
 */
function submitCustomerJob() {
    let service = document.getElementById('custServiceSelect').value;
    if (service === 'Other') {
        service = document.getElementById('custCustomService').value.trim();
    }
    const desc = document.getElementById('jobDesc').value.trim();

    if (!desc) {
        alert('Please describe the work!');
        return;
    }

    currentJob = { service, desc, customerEmail: userEmail };
    alert('Your job request has been posted successfully!');

    document.getElementById('customerDashboard').classList.add('hidden');
    document.getElementById('workTrackingScreen').classList.remove('hidden');
}

/**
 * Render Jobs Filtered by Worker Profession
 */
function renderWorkerJobs() {
    const container = document.getElementById('workerJobList');
    container.innerHTML = `
        <div class="job-card">
            <h4>Service: ${workerProfession}</h4>
            <p style="font-size: 14px; color: var(--text-muted); margin: 6px 0;"><strong>Description:</strong> Urgent ${workerProfession} job required.</p>
            <p style="font-size: 13px; color: var(--primary);">📍 Kothrud, Pune (1.8 km away)</p>
            <button class="btn btn-primary" onclick="acceptJob()">Accept Order</button>
        </div>
    `;
}

/**
 * Accept Job Request
 */
function acceptJob() {
    document.getElementById('workerDashboard').classList.add('hidden');
    document.getElementById('workTrackingScreen').classList.remove('hidden');
    document.getElementById('workDoneSection').classList.remove('hidden');
}

/**
 * Complete Work Order
 */
function markWorkAsCompleted() {
    alert('Work completed! Portfolio updated successfully.');
    location.reload();
}
