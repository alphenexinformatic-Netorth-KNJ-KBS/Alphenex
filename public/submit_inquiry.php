<?php
/**
 * Alphenex Inquiry Form Backend API
 * Handles form submissions and saves them into the MySQL database using PDO.
 * Located at: /public/submit_inquiry.php
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Preflight request handling for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load database configurations and error logger
require_once 'db_config.php';
require_once __DIR__ . '/api/log_error.php';

try {
    // Create a new PDO connection
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get JSON submission data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception("No valid data received.");
    }

    // Extract fields (matching the frontend mapping in ContactForm.jsx)
    $name    = trim($data['name'] ?? '');
    $email   = trim($data['email'] ?? '');
    $phone   = trim($data['phone'] ?? ''); // Combined country code + phone
    $company = trim($data['company'] ?? '');
    $service = trim($data['service'] ?? '');
    $message = trim($data['message'] ?? ''); // Optional field

    // Validation (as a safety measure on top of the frontend)
    if (empty($name) || empty($email) || empty($phone)) {
        throw new Exception("Required fields are missing (Name, Email, or Phone).");
    }

    // SQL insertion logic: uses backticks for columns with spaces
    $sql = "INSERT INTO Alphenex_Inquiry_Table (Name, Email, PhoneNumber, Company, `Service Interest`, Message) 
            VALUES (:name, :email, :phone, :company, :service, :message)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':phone'   => $phone,
        ':company' => $company,
        ':service' => $service,
        ':message' => $message
    ]);

    // Send success response
    echo json_encode(["status" => "success", "message" => "Your message has been saved. We'll contact you soon!"]);

} catch (PDOException $e) {
    logError('backend', 'ContactForm.jsx', '/submit_inquiry.php', 500, $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Connection Failed. Please try again."]);
} catch (Exception $e) {
    logError('backend', 'ContactForm.jsx', '/submit_inquiry.php', 400, $e->getMessage());
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
