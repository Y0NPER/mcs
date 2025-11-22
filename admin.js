// Magic Carpet School - Admin Dashboard JavaScript

const API_BASE = 'api/';
let currentPage = 'dashboard';
let applicationsData = [];
let filteredData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
    setupEventListeners();
});

// Check if admin is logged in
function checkAdminSession() {
    fetch(API_BASE + 'auth.php?action=check_session')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.type === 'admin') {
                document.getElementById('adminName').textContent = data.data.name;
                document.getElementById('adminEmail').textContent = data.data.email;
                loadDashboard();
            } else {
                showLoginForm();
            }
        })
        .catch(error => {
            console.error('Session check error:', error);
            showLoginForm();
        });
}

// Show login form
function showLoginForm() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('adminLoginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
    
    // Search and filters
    document.getElementById('searchInput').addEventListener('input', filterApplications);
    document.getElementById('statusFilter').addEventListener('change', filterApplications);
    document.getElementById('branchFilter').addEventListener('change', filterApplications);
    document.getElementById('gradeFilter').addEventListener('change', filterApplications);
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadApplications();
        showNotification('Data refreshed', 'success');
    });
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
}

// Handle admin login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    fetch(API_BASE + 'auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }) // Send as 'email' field but can be username
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.type === 'admin') {
            document.getElementById('adminLogin').classList.add('hidden');
            document.getElementById('adminDashboard').classList.remove('hidden');
            loadDashboard();
            showNotification('Login successful! Welcome ' + data.data.name, 'success');
        } else {
            showNotification(data.message || 'Invalid credentials', 'error');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    });
}

// Handle logout
function handleLogout() {
    fetch(API_BASE + 'auth.php?action=logout')
        .then(response => response.json())
        .then(data => {
            document.getElementById('adminDashboard').classList.add('hidden');
            document.getElementById('adminLogin').classList.remove('hidden');
            showNotification('Logged out successfully', 'success');
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
}

// Navigate to different pages
function navigateTo(page) {
    currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected page
    const pageElement = document.getElementById(page + 'Page');
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    // Load page data
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'applications':
            loadApplications();
            break;
        case 'students':
            loadStudents();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Load dashboard statistics
function loadDashboard() {
    fetch(API_BASE + 'admin.php?action=get_statistics')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStatistics(data.data);
                loadRecentApplications();
            }
        })
        .catch(error => {
            console.error('Dashboard load error:', error);
        });
}

// Update statistics cards
function updateStatistics(stats) {
    document.getElementById('totalApplications').textContent = stats.total_applications || 0;
    document.getElementById('pendingApplications').textContent = stats.pending || 0;
    document.getElementById('approvedApplications').textContent = stats.approved || 0;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.total_revenue || 0);
}

// Load recent applications
function loadRecentApplications() {
    fetch(API_BASE + 'admin.php?action=get_recent_applications')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRecentApplications(data.data);
            }
        })
        .catch(error => {
            console.error('Recent applications error:', error);
        });
}

