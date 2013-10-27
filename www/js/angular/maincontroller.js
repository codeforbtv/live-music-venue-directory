app.controller('MainController', function($scope, $http, map) {
    $scope.searchText = null;
    $scope.venues = [];
    $scope.loading = false;
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
        console.log('lets go map');
    };

    function addVenue(venue) {
        $scope.venues.push(venue);
    };

    // Initialize the map
    $scope.$watch('venues', function(venues) {
        if (venues.length == 0) {
            map.reset();
            return false;
        }
        map.displayVenues(venues);
    });
});
