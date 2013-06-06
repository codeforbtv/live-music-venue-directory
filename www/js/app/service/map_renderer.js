define(['leaflet', 'app/event_dispatcher', 'app/map/data/counties.geo.json'], function(L, dispatcher, counties_geo_json) {

	var apiKey = '6ded93aafce14dbeaf33173762046262';

	// MapService
	// Author: Ben Glassman <bglassman@gmail.com>
	// TODO: None of this map info should be hard coded, need a way to pass config through
	var MapService = function(container) {
		this.map = L.map(container);
		this.markerGroup = L.featureGroup().addTo(this.map);
		this.markers = {};

		// Set map view to vermont
		this.setDefaultView();
		L.tileLayer('http://{s}.tile.cloudmade.com/' + apiKey + '/997/256/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
			maxZoom: 18
		}).addTo(this.map);

		this.showCounties();
	};

	MapService.prototype.counties = counties_geo_json;

	MapService.prototype.setDefaultView = function() {
		this.map.setView(new L.LatLng(43.871754,-72.447783), 7);
	};

	MapService.prototype.reset = function() {
		this.setDefaultView();
		this.showCounties();
		this.clearMarkers();
	};

	MapService.prototype.showCounties = function() {
		// County GeoJSON
		this.countyGroup = L.featureGroup().addTo(this.map).bringToBack();
		for (x in this.counties) {
			var county = L.geoJson(this.counties[x]);
			county.on('click', function(e) {
				console.log('clicked a county', e);
			});
			this.countyGroup.addLayer(county);
		}
	};

	MapService.prototype.hideCounties = function() {
		this.countyGroup.eachLayer(function(layer) {
			this.countyGroup.removeLayer(layer);
		}, this);
	};

	// Display venues on the map
	MapService.prototype.displayVenues = function(venues) {
		this.clearMarkers();
		this.hideCounties();
		for (x in venues) {
			this.addVenue(venues[x]);
		}
		this.fitToMarkerGroup();
	};

	// Add a venue to the map, with info popup
	MapService.prototype.addVenue = function(venue) {
		var marker = L.marker([venue.get('lat'), venue.get('lng')]),
			isOpen = false,
			_this = this;
		// TODO: Fix issue where clicking while hovered hides the popup for a second
		marker.bindPopup(venue.get('business_name'));
		marker.addEventListener({
			mouseover: function(e) {
				e.target.openPopup();
				isOpen = true;
			},
			mouseout: function(e) {
				e.target.closePopup();
				isOpen = false;
			}
		});
		// TODO: This should be moved out of the map renderer code into the map list
		dispatcher.on('venue.hover', function(data) {
			if (venue.get('id') == data.venue.get('id')) {
				switch (data.event.type) {
					case 'mouseenter':
						if (!isOpen) {
							marker.openPopup();
							isOpen = true;
						}
						break;
					case 'mouseleave':
						marker.closePopup();
						isOpen = false;
						break;
				}
			}
		});

		this.markerGroup.addLayer(marker);
		this.markers[venue.get('id')] = marker;

		return marker;
	};

	MapService.prototype.getMarkerByVenueId = function(venue_id) {
		return this.markers[venue_id];
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
