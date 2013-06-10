<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

$elasticaClient = new \Elastica\Client();
$searchManager = new BHW\Model\SearchManager($db, $elasticaClient);
$counties = $searchManager->findCounties();

$output = array();
foreach ($counties as $county) {
    $data = $county->getData();
    $output[] = array(
        "type"=>"FeatureCollection",
        "properties"=>
            array(
                "kind"=>"state",
                "state"=>"VT"
            ),
        "features"=>array(
            array(
                "type"=>"Feature",
                "properties"=>array(
                    "id" => $data['id'],
                    "kind"=>"county",
                    "name"=> $data['county'],
                    "state"=>"VT"
                ),
                "geometry"=> array(
                    "type"=>"MultiPolygon",
                    "coordinates"=>array(array(array_map(function($shape) { return array($shape['lon'], $shape['lat']); }, $data['shape'])))
                )
            )
        )
    );
}

echo json_encode($output);
