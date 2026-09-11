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

$flow = ['Received', 'Graded', 'Approved', 'Payment Pending', 'Paid'];
$eventKeys = ['received', 'graded', 'approved', 'processing', 'paid'];

try {
    require __DIR__ . '/db.php';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $farmerId = (int) ($_GET['farmerId'] ?? 0);
        if ($farmerId > 0) {
            $statement = $pdo->prepare('SELECT * FROM procurements WHERE farmer_id = :farmer_id ORDER BY date DESC, time DESC');
            $statement->execute(['farmer_id' => $farmerId]);
        } else {
            $statement = $pdo->query('SELECT * FROM procurements ORDER BY date DESC, time DESC');
        }

        $items = [];
        foreach ($statement->fetchAll() as $row) {
            $events = $pdo->prepare('SELECT event_key, label, event_at, expected_at, done, current_flag FROM procurement_events WHERE procurement_id = :id ORDER BY id');
            $events->execute(['id' => $row['id']]);
            $timeline = [];
            foreach ($events->fetchAll() as $event) {
                $timeline[] = [
                    'key' => $event['event_key'],
                    'label' => $event['label'],
                    'at' => $event['event_at'] ? date('d M, h:i A', strtotime($event['event_at'])) : null,
                    'expected' => $event['expected_at'] ? date('d M, h:i A', strtotime($event['expected_at'])) : null,
                    'done' => (bool) $event['done'],
                    'current' => (bool) $event['current_flag'],
                ];
            }
            $items[] = [
                'id' => $row['id'],
                'farmerId' => (string) $row['farmer_id'],
                'bookingId' => $row['booking_id'],
                'crop' => $row['crop'],
                'quantityKg' => (float) $row['quantity_kg'],
                'acceptedQuantityKg' => (float) $row['accepted_quantity_kg'],
                'pricePerKg' => (float) $row['price_per_kg'],
                'qualityDeductionPercent' => (float) $row['quality_deduction_percent'],
                'estimatedAmount' => (float) $row['estimated_amount'],
                'centerId' => $row['center_id'],
                'date' => $row['date'],
                'time' => substr((string) $row['time'], 0, 5),
                'lotId' => $row['lot_id'],
                'grade' => $row['grade'],
                'moisture' => (float) $row['moisture'],
                'foreignMaterial' => (float) $row['foreign_material'],
                'damaged' => (float) $row['damaged'],
                'gradeReason' => $row['grade_reason'],
                'status' => $row['status'],
                'timeline' => $timeline,
            ];
        }
        echo json_encode(['procurements' => $items]);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $id = trim((string) ($input['id'] ?? ''));
    $status = (string) ($input['status'] ?? '');
    $statusIndex = array_search($status, $flow, true);
    if ($id === '' || $statusIndex === false) {
        http_response_code(422);
        echo json_encode(['error' => 'Procurement ID and valid status are required.']);
        exit;
    }

    $pdo->beginTransaction();
    $update = $pdo->prepare('UPDATE procurements SET status = :status WHERE id = :id');
    $update->execute(['status' => $status, 'id' => $id]);

    $events = $pdo->prepare('SELECT id, event_key FROM procurement_events WHERE procurement_id = :id ORDER BY id');
    $events->execute(['id' => $id]);
    foreach ($events->fetchAll() as $index => $event) {
        $eventStatusIndex = min($index, count($flow) - 1);
        $eventUpdate = $pdo->prepare('UPDATE procurement_events SET done = :done, current_flag = :current_flag, event_at = CASE WHEN :done_value = 1 AND event_at IS NULL THEN NOW() ELSE event_at END WHERE id = :id');
        $done = $eventStatusIndex <= $statusIndex ? 1 : 0;
        $current = $eventStatusIndex === $statusIndex ? 1 : 0;
        $eventUpdate->execute(['done' => $done, 'done_value' => $done, 'current_flag' => $current, 'id' => $event['id']]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'status' => $status]);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
