Setup Instructions for Big Heavy World Live Music Venue Directory
=================================================================

Overview
--------
The venue directory runs on an Apache2 web server running PHP 5.3+ and MySQL 
with the php pdo extension for database queries (php5-mysql package on debian).
ElasticSearch is used as the search engine to provide geolocation based search.
Composer is used to manage PHP dependencies.

Setup Instructions
------------------

1. Install required php extensions:

```bash
sudo apt-get install php5-{curl,mysql,json}
```

2. Create a database and then create parameters.php from dist, filling in db
info:

```bash
cp app/config/parameters.php.dist app/config/parameters.php
vi app/config/parameters.php
```

3. Import venue data:

```bash
mysql YOURDBNAME -u root -p < sql/venues_data.sql 
```

4. Install composer and use it to install third party libraries:

```bash
curl -sS https://getcomposer.org/installer | php
php composer.phar install
```

5. Install elastic search. This will be configured as a service so it always
runs on startup.

```bash
sudo dpkg -i elasticsearch-0.90.1.deb 
```

6. Create county and venue search indexes (Elasticsearch must be running):

```bash
php scripts/create-county-index.php 
php scripts/create-venue-index.php 
```
