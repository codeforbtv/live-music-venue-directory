$(document).ready(function() {
	var apiKey = '6ded93aafce14dbeaf33173762046262',
		map = L.map('map_container'),
		searchForm = $('#search_form');

	// Set map view to vermont
	map.setView(new L.LatLng(43.871754,-72.447783), 7);
	L.tileLayer('http://{s}.tile.cloudmade.com/' + apiKey + '/997/256/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
		maxZoom: 18
	}).addTo(map);

	// Create map service for rendering venues to make
	var venueMapService = new MapService(map);

	// Do the search
	searchForm.on('submit', function(e) {
		e.preventDefault();
		$('body').addClass('two-col');
		venueMapService.displayVenues([
			{
				name: 'Higher Groud Music',
				lat: 44.468887,
				lng: -73.175640
			},
			{
				name: 'Flynn Theater',
				lat: 44.475795,
				lng: -73.213040
			},
			{
				name: 'Signal Kitchen',
				lat: 44.475425,
				lng: -73.216677
			}
		]);
	});

});
