<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3001');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    require __DIR__ . '/db.php';

    $input = json_decode(file_get_contents('php://input'), true);
    $farmerId = (int) ($input['farmerId'] ?? 0);
    $procurementId = trim((string) ($input['procurementId'] ?? ''));
    $category = trim((string) ($input['category'] ?? ''));
    $description = trim((string) ($input['description'] ?? ''));

    $categories = ['Payment Delay', 'Incorrect Grading', 'Slot Problem', 'Center Problem', 'Other'];
    if ($farmerId <= 0 || !in_array($category, $categories, true) || $description === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Complete the grievance details.']);
        exit;
    }

    $farmerStatement = $pdo->prepare('SELECT id FROM farmers WHERE id = :id LIMIT 1');
    $farmerStatement->execute(['id' => $farmerId]);
    if (!$farmerStatement->fetch()) {
        http_response_code(422);
        echo json_encode(['error' => 'Farmer account was not found.']);
        exit;
    }

    if ($procurementId !== '') {
        $procurementStatement = $pdo->prepare('SELECT id FROM procurements WHERE id = :id LIMIT 1');
        $procurementStatement->execute(['id' => $procurementId]);
        if (!$procurementStatement->fetch()) {
            $procurementId = '';
        }
    }

    do {
        $grievanceId = 'GRV-' . date('Y') . '-' . str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);
        $existing = $pdo->prepare('SELECT id FROM grievances WHERE id = :id LIMIT 1');
        $existing->execute(['id' => $grievanceId]);
    } while ($existing->fetch());

    $statement = $pdo->prepare(
        'INSERT INTO grievances (id, farmer_id, procurement_id, category, description, status, priority)
         VALUES (:id, :farmer_id, :procurement_id, :category, :description, :status, :priority)'
    );
    $statement->execute([
        'id' => $grievanceId,
        'farmer_id' => $farmerId,
        'procurement_id' => $procurementId !== '' ? $procurementId : null,
        'category' => $category,
        'description' => $description,
        'status' => 'Open',
        'priority' => $category === 'Payment Delay' ? 'High' : 'Medium',
    ]);

    echo json_encode([
        'grievance' => [
            'id' => $grievanceId,
            'farmerId' => $farmerId,
            'procurementId' => $procurementId !== '' ? $procurementId : null,
            'category' => $category,
            'description' => $description,
            'status' => 'Open',
        ],
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
