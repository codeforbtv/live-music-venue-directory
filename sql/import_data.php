<?php

// Parse the CSV and save its data into MySQL table
include_once('../webservice/config.php');

$link = mysql_connect($db['host'],$db['user'],$db['password']) or die('Cannot connect to the DB');
mysql_select_db($db['database'], $link)  or die('No database selected');

$commit   = "COMMIT";
$querylog = "TRANSACTION STARTED<br /><br />";
mysql_query("begin", $link);

$row = 1;
if (($handle = fopen("venues.csv", "r")) !== FALSE) {

	while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
	
		$num = count($data);
		// This is the first line of the csv - ignore it.
		if (($data[0] == 'Business') && ($data[1] == 'WWW')) {}
		else {

			/*
			Index | CSV Name | DB Name
			0 | Business | bizName 
			1 | Website  | website
			2 | Address  | address1
			3 | Address2 | address2
			4 | City 	 | city
			5 | State 	 | state
			6 | Zip 	 | zip
			7 | Phone    | phone
			8 | Email    | no field in db
			*/
				
			$sql = "INSERT INTO venues (bizName, website, address1, address2, city, state, zip, phone) 
					VALUES ('" . mysql_real_escape_string($data[0]) . "', '" . $data[1] . "', '" .  mysql_real_escape_string($data[2]) . "', 
							'" . mysql_real_escape_string($data[3]) . "','" . mysql_real_escape_string($data[4]) . "', '" . $data[5] . "','" . $data[6] . "', '" . $data[7] . "')";
					
			if(!mysql_query($sql, $link)) {
				$commit = "ROLLBACK";
				$querylog .= "error in query: " . $sql . " : " . mysql_error($link) . "<br /><br />";
			}
		}
	}
	
	if($commit == "ROLLBACK")
	{
		$querylog .= "ERROR IN TRANSACTION<br /><br />transaction rolled back<br /><br />";
		echo $querylog;
	}
	else {
		$querylog .= "TRANSACTION COMPLETED! <br /><br />transaction committed<br /><br />";
		echo $querylog;
		mysql_query($commit);
	}
	
	fclose($handle);
	
}

?>