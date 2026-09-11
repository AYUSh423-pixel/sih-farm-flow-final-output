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

function formatBooking(array $row): array
{
    return [
        'id' => $row['id'],
        'farmerId' => (string) $row['farmer_id'],
        'crop' => $row['crop'],
        'quantityKg' => (float) $row['quantity_kg'],
        'centerId' => $row['center_id'],
        'date' => $row['date'],
        'time' => substr((string) $row['time'], 0, 5),
        'slotId' => $row['slot_id'],
        'status' => $row['status'],
        'expectedWaitMin' => (int) $row['expected_wait_min'],
    ];
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

        $statement = $pdo->prepare('SELECT id, farmer_id, crop, quantity_kg, center_id, date, time, slot_id, status, expected_wait_min FROM bookings WHERE farmer_id = :farmer_id ORDER BY date DESC, time DESC');
        $statement->execute(['farmer_id' => $farmerId]);
        echo json_encode(['bookings' => array_map('formatBooking', $statement->fetchAll())]);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $bookingId = trim((string) ($input['id'] ?? ''));
    $farmerId = (int) ($input['farmerId'] ?? 0);
    $action = (string) ($input['action'] ?? '');

    if ($bookingId === '' || $farmerId <= 0 || !in_array($action, ['cancel', 'reschedule'], true)) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid booking update.']);
        exit;
    }

    $pdo->beginTransaction();
    $currentStatement = $pdo->prepare('SELECT * FROM bookings WHERE id = :id AND farmer_id = :farmer_id FOR UPDATE');
    $currentStatement->execute(['id' => $bookingId, 'farmer_id' => $farmerId]);
    $current = $currentStatement->fetch();

    if (!$current) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Booking was not found.']);
        exit;
    }

    if ($action === 'cancel') {
        if ($current['status'] !== 'Cancelled') {
            $slot = $pdo->prepare('UPDATE time_slots SET booked = GREATEST(booked - 1, 0), state = CASE WHEN booked - 1 >= capacity THEN "FULL" WHEN booked - 1 >= capacity * 0.8 THEN "LIMITED" ELSE "AVAILABLE" END WHERE id = :id');
            $slot->execute(['id' => $current['slot_id']]);
        }
        $update = $pdo->prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = :id AND farmer_id = :farmer_id");
        $update->execute(['id' => $bookingId, 'farmer_id' => $farmerId]);
    } else {
        $slotId = trim((string) ($input['slotId'] ?? ''));
        if ($slotId === '') {
            $pdo->rollBack();
            http_response_code(422);
            echo json_encode(['error' => 'A new slot is required.']);
            exit;
        }

        $newSlotStatement = $pdo->prepare('SELECT * FROM time_slots WHERE id = :id FOR UPDATE');
        $newSlotStatement->execute(['id' => $slotId]);
        $newSlot = $newSlotStatement->fetch();
        if (!$newSlot || $newSlot['state'] === 'FULL' || $newSlot['state'] === 'CLOSED') {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(['error' => 'That slot is no longer available.']);
            exit;
        }

        $oldSlotUpdate = $pdo->prepare('UPDATE time_slots SET booked = GREATEST(booked - 1, 0), state = CASE WHEN booked - 1 >= capacity THEN "FULL" WHEN booked - 1 >= capacity * 0.8 THEN "LIMITED" ELSE "AVAILABLE" END WHERE id = :id AND id <> :new_id');
        $oldSlotUpdate->execute(['id' => $current['slot_id'], 'new_id' => $slotId]);
        $newSlotUpdate = $pdo->prepare('UPDATE time_slots SET booked = booked + 1, state = CASE WHEN booked + 1 >= capacity THEN "FULL" WHEN booked + 1 >= capacity * 0.8 THEN "LIMITED" ELSE "AVAILABLE" END WHERE id = :id');
        $newSlotUpdate->execute(['id' => $slotId]);

        $update = $pdo->prepare("UPDATE bookings SET slot_id = :slot_id, date = :date, time = :time, center_id = :center_id, status = 'Rescheduled' WHERE id = :id AND farmer_id = :farmer_id");
        $update->execute([
            'slot_id' => $slotId,
            'date' => $newSlot['date'],
            'time' => $newSlot['start_time'],
            'center_id' => $newSlot['center_id'],
            'id' => $bookingId,
            'farmer_id' => $farmerId,
        ]);
    }

    $pdo->commit();
    $updatedStatement = $pdo->prepare('SELECT * FROM bookings WHERE id = :id');
    $updatedStatement->execute(['id' => $bookingId]);
    echo json_encode(['booking' => formatBooking($updatedStatement->fetch())]);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
