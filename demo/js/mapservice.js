// MapService
// Author: Ben Glassman <bglassman@gmail.com>

var MapService = function(map) {
	this.map = map;
	this.markerGroup = L.featureGroup().addTo(map);
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
	var marker = L.marker([venue.lat, venue.lng]);
	marker.bindPopup(venue.name);
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
