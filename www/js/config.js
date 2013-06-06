// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
require.config({
    baseUrl: 'js/lib',
    paths: {
        config: '../config',
        app: '../app',
        main: '../app/main',
        service: '../app/service',
        model: '../app/model',
        view: '../app/view',
        collection: '../app/collection',
        tpl: '../app/tpl',
        router: '../app/router',
        jquery: '../lib/jquery',
        backbone: '../lib/backbone',
        underscore: '../lib/underscore',
        mirui: '../lib/miuri',
        leaflet: 'http://cdn.leafletjs.com/leaflet-0.5.1/leaflet'
    },
	shim: {
		leaflet: {
			exports: 'L'
		}
	}
});

define('app_options', {
	search_url: '/search_venues.php'
});

// Start loading the main app file. Put all of
// your application logic in there.
require(['main']);
