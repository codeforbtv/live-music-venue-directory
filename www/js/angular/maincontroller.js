app.controller('MainController', function($scope, $http, Map) {
    var map = new Map(document.getElementById('search-map'), {
        center: {
            lat: 43.871754,
            lon: -72.447783
        },
        zoom: 7,
        minResults: 10,
        $scope: $scope
    });
    $scope.searchText = null;
    $scope.results = [];
    $scope.loading = false;
    $scope.currentResult = null;
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
                $scope.results = [];
                angular.forEach(data.results, function(result, index) {
                    addResult(result);
                });
                $scope.loading = false;
            });
    };

    $scope.initMap = function() {
        map.init();
    };

    $scope.resultHover = function(result, e) {
        if (e.type === 'mouseover') {
            map.showResultSummary(result);
        } else {
            map.hideResultSummary(result);
        }
    };

    $scope.resultClick = function(result, e) {
        $scope.currentResult = result;
    };

    function addResult(result) {
        $scope.results.push(result);
    };

    function displayCurrentResult(result) {
        map.displayResultDetail(result);
    };

    // Initialize the map
    $scope.$watch('results', function(results) {
        if (results.length == 0) {
            map.reset();
            return false;
        }
        map.displayResults(results);
    });

    // Display the current result on map
    $scope.$watch('currentResult', function(result) {
        if (result === null) {
            return false;
        }
        displayCurrentResult(result);
    });

    $scope.$on('resultsUpdated', function (event, results) {
        $scope.results = results;
    });
});
