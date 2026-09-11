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
    $name = trim((string) ($input['name'] ?? ''));
    $email = trim((string) ($input['email'] ?? ''));
    $password = (string) ($input['password'] ?? '');
    $centerId = trim((string) ($input['centerId'] ?? ''));

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6 || $centerId === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Enter the officer name, center ID, valid email, and a password with at least 6 characters.']);
        exit;
    }

    $center = $pdo->prepare('SELECT id FROM centers WHERE id = :id LIMIT 1');
    $center->execute(['id' => $centerId]);
    if (!$center->fetch()) {
        http_response_code(422);
        echo json_encode(['error' => 'Select a valid government procurement center.']);
        exit;
    }

    $existing = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $existing->execute(['email' => $email]);
    if ($existing->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'This email is already registered.']);
        exit;
    }

    $statement = $pdo->prepare(
        "INSERT INTO users (name, email, password_hash, role, farmer_id)
         VALUES (:name, :email, :password_hash, 'admin', '0')"
    );
    $statement->execute([
        'name' => $name,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    echo json_encode(['user' => [
        'name' => $name,
        'email' => $email,
        'role' => 'admin',
        'centerId' => $centerId,
    ]]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
