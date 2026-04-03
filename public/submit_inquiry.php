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

    // Extract session token
    $sessionToken = trim($data['session_token'] ?? '');
    if (strlen($sessionToken) !== 64) {
        $sessionToken = bin2hex(random_bytes(32)); // Emergency token
    }

    // --- IDENTITY RESOLUTION (No session table needed) ---
    // Try to find an existing parent lead for this session token to get the common session_id
    $findSid = $pdo->prepare("SELECT session_id FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
    $findSid->execute([':token' => $sessionToken]);
    $existingSid = $findSid->fetchColumn();

    // If no numeric ID found in leads table, generate a deterministic numeric ID from the token
    // This maintains the 'session_id' column for systems that expect an integer
    $sessionId = $existingSid ? (int)$existingSid : (abs(crc32($sessionToken)) % 100000000);

    // 1. Feature: Check for existing lead (for Popup)
    // We now fetch directly from the Leads table based on token
    if (isset($data['action']) && $data['action'] === 'check_existing') {
        $check = $pdo->prepare("SELECT name FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
        $check->execute([':token' => $sessionToken]);
        $existing = $check->fetch();
        echo json_encode(["status" => "success", "exists" => !!$existing, "name" => $existing['name'] ?? '']);
        exit;
    }

    // --- Lead Submission Mapping ---
    // Map fields and set source
    $name              = trim($data['name'] ?? '');
    $email             = trim($data['email'] ?? '');
    $phone             = trim($data['phone'] ?? ''); 
    $company           = trim($data['company'] ?? '');
    $service           = trim($data['service'] ?? '');
    $message           = trim($data['message'] ?? ''); 
    $childSessionId    = trim($data['child_session_id'] ?? '');

    // Validation
    if (empty($name) || (empty($email) && empty($phone))) {
        throw new Exception("Required contact information is missing.");
    }

    // --- DEDUPLICATION / CHILD SESSION LOGIC ---
    if (!empty($childSessionId)) {
        // This is a NEW requirement in the same session -> ALWAYS INSERT
        $sql = "INSERT INTO Alphenex_Chat_Leads (session_id, Session_token, child_session_id, name, email, phone, inquiry, source, Company_name, Service_Interest) 
                VALUES (:sid, :stoken, :csid, :name, :email, :phone, :inquiry, :source, :company, :service)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':sid'     => $sessionId,
            ':stoken'  => $sessionToken,
            ':csid'    => $childSessionId,
            ':name'    => $name,
            ':email'   => $email,
            ':phone'   => $phone,
            ':inquiry' => $message,
            ':source'  => 'Inquiry Form',
            ':company' => $company,
            ':service' => $service
        ]);
    } else {
        // Standard submission: check if a 'parent' lead exists for this token (no child ID)
        $check = $pdo->prepare("SELECT id FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
        $check->execute([':token' => $sessionToken]);
        $existingLeadId = $check->fetchColumn();

        if ($existingLeadId) {
            // Business Rule: Standard inquiries are "Full and Final". No overwriting allowed.
            // User must continue with a New Inquiry (Child Session) which is handled by the 'childSessionId' block above.
            echo json_encode([
                "status" => "error", 
                "message" => "You have already submitted an inquiry for this session. Please use the 'New Inquiry' option to submit additional requirements."
            ]);
            exit;
        } else {
            // INSERT new parent lead
            $sql = "INSERT INTO Alphenex_Chat_Leads (session_id, Session_token, name, email, phone, inquiry, source, Company_name, Service_Interest) 
                    VALUES (:sid, :stoken, :name, :email, :phone, :inquiry, :source, :company, :service)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':sid'     => $sessionId,
                ':stoken'  => $sessionToken,
                ':name'    => $name,
                ':email'   => $email,
                ':phone'   => $phone,
                ':inquiry' => $message,
                ':source'  => 'Inquiry Form',
                ':company' => $company,
                ':service' => $service
            ]);
        }
    }

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
