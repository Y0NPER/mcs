<?php
// Magic Carpet School - Configuration File

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'mcs_registration');
define('DB_USER', 'root');  // Change this in production
define('DB_PASS', '');      // Change this in production
define('DB_CHARSET', 'utf8mb4');

// Application Settings
define('APP_NAME', 'Magic Carpet School');
define('APP_URL', 'http://localhost/mcs web');
define('ADMIN_EMAIL', 'admin@mcs.edu.et');

// File Upload Settings
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['pdf', 'jpg', 'jpeg', 'png']);

// Session Settings
define('SESSION_LIFETIME', 3600); // 1 hour
define('SESSION_NAME', 'MCS_SESSION');

// Security Settings
define('HASH_ALGO', PASSWORD_BCRYPT);
define('HASH_COST', 10);

// Fee Structure
define('REGISTRATION_FEE', 500);
define('PROCESSING_FEE', 200);
define('FEE_KINDERGARTEN', 1000);
define('FEE_ELEMENTARY', 2300);
define('FEE_HIGH_SCHOOL', 3200);

// Error Reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Africa/Addis_Ababa');

// CORS Headers (adjust for production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection Class
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit();
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}

// Utility Functions
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function generate_application_id() {
    $year = date('Y');
    $random = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
    return "MCS-{$year}-{$random}";
}

function calculate_term_fee($grade) {
    if ($grade === 'kg') {
        return FEE_KINDERGARTEN;
    } elseif (in_array($grade, ['1', '2', '3', '4', '5', '6', '7', '8'])) {
        return FEE_ELEMENTARY;
    } elseif (in_array($grade, ['9', '10', '11', '12'])) {
        return FEE_HIGH_SCHOOL;
    }
    return 0;
}

function send_json_response($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}

function verify_session() {
    session_start();
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type'])) {
        send_json_response(false, 'Unauthorized access');
    }
    return [
        'user_id' => $_SESSION['user_id'],
        'user_type' => $_SESSION['user_type']
    ];
}

function create_upload_directory() {
    if (!file_exists(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
}

// Initialize
create_upload_directory();
?>