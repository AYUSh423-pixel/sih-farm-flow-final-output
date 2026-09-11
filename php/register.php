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
    $role = (string) ($input['role'] ?? 'farmer');
    $mobile = trim((string) ($input['mobile'] ?? ''));
    $village = trim((string) ($input['village'] ?? ''));

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6 || $mobile === '' || $village === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Enter a name, valid email, and password with at least 6 characters.']);
        exit;
    }

    if (!in_array($role, ['farmer', 'admin'], true)) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid account role.']);
        exit;
    }

    $existing = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $existing->execute(['email' => $email]);

    if ($existing->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'An account with this email already exists.']);
        exit;
    }

    $pdo->beginTransaction();

    if ($role === 'farmer') {
        $farmerStatement = $pdo->prepare(
            'INSERT INTO farmers (name, mobile, village, crop, status, email)
             VALUES (:name, :mobile, :village, :crop, :status, :email)'
        );
        $farmerStatement->execute([
            'name' => $name,
            'mobile' => $mobile,
            'village' => $village,
            'crop' => 'Other',
            'status' => 'Active',
            'email' => $email,
        ]);
        $farmerId = (string) $pdo->lastInsertId();
    } else {
        $farmerId = '0';
    }

    $statement = $pdo->prepare(
        'INSERT INTO users (name, email, password_hash, role, farmer_id) VALUES (:name, :email, :password_hash, :role, :farmer_id)'
    );
    try {
        $statement->execute([
            'name' => $name,
            'email' => $email,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'role' => $role,
            'farmer_id' => $farmerId,
        ]);
        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }

    echo json_encode([
        'user' => [
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'farmerId' => $farmerId ?: null,
        ],
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => $exception->getMessage()]);
}
