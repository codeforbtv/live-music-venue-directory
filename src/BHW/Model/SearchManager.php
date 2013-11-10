<?php

namespace BHW\Model;

class SearchManager
{
    protected $db;
    protected $search;

    public function __construct(\Doctrine\DBAL\Connection $db, \Elastica\Client $search)
       {
        $this->db = $db;
        $this->search = $search;
    }

    public function findVenuesByDistance($lat, $lon, $radius = 25)
    {
        // Load chittenden county from the index
        $venuesIndex = $this->search->getIndex('venues');

        // Query for venues within radius
        $query = new \Elastica\Query();
        $geoDistanceFilter = new \Elastica\Filter\GeoDistance('venue.location', array('lat' => $lat, 'lon' => $lon), $radius . 'mi');
        $query->setFilter($geoDistanceFilter);

        // Sort by distance
        $query->setSort(array(
            "_geo_distance" => array(
                "venue.location" => array(
                    "lat" => $lat,
                    "lon" => $lon
                ),
                "order" => "asc",
                "unit" => "mi"
            )
        ));

        // NOTE: This is a hack based on the fact that elastic search refuses to return all results. The docs say setting this to 0 should result in no limit but it seems to result in no results instead.
        $query->setLimit(10000);
        $results    = $venuesIndex->search($query);
        if ($results->count() == 0) return array();

        // Get result ids
        $ids = array();
        $distanceMap = array();
        foreach ($results as $result) {
            $data = $result->getData();
            $ids[] = $data['id'];
            $distanceMap[$data['id']] = array_shift($result->getParam('sort'));
        }

        // Load venues
        $venues = $this->findVenuesByIds($ids);
        foreach ($venues as &$venue) {
            $venue['distance'] = $distanceMap[$venue['id']];
        }
        unset($venue);

        // Sort by distance again since we lost sort order
        usort($venues, function($a, $b) {
            if ($a['distance'] === $b['distance']) return 0;
            return $a['distance'] > $b['distance'] ? 1 : -1;
        });

        return $venues;
    }

    public function findCounty($id)
    {
        // Load the county
        $countiesIndex = $this->search->getIndex('counties');
        $countyQuery = new \Elastica\Filter\Ids('county', array($id));
        $countyResults = $countiesIndex->search($countyQuery);
        if ($countyResults->count()) {
            $county = $countyResults->current();
            return $countyData = $county->getData();
        } else {
            throw new \InvalidArgumentException($id . ' is not a valid county id');
        }
    }

    public function findVenuesInPolygon(array $polygon)
    {
        $query = new \Elastica\Query();
        $geoPolygonFilter = new \Elastica\Filter\GeoPolygon('venue.location', $polygon);
        $query->setFilter($geoPolygonFilter);
        $query->setLimit(10000);

        // Get result ids
        $venuesIndex = $this->search->getIndex('venues');
        $results = $venuesIndex->search($query);

        $ids = array();
        foreach ($results as $result) {
            $ids[] = $result->getId();
        }

        if (empty($ids)) {
            return array();
        }

        // Load venues
        return $this->findVenuesByIds($ids);
    }

    protected function findVenuesByIds(array $ids)
    {
        return $this->db->executeQuery('SELECT * FROM venues WHERE id IN(?)',
            array($ids),
            array(\Doctrine\DBAL\Connection::PARAM_INT_ARRAY)
        )->fetchAll();
    }

    public function findVenuesByCounty(array $county)
    {
        return $this->findVenuesInPolygon($county['shape']);
    }

    public function findCounties()
    {
        $countiesIndex = $this->search->getIndex('counties');
        return $countiesIndex->search('', 10000);
    }

}
