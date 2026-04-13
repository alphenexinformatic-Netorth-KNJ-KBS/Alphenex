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
 * Find or generate a chat session context (identity is now just the token)
 */
function resolveSession(PDO $pdo, ?string $token): array
{
    // Identity is now purely token-based. No session table lookup needed.
    if ($token && strlen($token) === 64) {
        $activeToken = $token;
    } else {
        $activeToken = generateSessionToken();
    }

    // Fetch ALL inquiries registered by this user
    $stmt = $pdo->prepare("SELECT name, email, phone, inquiry AS details FROM Alphenex_Chat_Leads WHERE Session_token = :token ORDER BY id ASC");
    $stmt->execute([':token' => $activeToken]);
    $inquiries = $stmt->fetchAll();

    $userName = null;
    if (count($inquiries) > 0) {
        $userName = $inquiries[0]['name'] ?? null;
    }

    $sessionId = abs(crc32($activeToken)) % 100000000;

    return [
        'id' => $sessionId,
        'session_token' => $activeToken,
        'user_name' => $userName,
        'inquiries' => $inquiries
    ];
}

/**
 * Save a message to chat history — keyed by session_id and session_token
 */
function saveMessage(PDO $pdo, int $sessionId, string $sessionToken, string $role, string $content): void
{
    // Keeping both columns as requested
    $stmt = $pdo->prepare(
        "INSERT INTO Alphenex_chat_messages (session_id, session_token, role, message, created_at) 
         VALUES (:session_id, :token, :role, :message, NOW())"
    );
    $stmt->execute([
        ':session_id' => $sessionId,
        ':token' => $sessionToken,
        ':role' => $role,
        ':message' => $content
    ]);
}

/**
 * Load recent chat history for context — keyed by session_token
 */
function loadChatHistory(PDO $pdo, string $sessionToken): array
{
    $stmt = $pdo->prepare(
        "SELECT role, message FROM Alphenex_chat_messages 
         WHERE session_token = :token 
         ORDER BY created_at ASC 
         LIMIT :limit"
    );
    $stmt->bindValue(':token', $sessionToken, PDO::PARAM_STR);
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

    // Resolve or create session context
    $session = resolveSession($pdo, $sessionToken ?: null);
    $sessionId = $session['id'];
    $activeToken = $session['session_token'];
    $userName = $session['user_name'];

    // Check if this is the start of a returning session
    $msgCheck = $pdo->prepare("SELECT COUNT(*) FROM Alphenex_chat_messages WHERE session_token = :token");
    $msgCheck->execute([':token' => $activeToken]);
    $msgCount = (int)$msgCheck->fetchColumn();
    
    $isReturning = ($msgCount === 0 && !empty($userName));

    // --- NEW: SPECIAL GREETING HANDLER ---
    if (isset($data['is_greeting']) && $data['is_greeting'] === true) {
        $systemPrompt = getRagaSystemPrompt($userName, $isReturning, $session['inquiries']);
        // Virtual trigger to get the first greeting from AI
        $greetingReply = callAI($systemPrompt, [], "START_CONVERSATION");
        $greetingReply = html_entity_decode($greetingReply, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Parse and strip action triggers from greeting
        $showForm = false;
        if (str_contains($greetingReply, '[ACTION:SHOW_FORM]')) {
            $showForm = true;
            $greetingReply = trim(str_replace('[ACTION:SHOW_FORM]', '', $greetingReply));
        }
        
        echo json_encode([
            "success" => true,
            "session_token" => $activeToken,
            "session_id" => $sessionId,
            "reply" => $greetingReply,
            "is_returning" => $isReturning,
            "show_form" => $showForm
        ]);
        exit;
    }

    // Save user message to database
    saveMessage($pdo, $sessionId, $activeToken, 'user', $userMessage);

    // Load recent history AFTER saving the current message
    $history = loadChatHistory($pdo, $activeToken);

    // Get system knowledge prompt with returning user context
    $systemPrompt = getRagaSystemPrompt($userName, $isReturning, $session['inquiries']);

    // Call LLM securely (API key stays server-side)
    $aiReply = callAI($systemPrompt, $history, $userMessage);

    // Decode HTML entities back for storage and display
    $aiReply = html_entity_decode($aiReply, ENT_QUOTES | ENT_HTML5, 'UTF-8');

    // Parse action triggers
    $showForm = false;
    if (str_contains($aiReply, '[ACTION:SHOW_FORM]')) {
        $showForm = true;
        // Remove it from the text shown to the user
        $aiReply = trim(str_replace('[ACTION:SHOW_FORM]', '', $aiReply));
    }

    // Save assistant reply to database
    saveMessage($pdo, $sessionId, $activeToken, 'assistant', $aiReply);

    // Return response — NEVER include API key, token, or internal details
    echo json_encode([
        "success" => true,
        "session_token" => $activeToken,
        "reply" => $aiReply,
        "show_form" => $showForm
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
