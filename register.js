// Registration System JavaScript

// Get elements
const loginToggle = document.getElementById('loginToggle');
const createToggle = document.getElementById('createToggle');
const loginContainer = document.getElementById('loginContainer');
const createContainer = document.getElementById('createContainer');
const registrationDashboard = document.getElementById('registrationDashboard');
const registrationSection = document.getElementById('registrationSection');

// Forms
const loginForm = document.getElementById('loginForm');
const createAccountForm = document.getElementById('createAccountForm');
const studentInfoForm = document.getElementById('studentInfoForm');
const parentInfoForm = document.getElementById('parentInfoForm');
const documentsForm = document.getElementById('documentsForm');

// Progress tracking
let currentStep = 1;
const totalSteps = 4;

// API Configuration
const API_BASE = 'api/';
let sessionToken = localStorage.getItem('mcs_session_token');
let currentUser = null;

// Toggle between login and create account
loginToggle.addEventListener('click', () => {
    showLogin();
});

createToggle.addEventListener('click', () => {
    showCreate();
});

function showLogin() {
    loginContainer.classList.remove('hidden');
    createContainer.classList.add('hidden');
    loginToggle.classList.add('active');
    createToggle.classList.remove('active');
}

function showCreate() {
    createContainer.classList.remove('hidden');
    loginContainer.classList.add('hidden');
    createToggle.classList.add('active');
    loginToggle.classList.remove('active');
}

// Handle login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(API_BASE + 'auth.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            sessionToken = data.sessionToken;
            localStorage.setItem('mcs_session_token', sessionToken);
            currentUser = data.user;
            
            showDashboard(data.user);
            showNotification('Login successful! Welcome back.', 'success');
            
            // Load existing application data
            loadApplicationData();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
        console.error('Login error:', error);
    }
});

// Handle account creation
createAccountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const parentName = document.getElementById('parentName').value;
    const parentEmail = document.getElementById('parentEmail').value;
    const parentPhone = document.getElementById('parentPhone').value;
    const password = document.getElementById('accountPassword').value;
    
    try {
        const response = await fetch(API_BASE + 'auth.php?action=register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ parentName, parentEmail, parentPhone, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            sessionToken = data.sessionToken;
            localStorage.setItem('mcs_session_token', sessionToken);
            currentUser = data.user;
            
            showDashboard(data.user);
            showNotification('Account created successfully! Please complete the registration.', 'success');
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
        console.error('Registration error:', error);
    }
});

// Show registration dashboard
function showDashboard(userData) {
    document.querySelector('.account-toggle').style.display = 'none';
    loginContainer.classList.add('hidden');
    createContainer.classList.add('hidden');
    registrationDashboard.classList.remove('hidden');
    
    // Pre-fill guardian info if available
    if (userData.name) document.getElementById('guardianName').value = userData.name;
    if (userData.email) document.getElementById('guardianEmail').value = userData.email;
    if (userData.phone) document.getElementById('guardianPhone').value = userData.phone;
}

// Step navigation
async function nextStep(step) {
    if (await validateCurrentStep()) {
        // Save current step data
        await saveCurrentStepData();
        
        currentStep = step;
        showStep(step);
        updateProgress();
    }
}

