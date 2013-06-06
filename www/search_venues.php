<?php
// TODO: Remove useage of @ syntax for error suppression
/*
* Web service 
* http://localhost/live-music-venue-directory/webservice/venue.php?city=Burlington&num=10&format=json
*/

/* require the user as the parameter */

$params = require_once __DIR__ . '/../app/config/parameters.php';
$db = $params['db_config'];

$location = isset($_GET['location']) ? $_GET['location'] : null;
$max_results = isset($_GET['max_results']) ? $_GET['max_results'] : 10;
$radius = isset($_GET['radius']) ? $_GET['radius'] : 25;
$format = strtolower($_GET['format']) == 'xml' ? 'xml' : 'json';

if (!$location) {
	// TODO: error in correct format
	die('Please supply a location.');
}

if ($location) {

	// Location is an address string
	if (!is_zip_code($location)) {
		// Add vermont if its missing
		if (!preg_match('/(vt)|(vermont)$/i', $location)) {
			$location .= ', VT';
		}
	}

	/* connect to the db */
	$link = mysql_connect($db['host'],$db['user'],$db['password']) or die('Cannot connect to the DB');
	mysql_select_db($db['database'], $link)  or die('No database selected');
	
	/* grab the venues from the db */
	
	/**********************************************************************************************
	// TODO: Need to register google maps API key
	// TODO: Switch this to use Geocoder library with Google Maps providers
	/**********************************************************************************************/
	$url = 'http://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($location) . '&sensor=true';
	$geo_data = file_get_contents($url);
	$geo_data = json_decode($geo_data);
	
	if ($geo_data) {
		$lat = @$geo_data->results[0]->geometry->location->lat;
		$lng = @$geo_data->results[0]->geometry->location->lng;
	}

	if ($geo_data->status == 'OK' && isset($lat) && isset($lng)){
		// TODO: Limit should include page param
		$limit_clause = $max_results ? sprintf('LIMIT 0, %d', addslashes($max_results)) : '';
		$query = sprintf("
			SELECT *, ( 3959 * acos( cos( radians(%s) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(%s) ) + sin( radians(%s) ) * sin( radians( lat ) ) ) ) AS distance 
			FROM venues 
			HAVING distance < %d 
			ORDER BY distance
			%s
			",
			addslashes($lat),
			addslashes($lng),
			addslashes($lat),
			addslashes($radius),
			$limit_clause
		);
	} else {
		// TODO: Error
	}
	
	$result   = mysql_query($query, $link) or die('Errant query:  '. mysql_error($link));
	$num_rows = mysql_num_rows($result);

	/* create one master array of the records */
	$venues = array();
	
	// Build a mold for our returned object
	$venues['max_results'] = $max_results;
	$venues['total_results'] = $num_rows;
	$venues['location']  = ucfirst($location);
	$venues['results']  = array();
	
	if(mysql_num_rows($result)) {
		while($venue = mysql_fetch_assoc($result)) {
			$venues['results'][] = $venue;
		}
	}

	/***************************************/
	# Used for debugging
	//print_r($venues);
	/***************************************/
	
	/* output in necessary format */
	if($format == 'json') {
		header('Content-type: application/json');
		echo json_encode($venues);
	}
	else {
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
	@mysql_close($link);
}

// Note: doesnt accept non 5 digit zip codes;
function is_zip_code($text) {
	return ctype_digit($text) && strlen($text) == 5;
}
