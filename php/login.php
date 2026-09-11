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
    $email = trim((string) ($input['email'] ?? ''));
    $password = (string) ($input['password'] ?? '');
    $role = (string) ($input['role'] ?? 'farmer');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Enter a valid email and password.']);
        exit;
    }

    if (!in_array($role, ['farmer', 'admin'], true)) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid account role.']);
        exit;
    }

    $statement = $pdo->prepare(
        'SELECT name, email, role, farmer_id AS farmerId FROM users WHERE email = :email AND role = :role LIMIT 1'
    );
    $statement->execute(['email' => $email, 'role' => $role]);
    $user = $statement->fetch();

    $passwordStatement = $pdo->prepare(
        'SELECT password_hash FROM users WHERE email = :email AND role = :role LIMIT 1'
    );
    $passwordStatement->execute(['email' => $email, 'role' => $role]);
    $passwordHash = $passwordStatement->fetchColumn();

    if (!$user || !is_string($passwordHash) || !password_verify($password, $passwordHash)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email, password, or role.']);
        exit;
    }

    echo json_encode(['user' => $user]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
