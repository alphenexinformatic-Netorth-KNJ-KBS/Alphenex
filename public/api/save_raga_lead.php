<?php
/**
 * ============================================================
 * RAGA CHATBOT — LEAD SAVE ENDPOINT
 * ============================================================
 * 
 * POST /api/save_raga_lead.php
 * 
 * Accepts: { "session_token": "...", "name": "...", "email": "...", "phone": "...", "inquiry": "..." }
 * Returns: { "success": true, "message": "..." }
 * 
 * Saves lead information into Alphenex_Chat_Leads table.
 * Does NOT touch Alphenex_Inquiry_Table (that is for the website contact form).
 * 
 * All inputs are validated and sanitized.
 * All DB operations use prepared statements.
 * ============================================================
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// POST-only endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

// Load database configuration and error logger
require_once __DIR__ . '/raga_config.php';
require_once __DIR__ . '/log_error.php';

try {
    // Parse JSON body
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    if (!$data) {
        throw new Exception("Invalid request format");
    }
    
    // Extract and sanitize fields
    $sessionToken = trim($data['session_token'] ?? '');
    $name         = trim($data['name'] ?? '');
    $email        = trim($data['email'] ?? '');
    $phone        = trim($data['phone'] ?? '');
    $inquiry      = trim($data['inquiry'] ?? '');
    
    // --- Validation ---
    $errors = [];
    
    if (empty($name)) {
        $errors[] = "Full name is required";
    } elseif (mb_strlen($name) > 100) {
        $errors[] = "Name is too long (max 100 characters)";
    }
    
    // Check if both email and phone are empty
    if (empty($email) && empty($phone)) {
        $errors[] = "At least one contact method (Email or Phone) is required";
    } else {
        // If provided, check if valid
        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Please enter a valid email address";
        }
        if (!empty($phone) && !preg_match('/^[\d\s\-\+\(\)]{7,20}$/', $phone)) {
            $errors[] = "Please enter a valid phone number";
        }
    }
    
    if (empty($inquiry)) {
        $errors[] = "Inquiry / project requirement is required";
    } elseif (mb_strlen($inquiry) > 2000) {
        $errors[] = "Inquiry is too long (max 2000 characters)";
    }
    
    if (!empty($errors)) {
        throw new Exception(implode(". ", $errors));
    }
    
    // Sanitize against XSS
    $name    = htmlspecialchars($name, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $email   = htmlspecialchars($email, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $phone   = htmlspecialchars($phone, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $inquiry = htmlspecialchars($inquiry, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    
    // Connect to database
    global $db_host, $db_name, $db_user, $db_pass;
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    // Extract session token
    $sessionToken = trim($data['session_token'] ?? '');
    if (strlen($sessionToken) !== 64) {
         // Generate if missing, though typically the client provides it
         $sessionToken = bin2hex(random_bytes(32)); 
    }

    // --- IDENTITY RESOLUTION (No session table needed) ---
    // Try to find an existing parent lead for this session token to get the common session_id
    $findSid = $pdo->prepare("SELECT session_id FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
    $findSid->execute([':token' => $sessionToken]);
    $existingSid = $findSid->fetchColumn();

    // If no numeric ID found in leads table, generate a deterministic numeric ID from the token
    $sessionId = $existingSid ? (int)$existingSid : (abs(crc32($sessionToken)) % 100000000);

    $childSessionId = trim($data['child_session_id'] ?? '');
    
    // 1. Feature: Check for existing lead (for Popup)
    if (isset($data['action']) && $data['action'] === 'check_existing') {
        $check = $pdo->prepare("SELECT name FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
        $check->execute([':token' => $sessionToken]);
        $existing = $check->fetch();
        echo json_encode(["success" => true, "exists" => !!$existing, "name" => $existing['name'] ?? '']);
        exit;
    }

    // --- DEDUPLICATION / CHILD SESSION LOGIC ---
    if (!empty($childSessionId)) {
        // This is a NEW requirement (Child) -> ALWAYS INSERT
        $sql = "INSERT INTO Alphenex_Chat_Leads (session_id, Session_token, child_session_id, name, email, phone, inquiry, source, Company_name, Service_Interest) 
                VALUES (:sid, :stoken, :csid, :name, :email, :phone, :inquiry, :source, :company, :service)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':sid'      => $sessionId,
            ':stoken'   => $sessionToken,
            ':csid'     => $childSessionId,
            ':name'     => $name,
            ':email'    => $email,
            ':phone'    => $phone,
            ':inquiry'  => $inquiry,
            ':source'   => 'raga_chatbot',
            ':company'  => trim($data['company'] ?? ''),
            ':service'  => trim($data['service'] ?? '')
        ]);
    } else {
        // Standard Chat Submission: Check if a 'parent' lead exists without a child ID
        $check = $pdo->prepare("SELECT id FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
        $check->execute([':token' => $sessionToken]);
        $existingLeadId = $check->fetchColumn();

        if ($existingLeadId) {
            // Business Rule: Inquiries are "Full and Final". No modifications allowed once saved.
            // Any new data must be submitted under a 'child_session_id'.
            echo json_encode([
                "success" => false, 
                "error" => "An inquiry has already been finalized for this session. To provide new details, please start a New Inquiry."
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
                ':inquiry' => $inquiry,
                ':source'  => 'raga_chatbot',
                ':company' => trim($data['company'] ?? ''),
                ':service' => trim($data['service'] ?? '')
            ]);
        }
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Thank you, $name! Your inquiry has been received. Our team will reach out shortly."
    ]);

} catch (PDOException $e) {
    logError('backend', 'RagaChatbot.jsx', '/api/save_raga_lead.php', 500, $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Unable to save your information. Please try again or contact us directly."
    ]);
} catch (Exception $e) {
    logError('backend', 'RagaChatbot.jsx', '/api/save_raga_lead.php', 400, $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

?>
