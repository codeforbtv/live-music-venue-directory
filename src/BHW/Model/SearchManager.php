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
        $query = 'SELECT * FROM venues WHERE id IN(?)';
        $results = $this->db->executeQuery($query, array($ids), array(\Doctrine\DBAL\Connection::PARAM_INT_ARRAY));
        $venues = array();
        while ($venue = $results->fetch()) {
            $venue['distance'] = $distanceMap[$venue['id']];
            $venues[] = $venue;
        }

        // Sort by distance again since we lost sort order
        usort($venues, function($a, $b) {
            if ($a['distance'] === $b['distance']) return 0;
            return $a['distance'] > $b['distance'] ? 1 : -1;
        });

        return $venues;
    }

}
