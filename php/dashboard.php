<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3001');

try {
    require __DIR__ . '/db.php';

    $totalFarmers = (int) $pdo->query('SELECT COUNT(*) FROM farmers')->fetchColumn();
    $activeCenters = (int) $pdo->query("SELECT COUNT(*) FROM centers WHERE status <> 'Closed'")->fetchColumn();
    $confirmedBookings = (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'Confirmed'")->fetchColumn();
    $procurementsToday = (int) $pdo->query('SELECT COUNT(*) FROM procurements WHERE date = CURDATE()')->fetchColumn();
    $totalPayments = (int) $pdo->query('SELECT COUNT(*) FROM payments')->fetchColumn();
    $paidPayments = (int) $pdo->query("SELECT COUNT(*) FROM payments WHERE status = 'Paid'")->fetchColumn();
    $openGrievances = (int) $pdo->query("SELECT COUNT(*) FROM grievances WHERE status IN ('Open', 'Escalated')")->fetchColumn();
    $delayedPayments = (int) $pdo->query("SELECT COUNT(*) FROM payments WHERE status = 'Delayed'")->fetchColumn();

    $centerStatement = $pdo->query(
        'SELECT id, name, daily_capacity, booked_today, current_queue, counters_open, counters_total,
                expected_wait_min, avg_wait_min, payment_reliability, reliability_score,
                on_time_payment, grievance_resolution
         FROM centers ORDER BY id'
    );
    $centers = [];
    foreach ($centerStatement->fetchAll() as $center) {
        $centers[] = [
            'id' => $center['id'],
            'name' => $center['name'],
            'dailyCapacity' => (int) $center['daily_capacity'],
            'bookedToday' => (int) $center['booked_today'],
            'currentQueue' => (int) $center['current_queue'],
            'countersOpen' => (int) $center['counters_open'],
            'countersTotal' => (int) $center['counters_total'],
            'expectedWaitMin' => (int) $center['expected_wait_min'],
            'avgWaitMin' => (int) $center['avg_wait_min'],
            'paymentReliability' => (float) $center['payment_reliability'],
            'reliabilityScore' => (float) $center['reliability_score'],
            'onTimePayment' => (float) $center['on_time_payment'],
            'grievanceResolution' => (float) $center['grievance_resolution'],
        ];
    }

    $ahmedabad = null;
    foreach ($centers as $center) {
        if ($center['id'] === 'C-A') {
            $ahmedabad = $center;
            break;
        }
    }

    $farmerStatusStatement = $pdo->query(
        'SELECT f.id, f.name, p.id AS procurement_id, p.status
         FROM farmers f
         LEFT JOIN procurements p ON p.farmer_id = f.id
           AND p.created_at = (SELECT MAX(p2.created_at) FROM procurements p2 WHERE p2.farmer_id = f.id)
         ORDER BY f.name'
    );
    $farmerStatuses = [];
    foreach ($farmerStatusStatement->fetchAll() as $farmer) {
        $events = [];
        if ($farmer['procurement_id']) {
            $eventStatement = $pdo->prepare('SELECT event_key, done, current_flag FROM procurement_events WHERE procurement_id = :id ORDER BY id');
            $eventStatement->execute(['id' => $farmer['procurement_id']]);
            foreach ($eventStatement->fetchAll() as $event) {
                $events[] = [
                    'key' => $event['event_key'],
                    'done' => (bool) $event['done'],
                    'current' => (bool) $event['current_flag'],
                ];
            }
        }
        $farmerStatuses[] = [
            'farmerId' => (string) $farmer['id'],
            'name' => $farmer['name'],
            'procurementId' => $farmer['procurement_id'],
            'status' => $farmer['status'] ?? 'No produce submitted',
            'events' => $events,
        ];
    }

    echo json_encode([
        'kpis' => [
            'totalFarmers' => $totalFarmers,
            'activeCenters' => $activeCenters,
            'confirmedBookings' => $confirmedBookings,
            'procurementsToday' => $procurementsToday,
            'onTimePaymentRate' => $totalPayments > 0 ? round(($paidPayments / $totalPayments) * 100) : 0,
            'openGrievances' => $openGrievances,
            'delayedPayments' => $delayedPayments,
        ],
        'centers' => $centers,
        'ahmedabad' => $ahmedabad,
        'farmerStatuses' => $farmerStatuses,
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
