<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$countyId = isset($argv[1]) ? (int) $argv[1] : null;
if (!$countyId) die('Please provide a county id');

$elasticaClient = new \Elastica\Client();
$searchManager = new BHW\Model\SearchManager($db, $elasticaClient);
$county = $searchManager->findCounty($countyId);
$venues = $searchManager->findVenuesByCounty($county);

// Output results
echo str_repeat('=', 10);
echo "\n";
echo sprintf("Venues in %s County\n", $county['county']);
echo str_repeat('=', 10);
echo "\n";
foreach ($venues as $venue) {
    echo $venue['business_name'] . "\n";
}
