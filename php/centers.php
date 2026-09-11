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

function formatCenter(array $row): array
{
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'location' => $row['location'],
        'village' => $row['village'],
        'latitude' => $row['latitude'] !== null ? (float) $row['latitude'] : null,
        'longitude' => $row['longitude'] !== null ? (float) $row['longitude'] : null,
        'distanceKm' => (float) $row['distance_km'],
        'dailyCapacity' => (int) $row['daily_capacity'],
        'bookedToday' => (int) $row['booked_today'],
        'currentQueue' => (int) $row['current_queue'],
        'countersOpen' => (int) $row['counters_open'],
        'countersTotal' => (int) $row['counters_total'],
        'expectedWaitMin' => (int) $row['expected_wait_min'],
        'processingRatePerHour' => (int) $row['processing_rate_per_hour'],
        'avgWaitMin' => (int) $row['avg_wait_min'],
        'paymentReliability' => (float) $row['payment_reliability'],
        'reliabilityScore' => (float) $row['reliability_score'],
        'onTimePayment' => (float) $row['on_time_payment'],
        'grievanceResolution' => (float) $row['grievance_resolution'],
        'status' => $row['status'],
        'congestion' => $row['congestion'],
    ];
}

try {
    require __DIR__ . '/db.php';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $pdo->query('SELECT * FROM centers ORDER BY id');
        echo json_encode(['centers' => array_map('formatCenter', $statement->fetchAll())]);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $id = trim((string) ($input['id'] ?? ''));
    $name = trim((string) ($input['name'] ?? ''));
    $location = trim((string) ($input['location'] ?? ''));

    if ($id === '' || $name === '' || $location === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Center ID, name, and location are required.']);
        exit;
    }

    $statement = $pdo->prepare('UPDATE centers SET name = :name, location = :location WHERE id = :id');
    $statement->execute(['id' => $id, 'name' => $name, 'location' => $location]);

    $updated = $pdo->prepare('SELECT * FROM centers WHERE id = :id');
    $updated->execute(['id' => $id]);
    $center = $updated->fetch();
    if (!$center) {
        http_response_code(404);
        echo json_encode(['error' => 'Center was not found.']);
        exit;
    }

    echo json_encode(['center' => formatCenter($center)]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
