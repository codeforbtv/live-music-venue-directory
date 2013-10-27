app.controller('MainController', function($scope, $http, map) {
    $scope.searchText = null;
    $scope.venues = [];
    $scope.loading = false;
    $scope.currentVenue = null;
    $scope.submitSearch = function() {
        $scope.loading = true;
        $http.get(
            '/search_venues.php',
            {
                params: {
                    location: $scope.searchText
                },
                responseType: 'json'
            })
            .success(function(data) {
                $scope.venues = [];
                angular.forEach(data.results, function(venue, index) {
                    addVenue(venue);
                });
                $scope.loading = false;
            });
    };

    $scope.initMap = function() {
        map.init();
    };

    $scope.venueHover = function(venue, e) {
        map.getMarkerByVenueId(venue.id).openPopup();
    };

    $scope.venueClick = function(venue, e) {
        $scope.currentVenue = venue;
    };

    function addVenue(venue) {
        $scope.venues.push(venue);
    };

    function displayCurrentVenue(venue) {
        map.displayVenue(venue);
    };

    // Initialize the map
    $scope.$watch('venues', function(venues) {
        if (venues.length == 0) {
            map.reset();
            return false;
        }
        map.displayVenues(venues);
    });

    // Initialize the map
    $scope.$watch('currentVenue', function(venue) {
        if (venue === null) {
            return false;
        }
        displayCurrentVenue(venue);
    });
});
