app.factory('map', function() {
    var apiKey = '6ded93aafce14dbeaf33173762046262',
        extend = _.extend,
        isEmpty = _.isEmpty;

    // MapService
    // Author: Ben Glassman <bglassman@gmail.com>
    var MapService = function(container) {
        this.container = container;
        this.venueSummaryTimeout = null;
        this.currentVenue = null;
        this.venueMarkerMap = {};
        this.venuePopupMap = {};
    };

    MapService.prototype.init = function(options) {
        var options = options || {};
        this.options = !isEmpty(options) ? extend(options, this.getDefaults()) : this.getDefaults();

        this.map = L.map(this.container);
        this.markerGroup = L.featureGroup().addTo(this.map);
        this.popupGroup = L.featureGroup().addTo(this.map).bringToFront();

        // Set map view to vermont
        this.setDefaultView();
        L.tileLayer('http://{s}.tile.cloudmade.com/' + apiKey + '/997/256/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
            maxZoom: 18
        }).addTo(this.map);
    }

    MapService.prototype.getDefaults = function() {
        return {
            popup_options: {
                offset: new L.Point(0, -33)
            }
        };
    };

    MapService.prototype.setDefaultView = function() {
        this.map.setView(new L.LatLng(43.871754,-72.447783), 7);
    };

    MapService.prototype.reset = function() {
        this.setDefaultView();
        this.clearMarkers();
        this.currentVenue = null;
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
        var marker = L.marker([venue.lat, venue.lng]),
            _this = this;
        marker.on({
            mouseover: function(e) {
                clearTimeout(_this.venueSummaryTimeout);
                _this.venueSummaryTimeout = setTimeout(function() {
                    _this.showVenueSummary(venue);
                }, 250);
            },
            mouseout: function(e) {
                clearTimeout(_this.venueSummaryTimeout);
                _this.venueSummaryTimeout = setTimeout(function() {
                    _this.hideVenueSummary(venue);
                }, 250);
            },
            click: function(e) {
                _this.displayVenueDetail(venue);
            }
        });
        this.markerGroup.addLayer(marker);
        this.venueMarkerMap[venue.id] = marker;

        return marker;
    };

    MapService.prototype.displayVenueDetail = function(venue) {
        var _this = this,
            popup = L.popup({
                offset: new L.Point(0, -30)
            })
            .setLatLng(new L.LatLng(venue.lat, venue.lng))
            .setContent(['<h2>', venue.business_name, '</h2><p>', 'Some address', '<br />Phone: ', venue.phone, '</p>'].join(''))
            .on('close', function(e) {
                _this.currentVenue = null;
            });
            console.log('with popupclose event');
        this.hideVenueSummary(venue);
        this.popupGroup.clearLayers();
        this.popupGroup.addLayer(popup)
        this.currentVenue = venue;
    }

    MapService.prototype.showVenueSummary = function(venue) {
        if (this.currentVenue !== null && this.currentVenue.id == venue.id) {
            return false;
        }

        var marker = this.getMarkerByVenueId(venue.id);
        var popup = L.popup({
                offset: new L.Point(0, -30)
            })
            .setLatLng(new L.LatLng(venue.lat, venue.lng))
            .setContent(venue.business_name);
        this.popupGroup.clearLayers()
        this.popupGroup.addLayer(popup);
    }

    MapService.prototype.hideVenueSummary = function(venue) {
        this.getMarkerByVenueId(venue.id).closePopup();
    }

    MapService.prototype.getMarkerByVenueId = function(venue_id) {
        return this.venueMarkerMap[venue_id];
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

    return new MapService(document.getElementById('search-map'));
});
