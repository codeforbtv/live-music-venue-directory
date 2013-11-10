var bhw = bhw || {};

bhw.directoryApp = angular.module('DirectoryApp', []);

bhw.directoryApp.config(function($routeProvider) {
    $routeProvider
        .when('/',
              {
                  controller: 'SearchController',
                  templateUrl: 'partials/Search.html'
              })
        .when('/detail/:objectID',
              {
                  controller: 'DetailController',
                  templateUrl: 'partials/Detail.html'
              })
        .otherwise({
            redirectTo: '/'
        });
});

bhw.directoryApp.value('leafletApiKey', '6ded93aafce14dbeaf33173762046262');
