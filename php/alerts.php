<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3001');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    require __DIR__ . '/db.php';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $farmerId = (int) ($_GET['farmerId'] ?? 0);
        if ($farmerId <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Farmer ID is required.']);
            exit;
        }

        $statement = $pdo->prepare(
            'SELECT a.id, a.title, a.body, a.type, a.created_at,
                    CASE WHEN ar.alert_id IS NULL THEN 0 ELSE 1 END AS is_read
             FROM alerts a
             LEFT JOIN alert_reads ar ON ar.alert_id = a.id AND ar.farmer_id = :read_farmer_id
             WHERE a.farmer_id IS NULL OR a.farmer_id = :farmer_id
             ORDER BY a.created_at DESC'
        );
        $statement->execute(['read_farmer_id' => $farmerId, 'farmer_id' => $farmerId]);
        $alerts = array_map(static function (array $row): array {
            return [
                'id' => (string) $row['id'],
                'title' => $row['title'],
                'body' => $row['body'],
                'type' => $row['type'],
                'read' => (bool) $row['is_read'],
                'createdAt' => $row['created_at'],
            ];
        }, $statement->fetchAll());
        echo json_encode(['alerts' => $alerts]);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $action = (string) ($input['action'] ?? 'create');

    if ($action === 'create') {
        $title = trim((string) ($input['title'] ?? ''));
        $body = trim((string) ($input['body'] ?? ''));
        $type = (string) ($input['type'] ?? 'system');
        $targetFarmerId = (int) ($input['farmerId'] ?? 0);
        $allowedTypes = ['slot', 'center', 'payment', 'delay', 'system'];

        if ($title === '' || $body === '' || !in_array($type, $allowedTypes, true)) {
            http_response_code(422);
            echo json_encode(['error' => 'Title, message, and a valid alert type are required.']);
            exit;
        }

        if ($targetFarmerId > 0) {
            $farmer = $pdo->prepare('SELECT id FROM farmers WHERE id = :id LIMIT 1');
            $farmer->execute(['id' => $targetFarmerId]);
            if (!$farmer->fetch()) {
                http_response_code(422);
                echo json_encode(['error' => 'Target farmer was not found.']);
                exit;
            }
        }

        $statement = $pdo->prepare(
            'INSERT INTO alerts (title, body, type, farmer_id) VALUES (:title, :body, :type, :farmer_id)'
        );
        $statement->execute([
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'farmer_id' => $targetFarmerId > 0 ? $targetFarmerId : null,
        ]);
        echo json_encode(['id' => (string) $pdo->lastInsertId()]);
        exit;
    }

    $alertId = (int) ($input['alertId'] ?? 0);
    $farmerId = (int) ($input['farmerId'] ?? 0);
    if ($farmerId <= 0 || ($action !== 'mark_all_read' && $alertId <= 0)) {
        http_response_code(422);
        echo json_encode(['error' => 'Alert and farmer IDs are required.']);
        exit;
    }

    if ($action === 'mark_all_read') {
        $statement = $pdo->prepare(
            'INSERT IGNORE INTO alert_reads (alert_id, farmer_id)
             SELECT id, :farmer_id FROM alerts WHERE farmer_id IS NULL OR farmer_id = :same_farmer_id'
        );
        $statement->execute(['farmer_id' => $farmerId, 'same_farmer_id' => $farmerId]);
    } else {
        $statement = $pdo->prepare(
            'INSERT INTO alert_reads (alert_id, farmer_id) VALUES (:alert_id, :farmer_id)
             ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP'
        );
        $statement->execute(['alert_id' => $alertId, 'farmer_id' => $farmerId]);
    }

    echo json_encode(['success' => true]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