function prevStep(step) {
    currentStep = step;
    showStep(step);
    updateProgress();
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.registration-step').forEach(s => s.classList.remove('active'));
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress steps
    document.querySelectorAll('.progress-step').forEach((s, index) => {
        if (index < step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = percentage + '%';
}

// Form validation
function validateCurrentStep() {
    let isValid = true;
    
    if (currentStep === 1) {
        const requiredFields = ['studentName', 'studentDOB', 'studentGender', 'nationalId', 'previousSchool', 'previousGrade', 'requestedGrade', 'preferredBranch', 'studentAddress'];
        isValid = validateFields(requiredFields);
    } else if (currentStep === 2) {
        const requiredFields = ['guardianName', 'relationship', 'guardianId', 'guardianPhone', 'guardianEmail', 'emergencyContact', 'emergencyPhone'];
        isValid = validateFields(requiredFields);
    } else if (currentStep === 3) {
        const requiredFiles = ['studentIdDoc', 'guardianIdDoc', 'transcriptDoc', 'studentPhoto', 'addressProof'];
        isValid = validateFiles(requiredFiles);
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields before proceeding.', 'error');
    }
    
    return isValid;
}

function validateFields(fieldIds) {
    let isValid = true;
    
    fieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#ff6b6b';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

function validateFiles(fileIds) {
    let isValid = true;
    
    fileIds.forEach(fileId => {
        const field = document.getElementById(fileId);
        if (!field.files.length) {
            field.style.borderColor = '#ff6b6b';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

// Age calculation
document.getElementById('studentDOB').addEventListener('change', function() {
    const dob = new Date(this.value);
    const today = new Date();
    const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
    document.getElementById('studentAge').value = age;
});

// Fee calculation based on grade
document.getElementById('requestedGrade').addEventListener('change', function() {
    updateFeeCalculation(this.value);
});

function updateFeeCalculation(grade) {
    const registrationFee = 500;
    const processingFee = 200;
    let termFee = 0;
    let gradeCategory = '';
    
    // Determine fee based on grade
    if (grade === 'kg') {
        termFee = 1000;
        gradeCategory = 'Kindergarten';
    } else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(grade)) {
        termFee = 2300;
        gradeCategory = `Elementary (Grade ${grade})`;
    } else if (['9', '10', '11', '12'].includes(grade)) {
        termFee = 3200;
        gradeCategory = `High School (Grade ${grade})`;
    }
    
    const totalAmount = registrationFee + processingFee + termFee;
    
    // Update display
    document.getElementById('selectedGradeDisplay').textContent = gradeCategory || 'Please select grade in Step 1';
    document.getElementById('termFeeAmount').textContent = `${termFee.toLocaleString()} ETB`;
    document.getElementById('totalAmount').textContent = `${totalAmount.toLocaleString()} ETB`;
    
    // Add animation to updated amounts
    animateAmountUpdate('termFeeAmount');
    animateAmountUpdate('totalAmount');
}

function animateAmountUpdate(elementId) {
    const element = document.getElementById(elementId);
    element.style.transform = 'scale(1.1)';
    element.style.color = '#00ff00';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '#ffd700';
    }, 300);
}

// File upload handling
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Check file size (5MB for documents, 2MB for photos)
            const maxSize = this.id === 'studentPhoto' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
            
            if (file.size > maxSize) {
                showNotification(`File size too large. Maximum ${maxSize / (1024 * 1024)}MB allowed.`, 'error');
                this.value = '';
                return;
            }
            
            // Show file name
            const fileName = file.name;
            const fileInfo = this.parentElement.querySelector('.file-info');
            if (fileInfo) {
                fileInfo.textContent = `Selected: ${fileName}`;
                fileInfo.style.color = '#00ff00';
            }
        }
    });
});

// Payment method selection
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const paymentForm = document.getElementById('paymentForm');
        
        if (this.value === 'manual') {
            paymentForm.style.display = 'block';
        } else {
            paymentForm.style.display = 'none';
            showNotification(`${this.nextElementSibling.textContent} selected. Payment gateway integration required.`, 'info');
        }
    });
});

