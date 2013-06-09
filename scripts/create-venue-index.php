<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$elasticaClient = new \Elastica\Client();

$elasticaIndex = $elasticaClient->getIndex('venues');

// Drop and recreate the index (is there a better way to do this? Should we just drop the venue type?)
if ($elasticaIndex->exists()) $elasticaIndex->delete();
$elasticaIndex->create();

// Define the mapping
$elasticaType = $elasticaIndex->getType('venue');

// Define mapping
$mapping = new \Elastica\Type\Mapping();
$mapping->setType($elasticaType);

$mapping->setProperties(array(
    'id'      => array('type' => 'integer'),
    'name'     => array('type' => 'string', 'include_in_all' => TRUE),
    'location'=> array('type' => 'geo_point', 'include_in_all' => FALSE)
));

$mapping->send();

// Add venues

$venues = $db->fetchAll('SELECT * FROM venues');
$venueDocuments = array();
foreach ($venues as $venue) {
	$venue = array(
		'id'      => $venue['id'],
		'name'    => $venue['business_name'],
		'location'=> array('lat' => $venue['lat'], 'lon' => $venue['lng'])
	);
	// First parameter is the id of document.
	$venueDocuments[] = new \Elastica\Document($venue['id'], $venue);

}
// Add venue to type
$elasticaType->addDocuments($venueDocuments);

// Refresh Index
$elasticaType->getIndex()->refresh();
