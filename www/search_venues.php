<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$location = isset($_GET['location']) ? $_GET['location'] : null;
$county_id = isset($_GET['county_id']) ? $_GET['county_id'] : null;
$max_results = isset($_GET['max_results']) ? $_GET['max_results'] : 10;
$radius = isset($_GET['radius']) && !empty($_GET['radius']) ? (int) $_GET['radius'] : 25;
$bounds = isset($_GET['bounds']) && !empty($_GET['bounds']) ? json_decode($_GET['bounds'], true) : null;

if (empty($location) && empty($county_id) && empty($bounds)) {
    die('Please supply a location, county id or bounds.');
}

$elasticaClient = new \Elastica\Client();
$searchManager = new BHW\Model\SearchManager($db, $elasticaClient);

if ($location) {

    // Location is an address string
    if (!is_zip_code($location)) {
        // Add vermont if its missing
        if (!preg_match('/(vt)|(vermont)$/i', $location)) {
            $location .= ' Vermont';
        }
    }

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

    $bounds = $geocoded->getBounds();

    $results = $searchManager->findVenuesInPolygon(array(
        array('lon' => $bounds['west'], 'lat' => $bounds['north']),
        array('lon' => $bounds['east'], 'lat' => $bounds['north']),
        array('lon' => $bounds['east'], 'lat' => $bounds['south']),
        array('lon' => $bounds['west'], 'lat' => $bounds['south']),
    ));

    // If no results were found within the city, try a radius search
    if (empty($results)) {
        $results = $searchManager->findVenuesByDistance($geocoded->getLatitude(), $geocoded->getLongitude(), $radius);
    }

} else if ($county_id) {

    $county = $searchManager->findCounty($county_id);
    $results = $searchManager->findVenuesByCounty($county);

} else if ($bounds) {

    if ($bounds['type'] === 'circle') {
        $results = $searchManager->findVenuesByDistance($bounds['lat'], $bounds['lon'], $bounds['radius']);
    } else {
        $results = $searchManager->findVenuesInPolygon($bounds['coordinates']);
    }

}

/* create one master array of the records */
$venues = array();

// Build a mold for our returned object
$venues['max_results'] = $max_results;
$venues['total_results'] = count($results);
$venues['location']  = ucfirst($location);
$venues['results'] = $results;

// Output
header('Content-type: application/json');
echo json_encode($venues);

$db->close();

// Note: doesnt accept non 5 digit zip codes;
function is_zip_code($text)
{
    return ctype_digit($text) && strlen($text) == 5;
}
