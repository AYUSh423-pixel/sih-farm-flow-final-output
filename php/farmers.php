<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3001');

try {
    require __DIR__ . '/db.php';

    $statement = $pdo->query('SELECT id, name, mobile, village, crop, status, credit_score, email FROM farmers ORDER BY id');
    $farmers = array_map(static function (array $row): array {
        return [
            'id' => (string) $row['id'],
            'name' => $row['name'],
            'mobile' => (string) $row['mobile'],
            'village' => $row['village'],
            'crop' => $row['crop'],
            'status' => $row['status'],
            'creditScore' => (int) $row['credit_score'],
            'email' => $row['email'],
        ];
    }, $statement->fetchAll());

    echo json_encode(['farmers' => $farmers]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
