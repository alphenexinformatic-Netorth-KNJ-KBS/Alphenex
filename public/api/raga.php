<?php
/**
 * ============================================================
 * RAGA CHATBOT — MAIN CHAT ENDPOINT
 * ============================================================
 * 
 * POST /api/raga.php
 * 
 * Accepts: { "message": "...", "session_token": "..." }
 * Returns: { "success": true, "session_token": "...", "reply": "..." }
 * 
 * SECURITY ARCHITECTURE:
 * - Frontend sends message to THIS PHP endpoint only
 * - PHP adds Authorization: Bearer <SECRET> when calling external LLM
 * - Frontend NEVER sees the API key or auth token
 * - All DB operations use prepared statements
 * - Input is sanitized and length-capped
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

// Load configuration, knowledge, and error logger
require_once __DIR__ . '/raga_config.php';
require_once __DIR__ . '/raga_knowledge.php';
require_once __DIR__ . '/log_error.php';

/**
 * Generate a cryptographically secure session token
 */
function generateSessionToken(): string
{
    return bin2hex(random_bytes(32));
}

/**
 * Get or create a PDO database connection
 */
function getDB(): PDO
{
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
    return $pdo;
}

/**
 * Find or create a chat session
 */
function resolveSession(PDO $pdo, ?string $token): array
{
    // If token provided, try to find existing session
    if ($token && strlen($token) === 64) {
        $stmt = $pdo->prepare(
            "SELECT id, session_token, created_at FROM Alphenex_chat_sessions 
             WHERE session_token = :token 
             AND created_at >= DATE_SUB(NOW(), INTERVAL :ttl HOUR)
             LIMIT 1"
        );
        $stmt->execute([':token' => $token, ':ttl' => RAGA_SESSION_TTL_HOURS]);
        $session = $stmt->fetch();

        if ($session) {
            // Update last activity
            $update = $pdo->prepare(
                "UPDATE Alphenex_chat_sessions SET updated_at = NOW() WHERE id = :id"
            );
            $update->execute([':id' => $session['id']]);
            return $session;
        }
    }

    // Create new session
    $newToken = generateSessionToken();
    $stmt = $pdo->prepare(
        "INSERT INTO Alphenex_chat_sessions (session_token, created_at, updated_at) 
         VALUES (:token, NOW(), NOW())"
    );
    $stmt->execute([':token' => $newToken]);

    return [
        'id' => $pdo->lastInsertId(),
        'session_token' => $newToken,
        'created_at' => date('Y-m-d H:i:s')
    ];
}

/**
 * Save a message to chat history
 */
function saveMessage(PDO $pdo, int $sessionId, string $role, string $content): void
{
    $stmt = $pdo->prepare(
        "INSERT INTO Alphenex_chat_messages (session_id, role, message, created_at) 
         VALUES (:session_id, :role, :message, NOW())"
    );
    $stmt->execute([
        ':session_id' => $sessionId,
        ':role' => $role,
        ':message' => $content
    ]);
}

/**
 * Load recent chat history for context
 */
function loadChatHistory(PDO $pdo, int $sessionId): array
{
    $stmt = $pdo->prepare(
        "SELECT role, message FROM Alphenex_chat_messages 
         WHERE session_id = :session_id 
         ORDER BY created_at ASC 
         LIMIT :limit"
    );
    $stmt->bindValue(':session_id', $sessionId, PDO::PARAM_INT);
    $stmt->bindValue(':limit', RAGA_MAX_HISTORY_MESSAGES, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}

/**
 * Call AI API with automatic fallback
 * Primary: Google Gemini → Fallback: OpenAI GPT
 */
function callAI(string $systemPrompt, array $chatHistory, string $userMessage): string
{
    // Try Gemini first
    try {
        return callGeminiAPI($systemPrompt, $chatHistory, $userMessage);
    } catch (Exception $e) {
        // Log that Gemini failed and we're falling back
        logError('api_call', 'RagaChatbot.jsx', '/api/raga.php', null, 
            'GEMINI FAILED — switching to OpenAI fallback. Reason: ' . $e->getMessage());
        
        // Try OpenAI as fallback
        return callOpenAIAPI($systemPrompt, $chatHistory, $userMessage);
    }
}

/**
 * Call Google Gemini API
 */
function callGeminiAPI(string $systemPrompt, array $chatHistory, string $userMessage): string
{
    $apiKey = RAGA_API_KEY;
    $model = RAGA_MODEL;
    $url = RAGA_API_URL . $model . ':generateContent?key=' . $apiKey;

    $contents = [];
    foreach ($chatHistory as $msg) {
        $geminiRole = ($msg['role'] === 'assistant') ? 'model' : 'user';
        $contents[] = [
            'role' => $geminiRole,
            'parts' => [['text' => $msg['message']]]
        ];
    }
    $contents[] = [
        'role' => 'user',
        'parts' => [['text' => $userMessage]]
    ];

    $payload = [
        'system_instruction' => [
            'parts' => [['text' => $systemPrompt]]
        ],
        'contents' => $contents,
        'generationConfig' => [
            'temperature' => 0.7,
            'topP' => 0.9,
            'topK' => 40,
            'maxOutputTokens' => 512,
        ],
        'safetySettings' => [
            ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
            ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
            ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
            ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
        ]
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new Exception("Gemini cURL error: $curlError");
    }
    if ($httpCode !== 200) {
        throw new Exception("Gemini HTTP $httpCode: " . substr($response, 0, 500));
    }

    $data = json_decode($response, true);

    if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
        return trim($data['candidates'][0]['content']['parts'][0]['text']);
    }
    if (isset($data['candidates'][0]['finishReason']) && $data['candidates'][0]['finishReason'] === 'SAFETY') {
        return "I appreciate your question, but I'm only able to help with topics related to Alphenex's services and offerings. How can I assist you with your digital marketing needs?";
    }

    throw new Exception("Gemini returned empty response");
}

