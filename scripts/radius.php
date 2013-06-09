<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$location = isset($argv[1]) ? $argv[1] : null;
if (!$location) die('Please provide a location');
$radius = isset($argv[2]) ? (float) $argv[2] : 25;

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

$elasticaClient = new \Elastica\Client();
$searchManager = new BHW\Model\SearchManager($db, $elasticaClient);
$venues = $searchManager->findVenuesByDistance($geocoded->getLatitude(), $geocoded->getLongitude(), $radius);

// Output results
echo str_repeat('=', 10) . "\n";
echo sprintf("Geocoded '%s' to Lat: %s Lon: %s\n", $location, $geocoded->getLatitude(), $geocoded->getLongitude());
echo sprintf("Venues within %d miles of %s\n", $radius, $location);
echo str_repeat('=', 10) . "\n";
foreach ($venues as $venue) {
    echo sprintf("%s (%.2f miles)\n", $venue['business_name'], $venue['distance']);
}
