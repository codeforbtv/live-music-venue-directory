bhw.directoryApp.controller('SearchController', function($scope, $http, $location, $route, Map) {
    var isEmpty = _.isEmpty,
        map = new Map(document.getElementById('search-map'), {
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

    init();

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

    function init() {
        map.init();
        if ( ! isEmpty($location.search())) {
            doSearch($location.search());
        }
    };

    function addResult(result) {
        $scope.results.push(result);
    };

    function displayCurrentResult(result) {
        map.displayResultDetail(result);
    };

    function doSearch(criteria) {
        $scope.loading = true;
        $http.get(
            '/search_venues.php',
            {
                params: criteria,
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

    $scope.submitSearch = function() {
        $location.path('/').search({ location: $scope.searchText });
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

    $scope.$on('searchSubmit', function (event, criteria) {
        $scope.$apply(function() {
            $scope.searchText = null;
            $location.search(criteria);
            doSearch(criteria);
        });
    });
    
    var lastRoute = $route.current;
    $scope.$on('$locationChangeSuccess', function(event) {
        if ($route.current.$$route.controller === 'SearchController') {
            $route.current = lastRoute;
            doSearch($location.search());
        }
    });
});