/**
 * Call OpenAI GPT API (Fallback)
 */
function callOpenAIAPI(string $systemPrompt, array $chatHistory, string $userMessage): string
{
    $apiKey = OPENAI_API_KEY;
    $model = OPENAI_MODEL;
    $url = OPENAI_API_URL;

    // Build messages array for OpenAI chat format
    $messages = [];
    
    // System prompt
    $messages[] = ['role' => 'system', 'content' => $systemPrompt];
    
    // Chat history
    foreach ($chatHistory as $msg) {
        $messages[] = [
            'role' => $msg['role'],  // 'user' or 'assistant' — same format OpenAI uses
            'content' => $msg['message']
        ];
    }
    
    // Current user message
    $messages[] = ['role' => 'user', 'content' => $userMessage];

    $payload = [
        'model' => $model,
        'messages' => $messages,
        'temperature' => 0.7,
        'max_tokens' => 512,
        'top_p' => 0.9,
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        logError('api_call', 'RagaChatbot.jsx', $url, null, "OpenAI cURL error: $curlError");
        throw new Exception("Both AI services unavailable. cURL: $curlError");
    }
    if ($httpCode !== 200) {
        logError('api_call', 'RagaChatbot.jsx', $url, $httpCode, "OpenAI error: " . substr($response, 0, 2000));
        throw new Exception("Both AI services failed. OpenAI HTTP $httpCode: " . substr($response, 0, 500));
    }

    $data = json_decode($response, true);

    if (isset($data['choices'][0]['message']['content'])) {
        return trim($data['choices'][0]['message']['content']);
    }

    throw new Exception("OpenAI returned empty response");
}

// ============================================================
// MAIN REQUEST HANDLER
// ============================================================

try {
    // Parse JSON body
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || !isset($data['message'])) {
        throw new Exception("Invalid request format");
    }

    // Sanitize and validate input
    $userMessage = trim($data['message'] ?? '');
    $sessionToken = trim($data['session_token'] ?? '');

    if (empty($userMessage)) {
        throw new Exception("Message cannot be empty");
    }

    // Enforce max input length
    if (mb_strlen($userMessage) > RAGA_MAX_INPUT_LENGTH) {
        $userMessage = mb_substr($userMessage, 0, RAGA_MAX_INPUT_LENGTH);
    }

    // Strip potential XSS/HTML from user input
    $userMessage = htmlspecialchars($userMessage, ENT_QUOTES | ENT_HTML5, 'UTF-8');

    // --- Rate Limiting Placeholder ---
    // TODO: Implement rate checking here when RAGA_RATE_LIMIT_ENABLED is true
    // Check Alphenex_chat_messages count for this session in last 60 seconds
    // if (RAGA_RATE_LIMIT_ENABLED) { ... }

    // Connect to database
    $pdo = getDB();

    // Resolve or create session
    $session = resolveSession($pdo, $sessionToken ?: null);
    $sessionId = (int)$session['id'];
    $activeToken = $session['session_token'];

    // Save user message to database
    saveMessage($pdo, $sessionId, 'user', $userMessage);

    // Load recent history for context
    $history = loadChatHistory($pdo, $sessionId);

    // Get system knowledge prompt
    $systemPrompt = getRagaSystemPrompt();

    // Call LLM securely (API key stays server-side)
    $aiReply = callAI($systemPrompt, $history, $userMessage);

    // Decode HTML entities back for storage and display
    $aiReply = html_entity_decode($aiReply, ENT_QUOTES | ENT_HTML5, 'UTF-8');

    // Save assistant reply to database
    saveMessage($pdo, $sessionId, 'assistant', $aiReply);

    // Return response — NEVER include API key, token, or internal details
    echo json_encode([
        "success" => true,
        "session_token" => $activeToken,
        "reply" => $aiReply,
    ]);

} catch (PDOException $e) {
    $errMsg = "DB Error: " . $e->getMessage();
    logError('backend', 'RagaChatbot.jsx', '/api/raga.php', 500, $errMsg);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $errMsg
    ]);
} catch (Throwable $e) {
    $errMsg = "Error [" . get_class($e) . "]: " . $e->getMessage() . " at line " . $e->getLine();
    logError('backend', 'RagaChatbot.jsx', '/api/raga.php', 500, $errMsg);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $errMsg
    ]);
}

?>