// Submit registration
async function submitRegistration() {
    // Validate all required checkboxes
    const requiredCheckboxes = ['termsConditions', 'dataPrivacy', 'medicalCare'];
    let allChecked = true;
    const agreements = {};
    
    requiredCheckboxes.forEach(name => {
        const checkbox = document.querySelector(`input[name="${name}"]`);
        agreements[name] = checkbox.checked;
        if (!checkbox.checked) {
            allChecked = false;
            checkbox.parentElement.style.color = '#ff6b6b';
        } else {
            checkbox.parentElement.style.color = '';
        }
    });
    
    // Optional transport permission
    const transportCheckbox = document.querySelector('input[name="transport"]');
    agreements.transport = transportCheckbox ? transportCheckbox.checked : false;
    
    if (!allChecked) {
        showNotification('Please accept all required agreements to proceed.', 'error');
        return;
    }
    
    // Check payment method
    const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethodElement) {
        showNotification('Please select a payment method.', 'error');
        return;
    }
    
    const paymentMethod = paymentMethodElement.value;
    
    try {
        showNotification('Processing registration...', 'info');
        
        const response = await fetch(API_BASE + 'registration.php?action=submit_application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionToken
            },
            body: JSON.stringify({
                studentId: currentStudentId,
                paymentMethod,
                agreements
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('applicationId').textContent = data.applicationId;
            document.getElementById('successModal').classList.remove('hidden');
            showNotification('Registration completed successfully!', 'success');
        } else {
            showNotification(data.error || 'Submission failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
        console.error('Submission error:', error);
    }
}

// Modal functions
function closeModal() {
    document.getElementById('successModal').classList.add('hidden');
    
    // Reset form or redirect
    window.location.href = 'index.html';
}

function downloadReceipt() {
    showNotification('Receipt download started...', 'success');
    // In real implementation, generate and download PDF receipt
}

// Logout from registration
document.getElementById('regLogoutBtn').addEventListener('click', () => {
    // Reset everything
    currentStep = 1;
    showStep(1);
    updateProgress();
    
    // Show login/create forms
    registrationDashboard.classList.add('hidden');
    document.querySelector('.account-toggle').style.display = 'flex';
    showLogin();
    
    // Clear forms
    document.querySelectorAll('form').forEach(form => form.reset());
    
    showNotification('Logged out successfully.', 'success');
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    const colors = {
        success: { bg: 'rgba(0, 255, 0, 0.2)', border: '#00ff00', color: '#00ff00' },
        error: { bg: 'rgba(255, 0, 0, 0.2)', border: '#ff6b6b', color: '#ff6b6b' },
        info: { bg: 'rgba(255, 215, 0, 0.2)', border: '#ffd700', color: '#ffd700' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 20px 30px;
        background: ${color.bg};
        border: 2px solid ${color.border};
        color: ${color.color};
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        max-width: 400px;
        font-weight: bold;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showLogin();
    showStep(1);
    updateProgress();
});
// 
Additional variables for backend integration
let currentStudentId = null;

// Check for existing session on page load
window.addEventListener('load', async () => {
    if (sessionToken) {
        try {
            const response = await fetch(API_BASE + 'auth.php?action=verify', {
                headers: {
                    'Authorization': 'Bearer ' + sessionToken
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                currentUser = data.user;
                showDashboard(data.user);
                loadApplicationData();
            } else {
                localStorage.removeItem('mcs_session_token');
                sessionToken = null;
            }
        } catch (error) {
            localStorage.removeItem('mcs_session_token');
            sessionToken = null;
        }
    }
});

// Load existing application data
async function loadApplicationData() {
    try {
        const response = await fetch(API_BASE + 'registration.php?action=get_application', {
            headers: {
                'Authorization': 'Bearer ' + sessionToken
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const appData = data.data;
            currentStudentId = appData.id;
            
            // Pre-fill student information
            if (appData.full_name) document.getElementById('studentName').value = appData.full_name;
            if (appData.date_of_birth) document.getElementById('studentDOB').value = appData.date_of_birth;
            if (appData.age) document.getElementById('studentAge').value = appData.age;
            if (appData.gender) document.getElementById('studentGender').value = appData.gender;
            if (appData.national_id) document.getElementById('nationalId').value = appData.national_id;
            if (appData.previous_school) document.getElementById('previousSchool').value = appData.previous_school;
            if (appData.previous_grade) document.getElementById('previousGrade').value = appData.previous_grade;
            if (appData.requested_grade) {
                document.getElementById('requestedGrade').value = appData.requested_grade;
                updateFeeCalculation(appData.requested_grade);
            }
            if (appData.preferred_branch) document.getElementById('preferredBranch').value = appData.preferred_branch;
            if (appData.student_phone) document.getElementById('studentPhone').value = appData.student_phone;
            if (appData.address) document.getElementById('studentAddress').value = appData.address;
        }
    } catch (error) {
        console.error('Failed to load application data:', error);
    }
}

// Save current step data
async function saveCurrentStepData() {
    if (!sessionToken) return;
    
    try {
        if (currentStep === 1) {
            // Save student information
            const studentData = {
                studentName: document.getElementById('studentName').value,
                studentDOB: document.getElementById('studentDOB').value,
                studentGender: document.getElementById('studentGender').value,
                nationalId: document.getElementById('nationalId').value,
                previousSchool: document.getElementById('previousSchool').value,
                previousGrade: document.getElementById('previousGrade').value,
                requestedGrade: document.getElementById('requestedGrade').value,
                preferredBranch: document.getElementById('preferredBranch').value,
                studentPhone: document.getElementById('studentPhone').value,
                studentAddress: document.getElementById('studentAddress').value
            };
            
            const response = await fetch(API_BASE + 'registration.php?action=save_student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionToken
                },
                body: JSON.stringify(studentData)
            });
            
            const data = await response.json();
            if (data.success) {
                currentStudentId = data.studentId;
            }
            
        } else if (currentStep === 2) {
            // Save parent information
            const parentData = {
                guardianId: document.getElementById('guardianId').value,
                relationship: document.getElementById('relationship').value,
                guardianOccupation: document.getElementById('guardianOccupation').value,
                guardianAddress: document.getElementById('guardianAddress').value,
                emergencyContact: document.getElementById('emergencyContact').value,
                emergencyPhone: document.getElementById('emergencyPhone').value
            };
            
            await fetch(API_BASE + 'registration.php?action=save_parent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionToken
                },
                body: JSON.stringify(parentData)
            });
        }
    } catch (error) {
        console.error('Failed to save step data:', error);
    }
}

// Enhanced file upload handling
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', async function() {
        const file = this.files[0];
        if (!file || !currentStudentId) return;
        
        // Check file size
        const maxSize = this.id === 'studentPhoto' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        
        if (file.size > maxSize) {
            showNotification(`File size too large. Maximum ${maxSize / (1024 * 1024)}MB allowed.`, 'error');
            this.value = '';
            return;
        }
        
        // Upload file
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', this.id);
        formData.append('studentId', currentStudentId);
        
        try {
            const response = await fetch(API_BASE + 'registration.php?action=upload_document', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + sessionToken
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                const fileInfo = this.parentElement.querySelector('.file-info');
                if (fileInfo) {
                    fileInfo.textContent = `Uploaded: ${data.fileName}`;
                    fileInfo.style.color = '#00ff00';
                }
                showNotification('Document uploaded successfully!', 'success');
            } else {
                showNotification(data.error || 'Upload failed', 'error');
                this.value = '';
            }
        } catch (error) {
            showNotification('Upload failed. Please try again.', 'error');
            this.value = '';
        }
    });
});