// Display recent applications
function displayRecentApplications(applications) {
    const container = document.getElementById('recentApplicationsList');
    
    if (!applications || applications.length === 0) {
        container.innerHTML = '<p class="no-data">No recent applications</p>';
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="application-item">
            <div class="app-info">
                <h4>${app.student_name}</h4>
                <p>Application ID: ${app.application_id}</p>
                <p>Grade: ${app.requested_grade} | Branch: ${app.preferred_branch}</p>
            </div>
            <div class="app-status">
                <span class="status-badge status-${app.status}">${app.status}</span>
                <button class="btn-view" onclick="viewApplication(${app.id})">View</button>
            </div>
        </div>
    `).join('');
}

// Load all applications
function loadApplications() {
    fetch(API_BASE + 'admin.php?action=get_all_applications')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                applicationsData = data.data;
                filteredData = applicationsData;
                displayApplications(filteredData);
            }
        })
        .catch(error => {
            console.error('Applications load error:', error);
            showNotification('Failed to load applications', 'error');
        });
}

// Display applications table
function displayApplications(applications) {
    const tbody = document.getElementById('applicationsTableBody');
    
    if (!applications || applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No applications found</td></tr>';
        return;
    }
    
    tbody.innerHTML = applications.map(app => `
        <tr>
            <td>${app.application_id}</td>
            <td>${app.student_name}</td>
            <td>${app.parent_name}</td>
            <td>${app.parent_phone}</td>
            <td>${app.requested_grade}</td>
            <td>${app.preferred_branch}</td>
            <td><span class="status-badge status-${app.status}">${app.status}</span></td>
            <td>
                <button class="btn-action btn-view" onclick="viewApplication(${app.id})" title="View">👁️</button>
                <button class="btn-action btn-approve" onclick="approveApplication(${app.id})" title="Approve">✓</button>
                <button class="btn-action btn-reject" onclick="rejectApplication(${app.id})" title="Reject">✗</button>
            </td>
        </tr>
    `).join('');
}

// Filter applications
function filterApplications() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const branchFilter = document.getElementById('branchFilter').value;
    const gradeFilter = document.getElementById('gradeFilter').value;
    
    filteredData = applicationsData.filter(app => {
        const matchesSearch = !searchTerm || 
            app.student_name.toLowerCase().includes(searchTerm) ||
            app.application_id.toLowerCase().includes(searchTerm) ||
            app.parent_name.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || app.status === statusFilter;
        const matchesBranch = !branchFilter || app.preferred_branch === branchFilter;
        const matchesGrade = !gradeFilter || app.requested_grade === gradeFilter;
        
        return matchesSearch && matchesStatus && matchesBranch && matchesGrade;
    });
    
    displayApplications(filteredData);
}

// View application details
function viewApplication(id) {
    fetch(API_BASE + `admin.php?action=get_application_details&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showApplicationModal(data.data);
            }
        })
        .catch(error => {
            console.error('View application error:', error);
            showNotification('Failed to load application details', 'error');
        });
}

