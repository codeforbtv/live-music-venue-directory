define(['underscore', 'leaflet', 'app/event_dispatcher', 'app/map/data/counties.geo.json.elastic'], function(_, L, dispatcher, counties_geo_json) {

    var apiKey = '6ded93aafce14dbeaf33173762046262',
        extend = _.extend,
        isEmpty = _.isEmpty;

    // MapService
    // Author: Ben Glassman <bglassman@gmail.com>
    var MapService = function(container, options) {
        var options = options || {};
        this.options = !isEmpty(options) ? extend(options, this.getDefaults()) : this.getDefaults();

        this.map = L.map(container);
        this.markerGroup = L.featureGroup().addTo(this.map);
        this.popupGroup = L.featureGroup().addTo(this.map).bringToFront();
        this.countyGroup = L.featureGroup().addTo(this.map).bringToBack();
        this.markers = {};
        console.log(this.options);

        // Set map view to vermont
        this.setDefaultView();
        L.tileLayer('http://{s}.tile.cloudmade.com/' + apiKey + '/997/256/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
            maxZoom: 18
        }).addTo(this.map);

        this.showCounties();
    };

    MapService.prototype.getDefaults = function() {
        return {
            popup_options: {
                offset: new L.Point(0, -33)
            }
        };
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

    MapService.prototype.getCountyGeoJsonByName = function(name) {
        for (x in this.counties) {
            if (this.counties[x].features[0].properties.name == name) {
                return this.counties[x];
            }
        }

        return false;
    };

    MapService.prototype.showCounties = function() {
        var _this = this;
        // County GeoJSON
        this.hideCounties();
        for (x in this.counties) {
            this.addCounty(this.counties[x]);
        }
        this.countiesVisible = true;
    };

    MapService.prototype.addCounty = function(county) {
        var _this = this;
        var countyLayer = L.geoJson(county);
        countyLayer.on('click', function(e) {
            this.hideCounties();
            this.focusCounty(county, countyLayer);
        }, this);
        this.countyGroup.addLayer(countyLayer);
    };

    MapService.prototype.focusCounty = function(county, layer) {
        // TODO: Should load a search for items within the bounds
        if (this.currentCountyLayer) this.map.removeLayer(this.currentCountyLayer);
        layer.setStyle({
            fillOpacity: 0
        });
        layer.off('click');
        this.currentCountyLayer = layer;
        layer.addTo(this.map);
        // this.countyGroup.addLayer(layer);
        this.map.fitBounds(layer.getBounds());
        this.countiesVisible = false;
        dispatcher.trigger('county.focus', county.features[0].properties);
    };

    MapService.prototype.hideCounties = function() {
        this.countyGroup.eachLayer(function(layer) {
            this.map.off('click', layer);
            this.countyGroup.removeLayer(layer);
        }, this);
        this.countiesVisible = false;
    };

    MapService.prototype.toggleCounties = function() {
        if (this.countiesVisible) {
            this.hideCounties();
        } else {
            this.showCounties();
        }
    };

    // Display venues on the map
    MapService.prototype.displayVenues = function(venues, options) {
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
            detailOpen = false,
            isOpen = false,
            _this = this;
        // TODO: Fix issue where clicking while hovered hides the popup for a second
        marker.bindPopup(venue.get('business_name'), this.options.popup_options);
        marker.on({
            mouseover: function(e) {
                if (detailOpen) return false;
                e.target.openPopup();
                isOpen = true;
            },
            mouseout: function(e) {
                e.target.closePopup();
                isOpen = false;
            },
            click: function(e) {
                var popup = L.popup({
                        offset: new L.Point(0, -30)
                    })
                    .setLatLng(new L.LatLng(venue.get('lat'), venue.get('lng')))
                    .setContent(['<h2>', venue.get('business_name'), '</h2><p>', venue.getFullAddress(), '<br />Phone: ', venue.get('phone'), '</p>'].join(''))
                _this.popupGroup.clearLayers();
                _this.popupGroup.addLayer(popup)
                e.target.closePopup();
                detailOpen = true;
            }
        });
        this.map.on('popupclose', function(e) { detailOpen = false; });
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
