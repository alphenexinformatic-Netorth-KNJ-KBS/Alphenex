<?php
/**
 * ============================================================
 * ALPHENEX — CENTRALIZED ERROR LOGGER (Restructured)
 * ============================================================
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Correlation-ID"); // Updated CORS headers

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db_config.php';

function getClientIP(): string {
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip = explode(',', $_SERVER[$header])[0];
            $ip = trim($ip);
            if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Automatically fetch the correlation ID from either the headers or manually passed parameter
 */
function logError(
    string $source,
    ?string $pageName,
    ?string $endpoint,
    ?int $httpStatus,
    string $message,
    ?string $requestData = null,
    ?string $manualId = null // Manual override if needed
): void {
    try {
        global $db_host, $db_name, $db_user, $db_pass;
        
        // Always try to catch the ID from the incoming HTTP headers if not passed manually
        // We look for 'X-Correlation-ID' sent by the frontend's fetch interceptor
        $uniqueId = $manualId;
        if (!$uniqueId) {
            $headers = getallheaders();
            $uniqueId = $headers['X-Correlation-ID'] ?? $headers['x-correlation-id'] ?? null;
        }
        
        $pdo = new PDO(
            "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
            $db_user,
            $db_pass,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        $stmt = $pdo->prepare(
            "INSERT INTO Alphenex_Error_Logs 
             (error_source, unique_error_id, error_page_name, endpoint, http_status, error_message, ip_address, user_agent, request_data) 
             VALUES (:source, :unique_id, :page, :endpoint, :status, :message, :ip, :ua, :req)"
        );
        
        $stmt->execute([
            ':source'    => $source,
            ':unique_id' => $uniqueId ? substr($uniqueId, 0, 50) : null,
            ':page'      => $pageName ? substr($pageName, 0, 100) : null,
            ':endpoint'  => $endpoint ? substr($endpoint, 0, 500) : null,
            ':status'    => $httpStatus,
            ':message'   => substr($message, 0, 65000),
            ':ip'        => getClientIP(),
            ':ua'        => isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : null,
            ':req'       => $requestData ? substr($requestData, 0, 65000) : null,
        ]);
    } catch (Throwable $e) {
        error_log("CRITICAL: Error logger failed — " . $e->getMessage());
    }
}

// ENDPOINT LOGIC
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            
            if (!$data || empty($data['error_message'])) {
                http_response_code(400); exit;
            }
            
            // Log manually passed ID from the frontend
            logError(
                $data['error_source'] ?? 'frontend',
                $data['error_page_name'] ?? null,
                $data['endpoint'] ?? null,
                isset($data['http_status']) ? (int)$data['http_status'] : null,
                $data['error_message'],
                $data['request_data'] ?? null,
                $data['unique_error_id'] ?? null // The frontend reports the same ID it generated
            );
            echo json_encode(["success" => true]);
        } catch (Throwable $e) { http_response_code(500); }
        exit;
    }
}
?>
