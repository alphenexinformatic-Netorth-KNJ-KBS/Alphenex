<?php
/**
 * ============================================================
 * ALPHENEX — SEND EMAIL OTP ENDPOINT
 * ============================================================
 * 
 * POST /api/send_otp.php
 * 
 * Accepts: { "email": "...", "session_token": "...", "source": "contact_form|raga_chatbot" }
 * Returns: { "success": true, "message": "..." }
 * 
 * Generates a 6-digit OTP, stores it in Alphenex_email_otp table,
 * and sends it via email using PHP mail().
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
        logError('backend', 'send_otp.php', '/api/send_otp.php', 400, "Invalid JSON received: " . substr($rawInput, 0, 200));
        throw new Exception("Invalid request format");
    }

    $email        = trim($data['email'] ?? '');
    $sessionToken = trim($data['session_token'] ?? '');
    $source       = trim($data['source'] ?? 'unknown');

    // --- Validation ---
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        logError('validation', 'send_otp.php', '/api/send_otp.php', 400, "Invalid email: $email");
        throw new Exception("A valid email address is required to send OTP.");
    }

    if (strlen($sessionToken) !== 64) {
        $sessionToken = bin2hex(random_bytes(32));
    }

    // Validate source
    $allowedSources = ['contact_form', 'raga_chatbot'];
    if (!in_array($source, $allowedSources)) {
        $source = 'unknown';
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

    // --- Rate Limiting: Max 5 OTPs per email in 10 minutes ---
    $rateLimitCheck = $pdo->prepare(
        "SELECT COUNT(*) FROM Alphenex_email_otp 
         WHERE email = :email AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)"
    );
    $rateLimitCheck->execute([':email' => $email]);
    $recentCount = (int)$rateLimitCheck->fetchColumn();

    if ($recentCount >= 5) {
        logError('rate_limit', 'send_otp.php', '/api/send_otp.php', 429, "Rate limited: $email ($recentCount requests in 10 min)");
        echo json_encode([
            "success" => false,
            "error" => "Too many OTP requests. Please wait a few minutes before trying again.",
            "rate_limited" => true
        ]);
        exit;
    }

    // --- Invalidate any previous unused OTPs for this email + session ---
    $invalidate = $pdo->prepare(
        "UPDATE Alphenex_email_otp SET is_verified = -1 
         WHERE email = :email AND session_token = :stoken AND is_verified = 0"
    );
    $invalidate->execute([':email' => $email, ':stoken' => $sessionToken]);

    // --- Generate 6-digit OTP ---
    $otpCode = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    // --- Store OTP in Database ---
    $insert = $pdo->prepare(
        "INSERT INTO Alphenex_email_otp (email, otp_code, session_token, source, is_verified, attempts, expires_at) 
         VALUES (:email, :otp, :stoken, :source, 0, 0, :expires)"
    );
    $insert->execute([
        ':email'   => $email,
        ':otp'     => $otpCode,
        ':stoken'  => $sessionToken,
        ':source'  => $source,
        ':expires' => $expiresAt
    ]);

    $otpId = $pdo->lastInsertId();

    // --- Build Logo URL (hosted on the live site) ---
    $logoUrl = 'https://alphenex.com/assets/alphenex-logo.jpeg';

    // --- Send OTP Email (Premium Design with Watermark & Disclaimers) ---
    $subject = "Alphenex Informatic — Verification Code: $otpCode";
    
    $htmlBody = '
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alphenex — Email Verification</title>
    </head>
    <body style="margin:0; padding:0; background-color:#050d1a; font-family: \'Segoe UI\', Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#050d1a; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background: #0a1929; border: 1px solid rgba(77,200,240,0.15); border-radius: 20px; overflow: hidden; position: relative;">
                        
                        <!-- Header with Logo -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #0972A2, #0992C2, #4dc8f0); padding: 32px 40px; text-align: center;">
                                <img src="' . $logoUrl . '" alt="Alphenex Informatic" width="56" height="56" style="display: block; margin: 0 auto 14px; border-radius: 14px; border: 2px solid rgba(255,255,255,0.25); box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />
                                <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">Alphenex Informatic LLP</h1>
                                <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Secure Email Verification</p>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 36px 40px 28px; position: relative;">
                                <!-- Watermark Logo (Background) -->
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.03; pointer-events: none;">
                                    <img src="' . $logoUrl . '" alt="" width="220" height="220" style="display: block;" />
                                </div>

                                <p style="color: rgba(255,255,255,0.75); font-size: 15px; line-height: 1.7; margin: 0 0 8px; position: relative; z-index: 1;">
                                    Hello,
                                </p>
                                <p style="color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.7; margin: 0 0 28px; position: relative; z-index: 1;">
                                    You have requested a one-time verification code for your inquiry at <strong style="color: #4dc8f0;">Alphenex Informatic</strong>. Please use the code below to verify your email address and proceed with your submission.
                                </p>
                                
                                <!-- OTP Code Box -->
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 28px; position: relative; z-index: 1;">
                                    <tr>
                                        <td style="background: rgba(9,146,194,0.08); border: 2px solid rgba(77,200,240,0.25); border-radius: 16px; padding: 28px 24px; text-align: center;">
                                            <p style="color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 14px; font-weight: 700;">Your Verification Code</p>
                                            <p style="color: #4dc8f0; font-size: 42px; font-weight: 900; letter-spacing: 10px; margin: 0; font-family: \'Courier New\', monospace; text-shadow: 0 0 20px rgba(77,200,240,0.3);">' . $otpCode . '</p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Info Items -->
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 8px; position: relative; z-index: 1;">
                                    <tr>
                                        <td style="padding: 10px 14px; background: rgba(77,200,240,0.05); border-left: 3px solid rgba(77,200,240,0.4); border-radius: 0 8px 8px 0; margin-bottom: 8px;">
                                            <p style="color: rgba(255,255,255,0.6); font-size: 12px; line-height: 1.6; margin: 0;">
                                                <strong style="color: rgba(255,255,255,0.8);">Validity:</strong> This code expires in <strong style="color: #4dc8f0;">10 minutes</strong> and is valid for <strong style="color: #4dc8f0;">one-time use only</strong>.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 8px 0 0; position: relative; z-index: 1;">
                                    <tr>
                                        <td style="padding: 10px 14px; background: rgba(239,68,68,0.04); border-left: 3px solid rgba(239,68,68,0.3); border-radius: 0 8px 8px 0;">
                                            <p style="color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.6; margin: 0;">
                                                <strong style="color: rgba(255,255,255,0.7);">Didn\'t request this?</strong> If you did not initiate this verification, please ignore this email. No action is required and your account remains secure.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Separator -->
                        <tr>
                            <td style="padding: 0 40px;">
                                <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(77,200,240,0.15), transparent);"></div>
                            </td>
                        </tr>

                        <!-- Footer / Disclaimers -->
                        <tr>
                            <td style="padding: 24px 40px 32px; text-align: center;">
                                <p style="color: rgba(255,255,255,0.3); font-size: 11px; line-height: 1.8; margin: 0 0 12px;">
                                    This is a <strong>system-generated email</strong>. Please <strong>do not reply</strong> to this message.<br/>
                                    For any assistance, contact us at <a href="mailto:alphenex.informatic@alphenex.com" style="color: #4dc8f0; text-decoration: none; font-weight: 600;">alphenex.informatic@alphenex.com</a>
                                </p>
                                <p style="color: rgba(255,255,255,0.2); font-size: 10px; margin: 0 0 6px; letter-spacing: 0.5px;">
                                    This verification code is intended solely for the recipient and should not be shared with anyone.
                                </p>
                                <p style="color: rgba(255,255,255,0.15); font-size: 10px; margin: 12px 0 0; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 12px;">
                                    &copy; ' . date('Y') . ' Alphenex Informatic LLP. All rights reserved.<br/>
                                    <a href="https://www.alphenex.com" style="color: rgba(77,200,240,0.5); text-decoration: none;">www.alphenex.com</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>';

    // Email headers
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=utf-8\r\n";
    $headers .= "From: Alphenex Informatic <noreply@alphenex.com>\r\n";
    $headers .= "Reply-To: alphenex.informatic@alphenex.com\r\n";
    $headers .= "X-Mailer: AlphenexOTP/1.0\r\n";

    $mailSent = @mail($email, $subject, $htmlBody, $headers);

    if (!$mailSent) {
        logError('backend', 'send_otp.php', '/api/send_otp.php', 500, "mail() failed for $email (OTP ID: $otpId)");
        
        echo json_encode([
            "success" => false,
            "error" => "Failed to send verification email. Please check your email address and try again."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "A 6-digit verification code has been sent to your email address.",
        "otp_id" => (int)$otpId,
        "expires_in" => 600
    ]);

} catch (PDOException $e) {
    logError('backend', 'send_otp.php', '/api/send_otp.php', 500, "PDO Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Server error. Please try again or contact us directly."
    ]);
} catch (Exception $e) {
    logError('backend', 'send_otp.php', '/api/send_otp.php', 400, "Exception: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

?>
