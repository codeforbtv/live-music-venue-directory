<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$location = isset($_GET['location']) ? $_GET['location'] : null;
$max_results = isset($_GET['max_results']) ? $_GET['max_results'] : 10;
$radius = isset($_GET['radius']) ? $_GET['radius'] : 25;
$format = strtolower($_GET['format']) == 'xml' ? 'xml' : 'json';

if (!$location) {
    die('Please supply a location.');
}

if ($location) {

    // Location is an address string
    if (!is_zip_code($location)) {
        // Add vermont if its missing
        if (!preg_match('/(vt)|(vermont)$/i', $location)) {
            $location .= ' Vermont';
        }
    }

    // Geocoder
    $adapter = new \Geocoder\HttpAdapter\BuzzHttpAdapter();
    $geocoder = new \Geocoder\Geocoder();
    $geocoder->registerProviders(array(
        new \Geocoder\Provider\GoogleMapsProvider(
            $adapter
        )
    ));

    try {
        $geocoded = $geocoder->geocode($location);
    } catch (\Geocoder\Exception\NoResultException $e) {
        // TODO: Error in right format
        die('Could not geolocate location ' . $location . '. Error: ' . $e->getMessage());
    }

    // TODO: Limit should include page param
    $limit_clause = $max_results ? sprintf('LIMIT 0, %d', addslashes($max_results)) : '';
    $query = sprintf("
        SELECT *, ( 3959 * acos( cos( radians(:lat) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(:lng) ) + sin( radians(:lat) ) * sin( radians( lat ) ) ) ) AS distance
        FROM venues
        HAVING distance < :radius
        ORDER BY distance
        %s
        ",
        $limit_clause
    );

    // $result   = mysql_query($query, $link) or die('Errant query:  '. mysql_error($link));
    $results = $db->executeQuery($query, array(
        'lat' => $geocoded->getLatitude(),
        'lng' => $geocoded->getLongitude(),
        'radius' => $radius
    ));
    $num_rows = $results->rowCount();

    /* create one master array of the records */
    $venues = array();

    // Build a mold for our returned object
    $venues['max_results'] = $max_results;
    $venues['total_results'] = $num_rows;
    $venues['location']  = ucfirst($location);
    $venues['results']  = array();

    while($venue = $results->fetch()) {
        $venues['results'][] = $venue;
    }

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
}

// Note: doesnt accept non 5 digit zip codes;
function is_zip_code($text)
{
    return ctype_digit($text) && strlen($text) == 5;
}
