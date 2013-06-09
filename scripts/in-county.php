<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$countyId = isset($argv[1]) ? (int) $argv[1] : null;
if (!$countyId) die('Please provide a county id');

$elasticaClient = new \Elastica\Client();

// Load chittenden county from the index
// We are kind of using the index as a NoSQL db.. bad idea?
$countiesIndex = $elasticaClient->getIndex('counties');
$countyQuery = new Elastica\Query\Ids('county', array($countyId));
$countyResults = $countiesIndex->search($countyQuery);
if (!$countyResults->count()) die('Could not load county');
$county = $countyResults->current();
$countyData = $county->getData();

$elasticaIndex = $elasticaClient->getIndex('venues');

$elasticaQuery        = new Elastica\Query();

// Filter by points lying within shape of the selected county
$geoPolygonFilter = new Elastica\Filter\GeoPolygon('venue.location', $countyData['shape']);
$elasticaQuery->setFilter($geoPolygonFilter);

// NOTE: This is a hack based on the fact that elastic search refuses to return all results. The docs say setting this to 0 should result in no limit but it seems to result in no results instead.
$elasticaQuery->setLimit(10000);

$elasticaResultSet    = $elasticaIndex->search($elasticaQuery);

// Get result ids
$ids = array();
foreach ($elasticaResultSet as $result) {
    $ids[] = $result->getId();
}

// Load venues
$query = 'SELECT * FROM venues WHERE id IN(?)';
$results = $db->executeQuery($query,
    array($ids),
    array(\Doctrine\DBAL\Connection::PARAM_INT_ARRAY)
);

// Output results
echo str_repeat('=', 10);
echo "\n";
echo sprintf("Venues in %s County\n", $countyData['county']);
echo str_repeat('=', 10);
echo "\n";
while($venue = $results->fetch()) {
    echo $venue['business_name'] . "\n";
}
