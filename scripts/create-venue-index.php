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
    'city'     => array('type' => 'string', 'include_in_all' => TRUE),
    'capacity'     => array('type' => 'integer', 'include_in_all' => TRUE),
    'location'=> array('type' => 'geo_point', 'include_in_all' => FALSE),
    'timestamp'=> array('type' => 'date', 'format' => "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd'T'HH:mm:ss.SSSZZ")
));

$mapping->send();

// Add venues

$venues = $db->fetchAll('SELECT * FROM venues');
$venueDocuments = array();
foreach ($venues as $venue) {
    $venue = array(
        'id'      => $venue['id'],
        'name'    => $venue['business_name'],
        'city'    => $venue['city'],
        'location'=> array('lat' => $venue['lat'], 'lon' => $venue['lng']),
        'timestamp'=> date('Y-m-d h:i:s'),
        'capacity'=> rand(1, 1000),
    );
    // First parameter is the id of document.
    $venueDocuments[] = new \Elastica\Document($venue['id'], $venue);

}
// Add venue to type
$elasticaType->addDocuments($venueDocuments);

// Refresh Index
$elasticaType->getIndex()->refresh();
