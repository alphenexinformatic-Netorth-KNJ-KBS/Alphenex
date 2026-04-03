<?php
/**
 * ============================================================
 * RAGA CHATBOT — LEAD STAGING & AUTO-SAVE SYSTEM
 * ============================================================
 * 
 * This system implements a temporary JSON staging layer before
 * leads are committed to the MySQL database.
 * ============================================================
 */

require_once __DIR__ . '/raga_config.php';
require_once __DIR__ . '/log_error.php'; // Integrated centralized error tracker

// Recommended path for temporary staging
const STAGING_DIR = __DIR__ . '/tmp';
const STAGING_FILE = STAGING_DIR . '/raga_leads_staging.json';

/**
 * Load the staging file safely with Error Handling
 */
function loadStagingFile() {
    try {
        if (!is_dir(STAGING_DIR)) {
            if (!mkdir(STAGING_DIR, 0755, true)) {
                logError('backend', 'raga_lead_staging.php', 'mkdir', 500, "Failed to create staging directory: " . STAGING_DIR);
            }
            file_put_contents(STAGING_DIR . '/.htaccess', "Deny from all\n");
        }

        if (!file_exists(STAGING_FILE)) {
            return [];
        }

        $content = file_get_contents(STAGING_FILE);
        if ($content === false) {
             logError('backend', 'raga_lead_staging.php', 'file_get_contents', 500, "Could not read staging file: " . STAGING_FILE);
             return [];
        }
        
        if (empty($content)) {
            return [];
        }

        $data = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            logError('backend', 'raga_lead_staging.php', 'json_decode', 500, "Malformed JSON in staging file: " . json_last_error_msg());
            return [];
        }
        
        return is_array($data) ? $data : [];
        
    } catch (Throwable $e) {
        logError('backend', 'raga_lead_staging.php', 'loadStagingFile', 500, "Critical catch: " . $e->getMessage());
        return [];
    }
}

/**
 * Save data to the staging file with exclusive lock and Error Handling
 */
function saveStagingFile($data) {
    try {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            logError('backend', 'raga_lead_staging.php', 'json_encode', 500, "JSON Encode failed: " . json_last_error_msg());
            return false;
        }
        
        $result = file_put_contents(STAGING_FILE, $json, LOCK_EX);
        if ($result === false) {
            logError('backend', 'raga_lead_staging.php', 'file_put_contents', 500, "Failed to write to staging file (Check permissions)");
        }
        return $result;
        
    } catch (Throwable $e) {
        logError('backend', 'raga_lead_staging.php', 'saveStagingFile', 500, "Critical save catch: " . $e->getMessage());
        return false;
    }
}

/**
 * Merge logic: keep existing if new is empty
 */
function mergeLeadData($existing, $new) {
    if (!$existing) {
        $existing = [
            'session_token' => null,
            'name' => '',
            'email' => '',
            'phone' => '',
            'inquiry' => '',
            'source' => 'raga_chatbot',
            'created_at' => date('Y-m-d H:i:s'),
            'db_saved' => false
        ];
    }

    foreach ($new as $key => $val) {
        $trimmedVal = trim($val);
        if (!empty($trimmedVal)) {
            $existing[$key] = $trimmedVal;
        }
    }

    return $existing;
}

/**
 * Generic function to validate phone number length based on country code.
 * Supports +Code-Number format.
 */
function isValidPhoneLength($phone) {
    if (empty($phone)) return false;
    
    // 1. Clean number (digits only for length check)
    $pureDigits = preg_replace('/\D/', '', $phone);
    $originalPhone = trim($phone);

    $countries = include __DIR__ . '/raga_countries.php';
    
    // Sort countries by code length descending to match longest code first (e.g. +1 587 vs +1)
    usort($countries, function($a, $b) {
        return strlen($b['code']) <=> strlen($a['code']);
    });

    foreach ($countries as $c) {
        $code = $c['code']; // e.g. "+91"
        $codeDigits = preg_replace('/\D/', '', $code); // e.g. "91"
        
        // Check if phone starts with this code (either with + or just digits)
        if (strpos($originalPhone, $code) === 0 || strpos($pureDigits, $codeDigits) === 0) {
            $expected = $c['phoneLength'] ?? 10;
            
            // If it matched via digits, strip the code digits
            if (strpos($pureDigits, $codeDigits) === 0) {
                $remLen = strlen(substr($pureDigits, strlen($codeDigits)));
                if ($remLen === $expected) return true;
                // If not exact match, continue searching codes (might be a different one)
            } else {
                // Matched via string (e.g. "+91-")
                if (strlen($pureDigits) === $expected) return true;
                // Or maybe pureDigits already has code stripped?
                // Actually, let's just use the 'remLen' logic for both
                $remLen = strlen(substr($pureDigits, strlen($codeDigits)));
                if ($remLen === $expected) return true;
            }
        }
    }

    // Default fallback: If no country match or no code provided, check generic length
    $len = strlen($pureDigits);
    return ($len >= 7 && $len <= 15);
}

/**
 * Business Rule: is lead ready for DB?
 * name + inquiry + (email OR valid phone)
 */
