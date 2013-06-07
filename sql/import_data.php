<?php
ini_set('max_execution_time', 300); //300 seconds = 5 minutes
// Parse the CSV and save its data into MySQL table
include_once('config.php');

$link = mysql_connect($db['host'],$db['user'],$db['password']) or die('Cannot connect to the DB');
mysql_select_db($db['database'], $link)  or die('No database selected');

$commit   = "COMMIT";
$querylog = "TRANSACTION STARTED<br /><br />";
mysql_query("begin", $link);

$row = 1;
if (($handle = fopen("venues.csv", "r")) !== FALSE) {
    $counter = 0;
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {

        $num = count($data);
        // This is the first line of the csv - ignore it.
        if (($data[0] == 'Business') && ($data[1] == 'WWW')) {} else {

            /*
            Index | CSV Name | DB Name
            0 | Business | business_name
            1 | Website  | website
            2 | Address  | address1
            3 | Address2 | address2
            4 | City 	 | city
            5 | State 	 | state
            6 | Zip 	 | zip
            7 | Phone    | phone
            8 | Email    | no field in db
            */
            $address = '';

            $geo_data = '';
            $lat 	  = '';
            $lng 	  = '';
            $url 	  = '';

            // be carefule with the api call - it only allows 2500 or so requests per day per host.
            $address = urlencode($data[2]. " " . $data[3] . " " . $data[4] . " " . $data[5] . " " . $data[6]);
            $url = 'http://maps.googleapis.com/maps/api/geocode/json?address=' . $address . '&sensor=true';

            $geo_data = file_get_contents($url);

            $geo_data = json_decode($geo_data);

            //echo $geo_data->status . " ---";

            if ($geo_data) {
                $lat = @$geo_data->results[0]->geometry->location->lat;
                $lng = @$geo_data->results[0]->geometry->location->lng;
            }

            //echo $counter++ . ": " . $address . " - " . @$lat . ":" . @$lng . "<br/>" . $url . "<hr>";

            $sql = "INSERT INTO venues (business_name, website, address1, address2, city, state, zip, phone, lat, lng)
                    VALUES ('" . mysql_real_escape_string($data[0]) . "', '" . $data[1] . "', '" .  mysql_real_escape_string($data[2]) . "',
                            '" . mysql_real_escape_string($data[3]) . "','" . mysql_real_escape_string($data[4]) . "', '" . $data[5] . "','" . $data[6] . "',
                            '" . $data[7] . "', '" . $lat . "','" . $lng . "')";

            if(!mysql_query($sql, $link)) {
                $commit = "ROLLBACK";
                $querylog .= "error in query: " . $sql . " : " . mysql_error($link) . "<br /><br />";
            }
        }
    }

    if($commit == "ROLLBACK") {
        $querylog .= "ERROR IN TRANSACTION<br /><br />transaction rolled back<br /><br />";
        echo $querylog;
    } else {
        $querylog .= "TRANSACTION COMPLETED! <br /><br />transaction committed<br /><br />";
        echo $querylog;
        mysql_query($commit);
    }

    fclose($handle);

}
