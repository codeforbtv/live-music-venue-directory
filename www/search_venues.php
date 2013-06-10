<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$location = isset($_GET['location']) ? $_GET['location'] : null;
$county_id = isset($_GET['county_id']) ? $_GET['county_id'] : null;
$max_results = isset($_GET['max_results']) ? $_GET['max_results'] : 10;
$radius = isset($_GET['radius']) ? $_GET['radius'] : 25;
$format = strtolower($_GET['format']) == 'xml' ? 'xml' : 'json';

if (!$location && !$county_id) {
    die('Please supply a location or county id.');
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

    $results = $searchManager->findVenuesByDistance($geocoded->getLatitude(), $geocoded->getLongitude(), $radius);

} else if ($county_id) {

    $county = $searchManager->findCounty($county_id);
    $results = $searchManager->findVenuesByCounty($county);

}

/* create one master array of the records */
$venues = array();

// Build a mold for our returned object
$venues['max_results'] = $max_results;
$venues['total_results'] = count($results);
$venues['location']  = ucfirst($location);
$venues['results'] = $results;

/***************************************/
# Used for debugging
//print_r($venues);
/***************************************/

/* output in necessary format */
if($format == 'json') {
    header('Content-type: application/json');
    echo json_encode($venues);
} else {
    header('Content-type: text/xml');
    echo '<results>';
    foreach($venues as $index => $venue) {
        if(is_array($venue)) {
            foreach($venue as $key => $value) {
                echo '<',$key,'>';
                if(is_array($value)) {
                    foreach($value as $tag => $val) {
                        echo '<',$tag,'>',htmlentities($val),'</',$tag,'>';
                    }
                }
                echo '</',$key,'>';
            }
        }
    }
    echo '</results>';
}

/* disconnect from the db */
$db->close();

// Note: doesnt accept non 5 digit zip codes;
function is_zip_code($text)
{
    return ctype_digit($text) && strlen($text) == 5;
}
