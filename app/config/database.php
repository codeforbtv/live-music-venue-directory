<?php

require __DIR__ . '/../../vendor/autoload.php';
$params = require 'parameters.php';

$config = new \Doctrine\DBAL\Configuration();
return \Doctrine\DBAL\DriverManager::getConnection($params['db_config'], $config);
