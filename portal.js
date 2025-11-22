// Portal Authentication and Dashboard Management

// Get elements
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginBox = document.getElementById('loginBox');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Demo user data (in real app, this would be from a database)
const demoUsers = {
    'parent@example.com': {
        password: 'password123',
        name: 'John Doe',
        phone: '+251 912 345 678',
        student: {
            name: 'Sarah Doe',
            id: 'MCS-2024-001',
            grade: 'Grade 10',
            branch: 'Addis Ababa'
        }
    }
};

// Check if user is already logged in
window.addEventListener('load', () => {
    const loggedInUser = localStorage.getItem('mcsLoggedInUser');
    if (loggedInUser) {
        const userData = JSON.parse(loggedInUser);
        showDashboard(userData);
    }
});

// No signup functionality - login only

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Check credentials (demo)
    if (demoUsers[email] && demoUsers[email].password === password) {
        const userData = {
            email: email,
            name: demoUsers[email].name,
            phone: demoUsers[email].phone,
            student: demoUsers[email].student
        };
        
        // Save to localStorage
        localStorage.setItem('mcsLoggedInUser', JSON.stringify(userData));
        
        // Show dashboard
        showDashboard(userData);
        
        // Show success message
        showNotification('Login successful! Welcome back.', 'success');
    } else {
        showNotification('Invalid email or password. Try: parent@example.com / password123', 'error');
    }
});

// Signup removed - contact school for credentials

// Handle logout
logoutBtn.addEventListener('click', () => {
    // Clear localStorage
    localStorage.removeItem('mcsLoggedInUser');
    
    // Hide dashboard and show auth
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    
    // Reset forms
    loginForm.reset();
    signupForm.reset();
    
    // Show message
    showNotification('Logged out successfully!', 'success');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Show dashboard with user data
function showDashboard(userData) {
    // Hide auth section
    authSection.classList.add('hidden');
    
    // Show dashboard
    dashboardSection.classList.remove('hidden');
    
    // Populate user data
    document.getElementById('parentName').textContent = userData.name;
    document.getElementById('studentName').textContent = userData.student.name;
    document.getElementById('displayStudentId').textContent = userData.student.id;
    document.getElementById('studentGrade').textContent = userData.student.grade;
    document.getElementById('studentBranch').textContent = userData.student.branch;
    
    // Scroll to dashboard
    setTimeout(() => {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

// Download report buttons
const downloadBtns = document.querySelectorAll('.download-btn');
downloadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        showNotification('Report download started...', 'success');
        // In real app, this would trigger actual file download
    });
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
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'success' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'};
        border: 2px solid ${type === 'success' ? '#00ff00' : '#ff6b6b'};
        color: ${type === 'success' ? '#00ff00' : '#ff6b6b'};
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        max-width: 400px;
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

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Animate progress bars when grades tab is visible
const gradesTab = document.getElementById('gradesTab');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.progress-bar');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }
    });
}, { threshold: 0.5 });

if (gradesTab) {
    observer.observe(gradesTab);
}


// Set initial transition styles
if (loginBox) {
    loginBox.style.transition = 'all 0.3s ease-out';
}
