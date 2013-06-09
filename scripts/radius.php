<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$location = isset($argv[1]) ? $argv[1] : null;
if (!$location) die('Please provide a location');
$radius = isset($argv[2]) ? (int) $argv[2] : 25;

// Geocode location
$geocoder = new \Geocoder\Geocoder();
$geocoder->registerProviders(array(
    new \Geocoder\Provider\GoogleMapsProvider(
        new \Geocoder\HttpAdapter\BuzzHttpAdapter()
    )
));

try {
    $geocoded = $geocoder->geocode($location);
} catch (\Geocoder\Exception\NoResultException $e) {
    die('Could not geolocate location ' . $location . '. Error: ' . $e->getMessage());
}

echo sprintf("Geocoded '%s' to Lat: %s Lon: %s\n", $location, $geocoded->getLatitude(), $geocoded->getLongitude());

$elasticaClient = new \Elastica\Client();

// Load chittenden county from the index
$venuesIndex = $elasticaClient->getIndex('venues');

// Query for venues within radius
$query = new Elastica\Query();
$geoDistanceFilter = new Elastica\Filter\GeoDistance('venue.location', array('lat' => $geocoded->getLatitude(), 'lon' => $geocoded->getLongitude()), $radius . 'mi');
$query->setFilter($geoDistanceFilter);
// NOTE: This is a hack based on the fact that elastic search refuses to return all results. The docs say setting this to 0 should result in no limit but it seems to result in no results instead.
$query->setLimit(10000);
$query->setSort(array(
    "_geo_distance" => array(
        "venue.location" => array(
            "lat" => $geocoded->getLatitude(),
            "lon" => $geocoded->getLongitude()
        ),
        "order" => "asc",
        "unit" => "mi"
    )
));

// Order by distance

$results    = $venuesIndex->search($query);

// Get result ids
$ids = array();
foreach ($results as $result) {
    $data = $result->getData();
    $distance = array_shift($result->getParam('sort'));
    echo sprintf("%s (%s miles)\n", $data['name'], $distance);
}
exit;

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
