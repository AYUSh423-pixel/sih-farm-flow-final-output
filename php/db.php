<?php

declare(strict_types=1);

// Add your XAMPP MySQL connection values here before using this file.
$host = 'localhost'; 
$database = 'farmerflow'; 
$username = 'root'; 
$password = ''; 
if ($host === '' || $database === '' || $username === '') {
    throw new RuntimeException('Add the XAMPP MySQL connection values in php/db.php.');
}

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $exception) {
    throw new RuntimeException('Could not connect to MySQL.', 0, $exception);
}
