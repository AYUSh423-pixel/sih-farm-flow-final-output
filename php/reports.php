<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3001');

try {
    require __DIR__ . '/db.php';

    $range = (int) ($_GET['range'] ?? 7);
    if (!in_array($range, [1, 7, 30], true)) {
        $range = 7;
    }
    $days = max(0, $range - 1);

    $waiting = $pdo->query("SELECT REPLACE(name, ' Procurement Center', '') AS center, avg_wait_min AS wait FROM centers ORDER BY id")->fetchAll();
    $utilization = $pdo->query("SELECT REPLACE(name, ' Procurement Center', '') AS name, ROUND((booked_today / NULLIF(daily_capacity, 0)) * 100) AS util FROM centers ORDER BY id")->fetchAll();

    $volumeStatement = $pdo->prepare("SELECT DATE_FORMAT(date, '%d %b') AS day, COUNT(*) AS volume FROM procurements WHERE date >= DATE_SUB(CURDATE(), INTERVAL :days DAY) GROUP BY date ORDER BY date");
    $volumeStatement->execute(['days' => $days]);
    $volume = $volumeStatement->fetchAll();

    $bookingStatement = $pdo->prepare("SELECT DATE_FORMAT(date, '%d %b') AS day, COUNT(*) AS bookings FROM bookings WHERE date >= DATE_SUB(CURDATE(), INTERVAL :days DAY) GROUP BY date ORDER BY date");
    $bookingStatement->execute(['days' => $days]);
    $bookings = $bookingStatement->fetchAll();

    $paymentStatement = $pdo->prepare("SELECT DATE_FORMAT(date, '%d %b') AS day, ROUND(AVG(DATEDIFF(expected_date, date) * 24), 1) AS hours FROM payments WHERE date >= DATE_SUB(CURDATE(), INTERVAL :days DAY) GROUP BY date ORDER BY date");
    $paymentStatement->execute(['days' => $days]);
    $paymentTime = $paymentStatement->fetchAll();

    $grievanceStatement = $pdo->prepare("SELECT category AS type, ROUND(AVG(CASE WHEN status = 'Resolved' THEN DATEDIFF(CURDATE(), created_at) ELSE DATEDIFF(CURDATE(), created_at) END), 1) AS days FROM grievances WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY) GROUP BY category ORDER BY category");
    $grievanceStatement->execute(['days' => $days]);
    $grievances = $grievanceStatement->fetchAll();

    echo json_encode([
        'waiting' => array_map(static fn (array $row): array => ['center' => $row['center'], 'wait' => (float) $row['wait']], $waiting),
        'volume' => array_map(static fn (array $row): array => ['day' => $row['day'], 'volume' => (int) $row['volume']], $volume),
        'paymentTime' => array_map(static fn (array $row): array => ['day' => $row['day'], 'hours' => (float) $row['hours']], $paymentTime),
        'utilization' => array_map(static fn (array $row): array => ['name' => $row['name'], 'util' => (int) $row['util']], $utilization),
        'grievances' => array_map(static fn (array $row): array => ['type' => $row['type'], 'days' => (float) $row['days']], $grievances),
        'bookings' => array_map(static fn (array $row): array => ['day' => $row['day'], 'bookings' => (int) $row['bookings']], $bookings),
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
