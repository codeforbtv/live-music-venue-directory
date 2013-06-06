<?php
/*
* Web service 
* http://localhost/live-music-venue-directory/webservice/venue.php?city=Burlington&num=10&format=json
*/

/* require the user as the parameter */

include_once('config.php');

if(isset($_GET['city']) ) {

	/* soak in the passed variable or set our own */
	$number_of_posts = isset($_GET['num']) ? intval($_GET['num']) : 10; //10 is the default
	$number_of_posts = mysql_real_escape_string($number_of_posts);
	
	$format = strtolower($_GET['format']) == 'json' ? 'json' : 'xml'; 	//xml is the default
	$format = mysql_real_escape_string($format);
	
	$city   = $_GET['city']; //no default
	$city   = mysql_real_escape_string($city);
	

	/* connect to the db */
	$link = mysql_connect($db['host'],$db['user'],$db['password']) or die('Cannot connect to the DB');
	mysql_select_db($db['database'], $link)  or die('No database selected');
	
	/* grab the posts from the db */
	
	/**********************************************************************************************
	// This will eventually be the main query for the list but there are some google API issues
	/**********************************************************************************************
	$url_city = urlencode($city);
	$url = 'http://maps.googleapis.com/maps/api/geocode/json?address=' . $url_city . '&sensor=true';
	$geo_data = file_get_contents($url);
	$geo_data = json_decode($geo_data);
	
	if ($geo_data) {
		$lat = @$geo_data->results[0]->geometry->location->lat;
		$lng = @$geo_data->results[0]->geometry->location->lng;
	}
	
	if ($geo_data->status == 'OK' && isset($lat) && isset($lng)){
		$query = "SELECT *, ( 3959 * acos( cos( radians(" . $lat . " ) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(" . $lng . ") ) + sin( radians(" . $lat . ") ) * sin( radians( lat ) ) ) ) AS distance
						FROM venues HAVING distance < 25 ORDER BY distance LIMIT 0 , " . $number_of_posts;
	}
	else {
	*/
		$query    = "SELECT * from venues where city = '" . $city . "' LIMIT " . $number_of_posts;
	/*
	}
	*/	
	
	$result   = mysql_query($query, $link) or die('Errant query:  '. mysql_error($link));
	$num_rows = mysql_num_rows($result);

	/* create one master array of the records */
	$posts = array();
	
	// Build a mold for our returned object
	$posts['id'] 	= 1;
	$posts['number_of_posts'] = $number_of_posts;
	$posts['returned_number'] = $num_rows;
	$posts['city']  = ucfirst($city);
	
	if(mysql_num_rows($result)) {
		while($post = mysql_fetch_assoc($result)) {
			$posts['result'][] = $post;
		}
	}

	/***************************************/
	# Used for debugging
	//print_r($posts);
	/***************************************/
	
	/* output in necessary format */
	if($format == 'json') {
		header('Content-type: application/json');
		echo json_encode(array('posts'=>$posts));
	}
	else {
		header('Content-type: text/xml');
		echo '<posts>';
		foreach($posts as $index => $post) {
			if(is_array($post)) {
				foreach($post as $key => $value) {
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
		echo '</posts>';
	}

	/* disconnect from the db */
	@mysql_close($link);
}

?>
