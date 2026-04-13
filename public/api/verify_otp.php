<?php
/**
 * ============================================================
 * ALPHENEX — VERIFY EMAIL OTP ENDPOINT
 * ============================================================
 * 
 * POST /api/verify_otp.php
 * 
 * Accepts: { "email": "...", "otp_code": "...", "session_token": "..." }
 * Returns: { "success": true, "message": "...", "otp_id": 123 }
 * 
 * Verifies the OTP entered by the user against the database.
 * Checks: valid code, not expired, not too many attempts, not already used.
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

    $email        = trim($data['email'] ?? '');
    $otpCode      = trim($data['otp_code'] ?? '');
    $sessionToken = trim($data['session_token'] ?? '');

    // --- Validation ---
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("A valid email address is required.");
    }

    if (empty($otpCode) || !preg_match('/^\d{6}$/', $otpCode)) {
        throw new Exception("Please enter a valid 6-digit verification code.");
    }

    if (strlen($sessionToken) !== 64) {
        throw new Exception("Invalid session. Please refresh the page and try again.");
    }

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

    // --- Find the latest active OTP for this email + session ---
    $findOtp = $pdo->prepare(
        "SELECT id, otp_code, attempts, expires_at, is_verified 
         FROM Alphenex_email_otp 
         WHERE email = :email 
           AND session_token = :stoken 
           AND is_verified = 0 
         ORDER BY created_at DESC 
         LIMIT 1"
    );
    $findOtp->execute([':email' => $email, ':stoken' => $sessionToken]);
    $otpRecord = $findOtp->fetch();

    if (!$otpRecord) {
        logError('validation', 'verify_otp.php', '/api/verify_otp.php', 404, "No active OTP found for email: $email");
        echo json_encode([
            "success" => false,
            "error" => "No active verification code found. Please request a new OTP.",
            "expired" => true
        ]);
        exit;
    }

    $otpId = (int)$otpRecord['id'];
    $storedOtp = $otpRecord['otp_code'];
    $attempts = (int)$otpRecord['attempts'];
    $expiresAt = $otpRecord['expires_at'];

    // --- Check if expired ---
    if (strtotime($expiresAt) < time()) {
        // Mark as expired
        logError('validation', 'verify_otp.php', '/api/verify_otp.php', 410, "OTP expired for ID: $otpId, email: $email");
        $pdo->prepare("UPDATE Alphenex_email_otp SET is_verified = -2 WHERE id = :id")
            ->execute([':id' => $otpId]);

        echo json_encode([
            "success" => false,
            "error" => "This verification code has expired. Please request a new one.",
            "expired" => true
        ]);
        exit;
    }

    // --- Check max attempts (5) ---
    if ($attempts >= 5) {
        // Invalidate the OTP
        logError('security', 'verify_otp.php', '/api/verify_otp.php', 429, "Max OTP attempts reached for ID: $otpId, email: $email");
        $pdo->prepare("UPDATE Alphenex_email_otp SET is_verified = -3 WHERE id = :id")
            ->execute([':id' => $otpId]);

        echo json_encode([
            "success" => false,
            "error" => "Too many incorrect attempts. Please request a new verification code.",
            "max_attempts" => true
        ]);
        exit;
    }

    // --- Verify OTP ---
    if ($otpCode !== $storedOtp) {
        // Increment attempt count
        $pdo->prepare("UPDATE Alphenex_email_otp SET attempts = attempts + 1 WHERE id = :id")
            ->execute([':id' => $otpId]);

        $remainingAttempts = 4 - $attempts; // 5 max, 0-indexed
        echo json_encode([
            "success" => false,
            "error" => "Incorrect verification code. You have $remainingAttempts attempt(s) remaining.",
            "remaining_attempts" => $remainingAttempts
        ]);
        exit;
    }

    // --- OTP is correct! Mark as verified ---
    $verify = $pdo->prepare(
        "UPDATE Alphenex_email_otp SET is_verified = 1, verified_at = NOW() WHERE id = :id"
    );
    $verify->execute([':id' => $otpId]);

    echo json_encode([
        "success" => true,
        "message" => "Email verified successfully!",
        "otp_id" => $otpId
    ]);

} catch (PDOException $e) {
    logError('backend', 'verify_otp.php', '/api/verify_otp.php', 500, $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Server error. Please try again or contact us directly."
    ]);
} catch (Exception $e) {
    logError('backend', 'verify_otp.php', '/api/verify_otp.php', 400, $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

?>
