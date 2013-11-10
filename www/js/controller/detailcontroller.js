bhw.directoryApp.controller('DetailController', function($scope, $routeParams) {
    console.log($routeParams.objectID);
    $scope.object = {
        name: "My great object name"
    };
});
