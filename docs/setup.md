Setup Instructions for Big Heavy World Live Music Venue Directory
=================================================================

Overview
--------
The venue directory runs on an Apache2 web server running PHP 5.3+ and MySQL 
with the php pdo extension for database queries (php5-mysql package on debian).
ElasticSearch is used as the search engine to provide geolocation based search.
Composer is used to manage PHP depdencies, which requires the php curl extension
(php5-curl package on debian).

Setup Instructions
------------------

1. Install php curl extension

```bash
sudo apt-get install php5-curl
```

2. Install php mysql extension for mysql/pdo support

```bash
sudo apt-get install php5-mysql
```

3. Create a database and then create paramters.php from dist, filling in db info

```bash
cp app/config/parameters.php.dist app/config/parameters.php
vi app/config/parameters.php
```

4. Import venue data

```bash
mysql bigheavyworld -u root -p < sql/venues_data.sql 
```

5. Install composer and use it to install third party libraries 

```bash
curl -sS https://getcomposer.org/installer | php
php composer.phar install
```

6. Install elastic search, this should be configured as a service so it always runs on startup

```bash
sudo dpkg -i elasticsearch-0.90.1.deb 
```

7. Create county and venue search indexes (elasticsearch must be running)

```bash
php scripts/create-county-index.php 
php scripts/create-venue-index.php 
```

8. Other

Probably need to create a cronjob to keep venue index up to date?
