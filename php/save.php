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
    $farmerId = trim((string) ($input['farmerId'] ?? ''));
    $crop = trim((string) ($input['crop'] ?? ''));
    $quantityKg = (float) ($input['quantityKg'] ?? 0);
    $centerId = trim((string) ($input['centerId'] ?? ''));
    $date = trim((string) ($input['date'] ?? ''));
    $time = trim((string) ($input['time'] ?? ''));
    $slotId = trim((string) ($input['slotId'] ?? ''));
    $expectedWaitMin = (int) ($input['expectedWaitMin'] ?? 0);

    if ($farmerId === '' || $crop === '' || $quantityKg <= 0 || $centerId === '' || $date === '' || $time === '' || $slotId === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Complete all booking details.']);
        exit;
    }

    $slotStatement = $pdo->prepare('SELECT center_id, date, start_time FROM time_slots WHERE id = :id LIMIT 1');
    $slotStatement->execute(['id' => $slotId]);
    $slot = $slotStatement->fetch();
    if (!$slot) {
        http_response_code(422);
        echo json_encode(['error' => 'Selected slot was not found.']);
        exit;
    }

    do {
        $bookingId = 'FF-' . date('Y') . '-' . str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
        $existing = $pdo->prepare('SELECT id FROM bookings WHERE id = :id LIMIT 1');
        $existing->execute(['id' => $bookingId]);
    } while ($existing->fetch());

    $statement = $pdo->prepare(
        'INSERT INTO bookings (id, farmer_id, crop, quantity_kg, center_id, date, time, slot_id, status, expected_wait_min)
         VALUES (:id, :farmer_id, :crop, :quantity_kg, :center_id, :date, :time, :slot_id, :status, :expected_wait_min)'
    );
    $statement->execute([
        'id' => $bookingId,
        'farmer_id' => $farmerId,
        'crop' => $crop,
        'quantity_kg' => $quantityKg,
        'center_id' => $slot['center_id'],
        'date' => $slot['date'],
        'time' => $slot['start_time'],
        'slot_id' => $slotId,
        'status' => 'Confirmed',
        'expected_wait_min' => $expectedWaitMin,
    ]);

    echo json_encode([
        'booking' => [
            'id' => $bookingId,
            'farmerId' => $farmerId,
            'crop' => $crop,
            'quantityKg' => $quantityKg,
            'centerId' => $centerId,
            'date' => $date,
            'time' => $time,
            'slotId' => $slotId,
            'status' => 'Confirmed',
            'expectedWaitMin' => $expectedWaitMin,
        ],
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