// Enhanced logout
document.getElementById('regLogoutBtn').addEventListener('click', async () => {
    try {
        await fetch(API_BASE + 'auth.php?action=logout', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + sessionToken
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Clear local data
    localStorage.removeItem('mcs_session_token');
    sessionToken = null;
    currentUser = null;
    currentStudentId = null;
    
    // Reset UI
    currentStep = 1;
    showStep(1);
    updateProgress();
    
    registrationDashboard.classList.add('hidden');
    document.querySelector('.account-toggle').style.display = 'flex';
    showLogin();
    
    // Clear forms
    document.querySelectorAll('form').forEach(form => form.reset());
    
    showNotification('Logged out successfully.', 'success');
});

// Enhanced form validation with backend integration
async function validateCurrentStep() {
    let isValid = true;
    
    if (currentStep === 1) {
        const requiredFields = ['studentName', 'studentDOB', 'studentGender', 'nationalId', 'previousSchool', 'previousGrade', 'requestedGrade', 'preferredBranch', 'studentAddress'];
        isValid = validateFields(requiredFields);
    } else if (currentStep === 2) {
        const requiredFields = ['guardianName', 'relationship', 'guardianId', 'guardianPhone', 'guardianEmail', 'emergencyContact', 'emergencyPhone'];
        isValid = validateFields(requiredFields);
    } else if (currentStep === 3) {
        const requiredFiles = ['studentIdDoc', 'guardianIdDoc', 'transcriptDoc', 'studentPhoto', 'addressProof'];
        isValid = validateFiles(requiredFiles);
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields before proceeding.', 'error');
    }
    
    return isValid;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    showLogin();
    showStep(1);
    updateProgress();
});