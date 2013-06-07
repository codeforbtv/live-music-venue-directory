<?php

// Config
require __DIR__ . '/../vendor/autoload.php';
$db = require __DIR__ . '/../app/config/database.php';

// Request parameters
$id = isset($_GET['id']) ? $_GET['id'] : null;
if (!$id) die('Please supply a venue id');

// Load venue
$venue = $db->fetchAssoc('SELECT * FROM venues WHERE id = ?', array($id));
if (!$venue) die('No venue found with id ' . $id);

$db->close();

?>
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="/css/styles.css" />
        <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.css" />
        <title><?php echo $venue['business_name']; ?></title>
    </head>
    <body>
        <div id="site">
            <div id="banner">
                <div id="logo">
                    <img src="/images/big-heavy-world.jpg" alt="Big Heavy World Logo" width="137" height="115" />
                    <p>Big Heavy World</p>
                </div>
                <p id="tagline">Big Heavy World</p>
                <h1>Vermont Music Venue Search</h1>
            </div>
            <div id="app">
                <h1><?php echo $venue['business_name']; ?></h1>
                <p><?php echo $venue['address']; ?></p>
            </div>
            <div id="footer">
                <p>Partially designed/built by a seemingly random conglomerate of skilled people.</p>
            </div>
        </div>
    </body>
</html>
