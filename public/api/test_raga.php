<?php
/**
 * TEMPORARY DIAGNOSTIC — DELETE AFTER USE
 * Visit: https://alphenex.com/api/test_raga.php
 */
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/raga_config.php';

global $db_host, $db_name, $db_user, $db_pass;
$pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);

$results = [];

// Show column names for each table
$tables = ['Alphenex_chat_messages', 'Alphenex_Chat_Leads'];
foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $colNames = array_map(function($c) { return $c['Field'] . ' (' . $c['Type'] . ')'; }, $columns);
        $results[$table] = $colNames;
    } catch (Throwable $e) {
        $results[$table] = 'ERROR: ' . $e->getMessage();
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
