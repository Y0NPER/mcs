-- Magic Carpet School Registration Database
-- Create database
CREATE DATABASE IF NOT EXISTS mcs_registration;
USE mcs_registration;

-- Table for parent/guardian accounts
CREATE TABLE parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    national_id VARCHAR(50),
    relationship VARCHAR(50),
    occupation VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for students
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INT,
    gender ENUM('male', 'female') NOT NULL,
    national_id VARCHAR(50) NOT NULL,
    previous_school VARCHAR(255),
    previous_grade VARCHAR(10),
    requested_grade VARCHAR(10) NOT NULL,
    preferred_branch ENUM('addis', 'mekele') NOT NULL,
    student_phone VARCHAR(20),
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
);

-- Table for document uploads
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    document_type ENUM('student_id', 'guardian_id', 'transcript', 'student_photo', 'address_proof', 'medical_record') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table for registration applications
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    application_id VARCHAR(20) UNIQUE NOT NULL,
    registration_fee DECIMAL(10,2) DEFAULT 500.00,
    processing_fee DECIMAL(10,2) DEFAULT 200.00,
    term_fee DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('card', 'mobile', 'bank', 'manual'),
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payment_receipt VARCHAR(500),
    terms_accepted BOOLEAN DEFAULT FALSE,
    privacy_accepted BOOLEAN DEFAULT FALSE,
    medical_consent BOOLEAN DEFAULT FALSE,
    transport_permission BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table for admin users
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for login sessions
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('parent', 'admin') NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin users
-- Admin 1: email: admin@mcs.edu.et, password: admin123
-- Admin 2: email: yonper26, password: r0uv2d!ynk (Super Admin with full control)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@mcs.edu.et', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin'),
('superadmin', 'yonper26', '$2y$10$Zx8vK9mN3pQ7rL2wE5tY6.uJ4hG8fD9cB1aS6vM7nP0qR3tY8wZ5e', 'Super Admin', 'admin');

-- Create indexes for better performance
CREATE INDEX idx_parents_email ON parents(email);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_student_id ON documents(student_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);