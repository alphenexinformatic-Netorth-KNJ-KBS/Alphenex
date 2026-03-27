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
    
    if (empty($email)) {
        $errors[] = "Email is required";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Please enter a valid email address";
    }
    
    if (empty($phone)) {
        $errors[] = "Phone number is required";
    } elseif (!preg_match('/^[\d\s\-\+\(\)]{7,20}$/', $phone)) {
        $errors[] = "Please enter a valid phone number";
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
    
    // Resolve session ID if session_token provided
    $sessionId = null;
    if (!empty($sessionToken) && strlen($sessionToken) === 64) {
        $stmt = $pdo->prepare(
            "SELECT id FROM Alphenex_chat_sessions WHERE session_token = :token LIMIT 1"
        );
        $stmt->execute([':token' => $sessionToken]);
        $session = $stmt->fetch();
        if ($session) {
            $sessionId = (int) $session['id'];
        }
    }
    
    // Insert lead into Alphenex_Chat_Leads (NOT Alphenex_Inquiry_Table)
    $stmt = $pdo->prepare(
        "INSERT INTO Alphenex_Chat_Leads (session_id, name, email, phone, inquiry, created_at) 
         VALUES (:session_id, :name, :email, :phone, :inquiry, NOW())"
    );
    $stmt->execute([
        ':session_id' => $sessionId,
        ':name'       => $name,
        ':email'      => $email,
        ':phone'      => $phone,
        ':inquiry'    => $inquiry,
    ]);
    
    // Update session with lead completion flag if session exists
    if ($sessionId) {
        $update = $pdo->prepare(
            "UPDATE Alphenex_chat_sessions 
             SET lead_completed = 1, user_name = :name, email = :email, updated_at = NOW() 
             WHERE id = :id"
        );
        $update->execute([
            ':name'  => $name,
            ':email' => $email,
            ':id'    => $sessionId,
        ]);
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