// Show application details modal
function showApplicationModal(app) {
    const modal = document.getElementById('applicationModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="modal-header">
            <h2>Application Details</h2>
            <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="detail-section">
                <h3>Student Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Full Name:</label>
                        <span>${app.student.full_name}</span>
                    </div>
                    <div class="detail-item">
                        <label>Date of Birth:</label>
                        <span>${app.student.date_of_birth}</span>
                    </div>
                    <div class="detail-item">
                        <label>Age:</label>
                        <span>${app.student.age}</span>
                    </div>
                    <div class="detail-item">
                        <label>Gender:</label>
                        <span>${app.student.gender}</span>
                    </div>
                    <div class="detail-item">
                        <label>National ID:</label>
                        <span>${app.student.national_id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Requested Grade:</label>
                        <span>${app.student.requested_grade}</span>
                    </div>
                    <div class="detail-item">
                        <label>Preferred Branch:</label>
                        <span>${app.student.preferred_branch}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Parent/Guardian Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Full Name:</label>
                        <span>${app.parent.full_name}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span>${app.parent.email}</span>
                    </div>
                    <div class="detail-item">
                        <label>Phone:</label>
                        <span>${app.parent.phone}</span>
                    </div>
                    <div class="detail-item">
                        <label>Relationship:</label>
                        <span>${app.parent.relationship || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Documents</h3>
                <div class="documents-list">
                    ${app.documents.map(doc => `
                        <div class="document-item">
                            <span>${doc.document_type}</span>
                            <a href="uploads/${doc.file_path}" target="_blank" class="btn-download">Download</a>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Payment Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Total Amount:</label>
                        <span>${formatCurrency(app.payment.total_amount)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Payment Status:</label>
                        <span class="status-badge status-${app.payment.payment_status}">${app.payment.payment_status}</span>
                    </div>
                    <div class="detail-item">
                        <label>Payment Method:</label>
                        <span>${app.payment.payment_method}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-approve" onclick="approveApplication(${app.student.id})">Approve</button>
            <button class="btn-reject" onclick="rejectApplication(${app.student.id})">Reject</button>
            <button class="btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('applicationModal').classList.add('hidden');
}

// Approve application
function approveApplication(id) {
    if (!confirm('Are you sure you want to approve this application?')) {
        return;
    }
    
    fetch(API_BASE + 'admin.php?action=update_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'accepted' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Application approved successfully', 'success');
            loadApplications();
            closeModal();
        } else {
            showNotification(data.message || 'Failed to approve application', 'error');
        }
    })
    .catch(error => {
        console.error('Approve error:', error);
        showNotification('Failed to approve application', 'error');
    });
}

// Reject application
function rejectApplication(id) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    fetch(API_BASE + 'admin.php?action=update_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected', reason })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Application rejected', 'success');
            loadApplications();
            closeModal();
        } else {
            showNotification(data.message || 'Failed to reject application', 'error');
        }
    })
    .catch(error => {
        console.error('Reject error:', error);
        showNotification('Failed to reject application', 'error');
    });
}

// Load students
function loadStudents() {
    fetch(API_BASE + 'admin.php?action=get_all_students')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayStudents(data.data);
            }
        })
        .catch(error => {
            console.error('Students load error:', error);
        });
}

// Display students
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    
    if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.full_name}</td>
            <td>${student.date_of_birth}</td>
            <td>${student.gender}</td>
            <td>${student.requested_grade}</td>
            <td>${student.preferred_branch}</td>
            <td>${student.parent_name}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewStudent(${student.id})">View</button>
            </td>
        </tr>
    `).join('');
}

// Load payments
function loadPayments() {
    fetch(API_BASE + 'admin.php?action=get_all_payments')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayPayments(data.data);
            }
        })
        .catch(error => {
            console.error('Payments load error:', error);
        });
}

// Display payments
function displayPayments(payments) {
    const tbody = document.getElementById('paymentsTableBody');
    
    if (!payments || payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No payments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.application_id}</td>
            <td>${payment.student_name}</td>
            <td>${formatCurrency(payment.total_amount)}</td>
            <td>${payment.payment_method}</td>
            <td><span class="status-badge status-${payment.payment_status}">${payment.payment_status}</span></td>
            <td>${payment.created_at}</td>
        </tr>
    `).join('');
}

// Load reports
function loadReports() {
    fetch(API_BASE + 'admin.php?action=get_reports')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayReports(data.data);
            }
        })
        .catch(error => {
            console.error('Reports load error:', error);
        });
}

// Display reports
function displayReports(reports) {
    const container = document.getElementById('reportsContainer');
    
    container.innerHTML = `
        <div class="report-section">
            <h3>Applications by Status</h3>
            <div class="chart-container">
                <canvas id="statusChart"></canvas>
            </div>
        </div>
        <div class="report-section">
            <h3>Applications by Branch</h3>
            <div class="chart-container">
                <canvas id="branchChart"></canvas>
            </div>
        </div>
        <div class="report-section">
            <h3>Applications by Grade</h3>
            <div class="chart-container">
                <canvas id="gradeChart"></canvas>
            </div>
        </div>
    `;
    
    // Note: You would need to include Chart.js library to render charts
    // For now, just display the data
}

// Export to Excel
function exportToExcel() {
    const data = filteredData.map(app => ({
        'Application ID': app.application_id,
        'Student Name': app.student_name,
        'Parent Name': app.parent_name,
        'Phone': app.parent_phone,
        'Email': app.parent_email,
        'Grade': app.requested_grade,
        'Branch': app.preferred_branch,
        'Status': app.status,
        'Payment Status': app.payment_status,
        'Total Amount': app.total_amount,
        'Date': app.created_at
    }));
    
    // Convert to CSV
    const csv = convertToCSV(data);
    downloadCSV(csv, 'applications_export.csv');
    showNotification('Export completed', 'success');
}

// Convert data to CSV
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return `"${value}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 2
    }).format(amount);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}