function isLeadComplete($lead) {
    // We allow saving EVEN WITHOUT A NAME for progressive AI leads 
    // (Website form still requires name, but chat is more fluid)
    $hasInquiry = !empty(trim($lead['inquiry'] ?? ''));
    
    // Check Email
    $email = trim($lead['email'] ?? '');
    $hasEmail = !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL);
    
    // Check Phone (with strict length validation)
    $phone = trim($lead['phone'] ?? '');
    $hasPhone = !empty($phone) && isValidPhoneLength($phone);
    
    // Must have Inquiry + (Email OR Phone)
    return $hasInquiry && ($hasEmail || $hasPhone);
}

/**
 * Check if token already has a lead in DB to prevent duplicates
 */
function isAlreadyInDatabase($pdo, $sessionToken) {
    $stmt = $pdo->prepare("SELECT id FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
    $stmt->execute([':token' => $sessionToken]);
    return (bool)$stmt->fetch();
}

/**
 * Perform the final MySQL insertion with Centrailzed Error Handling
 */
function insertLeadIntoDatabase($lead) {
    try {
        global $db_host, $db_name, $db_user, $db_pass;
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        // Get session_id (consistent with raga.php)
        $sessionToken = $lead['session_token'];
        $findSid = $pdo->prepare("SELECT session_id FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
        $findSid->execute([':token' => $sessionToken]);
        $existingSid = $findSid->fetchColumn();
        $sessionId = $existingSid ? (int)$existingSid : (abs(crc32($sessionToken)) % 100000000);

        $csid = $lead['child_session_id'] ?? null;

        if ($csid) {
            // ALWAYS INSERT for a child session
            $sql = "INSERT INTO Alphenex_Chat_Leads (session_id, Session_token, child_session_id, name, email, phone, inquiry, source, Company_name, Service_Interest) 
                    VALUES (:sid, :stoken, :csid, :name, :email, :phone, :inquiry, :source, :company, :service)";
            $stmt = $pdo->prepare($sql);
            return $stmt->execute([
                ':sid'      => $sessionId,
                ':stoken'   => $sessionToken,
                ':csid'     => $csid,
                ':name'     => $lead['name'] ?? '',
                ':email'    => $lead['email'] ?? '',
                ':phone'    => $lead['phone'] ?? '',
                ':company'  => $lead['company'] ?? '',
                ':service'  => $lead['service'] ?? '',
                ':inquiry'  => $lead['inquiry'] ?? '',
                ':source'   => 'raga_chatbot'
            ]);
        } else {
            // Parent Logic: ONLY INSERT if it doesn't exist yet. 
            // Inquiries are "Full and Final", NO updates allowed via staging.
            $find = $pdo->prepare("SELECT id FROM Alphenex_Chat_Leads WHERE Session_token = :token AND child_session_id IS NULL LIMIT 1");
            $find->execute([':token' => $sessionToken]);
            $existingId = $find->fetchColumn();

            if ($existingId) {
                // If it already exists, we skip the DB save but mark it as successfully handled in staging
                return true; 
            } else {
                // INSERT new parent lead
                $stmt = $pdo->prepare(
                    "INSERT INTO Alphenex_Chat_Leads (session_id, Session_token, name, email, phone, Company_name, Service_Interest, inquiry, source) 
                     VALUES (:sid, :stoken, :name, :email, :phone, :company, :service, :inquiry, :source)"
                );
                return $stmt->execute([
                    ':sid'     => $sessionId,
                    ':stoken'  => $sessionToken,
                    ':name'    => $lead['name'],
                    ':email'   => $lead['email'],
                    ':phone'    => $lead['phone'],
                    ':company' => $lead['company'],
                    ':service' => $lead['service'],
                    ':inquiry' => $lead['inquiry'],
                    ':source' => $lead['source'] ?? 'raga_chatbot'
                ]);
            }
        }
        
    } catch (Throwable $e) {
        // REPORT TO THE CENTRALIZED LOG TABLE
        logError('backend', 'raga_lead_staging.php', 'MySQL_Insert', 500, "Lead Auto-Save Failed: " . $e->getMessage(), json_encode($lead));
        return false;
    }
}

/**
 * Clear existing staging for a session (used for new_inquiry)
 */
function resetSessionStaging($sessionToken) {
    $leads = loadStagingFile();
    if (isset($leads[$sessionToken])) {
        unset($leads[$sessionToken]);
        saveStagingFile($leads);
    }
}

/**
 * Main processor: Hook into every user message
 */
function processStagedLead($sessionToken, $newData) {
    try {
        // Handle "new_inquiry" action to reset and set child_session_id
        if (isset($newData['action']) && $newData['action'] === 'new_inquiry') {
            resetSessionStaging($sessionToken);
            $newData['child_session_id'] = 'raga_child_' . time();
            unset($newData['action']);
        }

        $leads = loadStagingFile();
        
        $existing = $leads[$sessionToken] ?? null;
        $updated = mergeLeadData($existing, $newData);
        $updated['session_token'] = $sessionToken;

        if (!$updated['db_saved'] && isLeadComplete($updated)) {
            if (insertLeadIntoDatabase($updated)) {
                $updated['db_saved'] = true;
            }
        }

        $leads[$sessionToken] = $updated;
        saveStagingFile($leads);
        
        return $updated;
    } catch (Throwable $e) {
        logError('backend', 'raga_lead_staging.php', 'processStagedLead', 500, "Logic failure: " . $e->getMessage());
        return null;
    }
}
?>
