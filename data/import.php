<?php

require __DIR__ . '/../vendor/autoload.php';
$conn = require __DIR__ . '/../app/config/database.php';

function openCsv($file) {
    $handle = fopen($file, 'r') or die('Cannot open venues CSV file');

    return $handle;
}

function getNextLine($handle) {
    $line = fgetcsv($handle);

    if ($line) {
        array_splice($line, 7, 1);
    }

    return $line;
}

function closeCsv($handle) {
    fclose($handle);
}

// Drop tables and recreate
$sql = file_get_contents(__DIR__ . '/tables.sql');
$conn->executeQuery($sql);

// Bulk load venues data into table
$conn->transactional(function($conn) {
    $sql =
        'INSERT INTO venues ' .
        '(id, business_name, address1, address2, ' .
        'city, state, zip, lat, ' .
        'lng, website, phone, email)' .
        'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    $insert = $conn->prepare($sql);

    $handle = openCsv(__DIR__ . '/venues.csv');

    // Slurp first line (it's just headers)
    getNextLine($handle);

    while($line = getNextLine($handle)) {
        $insert->execute($line);
    }

    closeCsv($handle);
});

$conn->close();
