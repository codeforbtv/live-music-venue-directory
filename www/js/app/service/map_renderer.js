define(['leaflet'], function(L) {

	var apiKey = '6ded93aafce14dbeaf33173762046262';

	// MapService
	// Author: Ben Glassman <bglassman@gmail.com>
	// TODO: None of this map info should be hard coded, need a way to pass config through
	var MapService = function(container) {
		this.map = L.map(container);
		this.markerGroup = L.featureGroup().addTo(this.map);

		// Set map view to vermont
		this.map.setView(new L.LatLng(43.871754,-72.447783), 7);
		L.tileLayer('http://{s}.tile.cloudmade.com/' + apiKey + '/997/256/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
			maxZoom: 18
		}).addTo(this.map);
	};

	// Display venues on the map
	MapService.prototype.displayVenues = function(venues) {
		this.clearMarkers();
		for (x in venues) {
			this.addVenue(venues[x]);
		}
		this.fitToMarkerGroup();
	};

	// Add a venue to the map, with info popup
	MapService.prototype.addVenue = function(venue) {
		var marker = L.marker([venue.get('lat'), venue.get('lng')]);
		marker.bindPopup(venue.get('business_name'));
		this.markerGroup.addLayer(marker);

		return marker;
	};

	// Clear markers
	MapService.prototype.clearMarkers = function() {
		this.markerGroup.clearLayers();
	};

	// Fit the map to markers
	MapService.prototype.fitToMarkerGroup = function() {
		// Note: Since map width is percent-based we have to invalidate size before fitting to bounds
		// Without the line below fitbounds will fit bounds based on the map size when the page first loaded
		this.map.invalidateSize();
		this.map.fitBounds(this.markerGroup.getBounds());
	};

	return MapService;

});
