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
    $bookingId = trim((string) ($input['bookingId'] ?? ''));
    $crop = trim((string) ($input['crop'] ?? ''));
    $quantityKg = (float) ($input['quantityKg'] ?? 0);
    $acceptedQuantityKg = (float) ($input['acceptedQuantityKg'] ?? $quantityKg);
    $centerId = trim((string) ($input['centerId'] ?? ''));
    $date = trim((string) ($input['date'] ?? ''));
    $time = trim((string) ($input['time'] ?? ''));
    $lotId = trim((string) ($input['lotId'] ?? ''));
    $grade = trim((string) ($input['grade'] ?? 'B'));
    $moisture = (float) ($input['moisture'] ?? 0);
    $foreignMaterial = (float) ($input['foreignMaterial'] ?? 0);
    $damaged = (float) ($input['damaged'] ?? 0);
    $gradeReason = trim((string) ($input['gradeReason'] ?? ''));

    $allowedCrops = ['Wheat', 'Cotton', 'Rice', 'Groundnut', 'Mustard', 'Other'];
    if ($farmerId <= 0 || !in_array($crop, $allowedCrops, true) || $quantityKg <= 0 || $acceptedQuantityKg < 0 || $acceptedQuantityKg > $quantityKg || $centerId === '' || $date === '' || $time === '' || $lotId === '' || !in_array($grade, ['A', 'B', 'C'], true) || $gradeReason === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Complete all procurement and grading details.']);
        exit;
    }

    $farmer = $pdo->prepare('SELECT id FROM farmers WHERE id = :id LIMIT 1');
    $farmer->execute(['id' => $farmerId]);
    $center = $pdo->prepare('SELECT id FROM centers WHERE id = :id LIMIT 1');
    $center->execute(['id' => $centerId]);
    if (!$farmer->fetch() || !$center->fetch()) {
        http_response_code(422);
        echo json_encode(['error' => 'Farmer or procurement center was not found.']);
        exit;
    }

    $priceStatement = $pdo->prepare('SELECT government_price_per_kg FROM market_prices WHERE crop = :crop LIMIT 1');
    $priceStatement->execute(['crop' => $crop]);
    $pricePerKg = (float) $priceStatement->fetchColumn();
    if ($pricePerKg <= 0) {
        http_response_code(422);
        echo json_encode(['error' => 'No government price is configured for this crop.']);
        exit;
    }

    $qualityDeduction = min(80, max(0, ($damaged * 2) + $foreignMaterial + max(0, $moisture - 12) * 1.5 + ($grade === 'C' ? 15 : ($grade === 'B' ? 5 : 0))));
    $estimatedAmount = round($acceptedQuantityKg * $pricePerKg * (1 - ($qualityDeduction / 100)), 2);
    $creditDelta = (int) round((($acceptedQuantityKg / $quantityKg) * 20) - ($qualityDeduction / 4));
    $creditStatement = $pdo->prepare('UPDATE farmers SET credit_score = LEAST(900, GREATEST(300, credit_score + :delta)) WHERE id = :id');

    $procurementId = 'FF-P-' . date('Y') . '-' . str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);
    $pdo->beginTransaction();

    $statement = $pdo->prepare(
        'INSERT INTO procurements (id, farmer_id, booking_id, crop, quantity_kg, accepted_quantity_kg, price_per_kg, center_id, date, time, lot_id, grade, moisture, foreign_material, damaged, quality_deduction_percent, grade_reason, estimated_amount, status)
         VALUES (:id, :farmer_id, :booking_id, :crop, :quantity_kg, :accepted_quantity_kg, :price_per_kg, :center_id, :date, :time, :lot_id, :grade, :moisture, :foreign_material, :damaged, :quality_deduction_percent, :grade_reason, :estimated_amount, \'Received\')'
    );
    $statement->execute([
        'id' => $procurementId,
        'farmer_id' => $farmerId,
        'booking_id' => $bookingId !== '' ? $bookingId : null,
        'crop' => $crop,
        'quantity_kg' => $quantityKg,
        'accepted_quantity_kg' => $acceptedQuantityKg,
        'price_per_kg' => $pricePerKg,
        'center_id' => $centerId,
        'date' => $date,
        'time' => $time,
        'lot_id' => $lotId,
        'grade' => $grade,
        'moisture' => $moisture,
        'foreign_material' => $foreignMaterial,
        'damaged' => $damaged,
        'quality_deduction_percent' => $qualityDeduction,
        'grade_reason' => $gradeReason,
        'estimated_amount' => $estimatedAmount,
    ]);
    $creditStatement->execute(['delta' => $creditDelta, 'id' => $farmerId]);

    $events = [
        ['received', 'Produce Received', 1, 1],
        ['graded', 'Quality Grading', 0, 0],
        ['approved', 'Accepted', 0, 0],
        ['processing', 'Payment Processing', 0, 0],
        ['paid', 'Paid', 0, 0],
    ];
    $eventStatement = $pdo->prepare(
        'INSERT INTO procurement_events (procurement_id, event_key, label, done, current_flag) VALUES (:procurement_id, :event_key, :label, :done, :current_flag)'
    );
    foreach ($events as [$eventKey, $label, $done, $current]) {
        $eventStatement->execute([
            'procurement_id' => $procurementId,
            'event_key' => $eventKey,
            'label' => $label,
            'done' => $done,
            'current_flag' => $current,
        ]);
    }

    $pdo->commit();
    echo json_encode(['id' => $procurementId, 'status' => 'Received', 'pricePerKg' => $pricePerKg, 'qualityDeductionPercent' => $qualityDeduction, 'estimatedAmount' => $estimatedAmount]);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
