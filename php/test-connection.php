<?php

declare(strict_types=1);

header('Content-Type: application/json');

try {
    require __DIR__ . '/db.php';

    $pdo->query('SELECT 1');

    echo json_encode([
        'connected' => true,
        'message' => 'PHP is connected to MySQL.',
    ]);
} catch (Throwable $exception) {
    http_response_code(500);

    echo json_encode([
        'connected' => false,
        'message' => $exception->getMessage(),
    ]);
}
