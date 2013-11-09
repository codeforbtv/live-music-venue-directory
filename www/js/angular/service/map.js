app.factory('map', function($http) {
    var apiKey = '6ded93aafce14dbeaf33173762046262',
        extend = _.extend,
        isEmpty = _.isEmpty;

    // Manage grouped popups where only one can be open at a time
    var MapPopupGroupManager = function(map, options) {
        var options = options || {};
        this.map = map;
        if ( ! options.group) {
            throw new Error('Please specify options.group');
        }
        this.group = options.group;
    };

    MapPopupGroupManager.prototype = {
        currentPopup: null,
        openPopup: function(popup) {
            if (this.currentPopup) {
                this.closeCurrentPopup();
            }

            this.currentPopup = popup;

            this.group.addLayer(popup);
        },
        closePopup: function(popup) {
            this.group.removeLayer(popup);

            if (this.currentPopup === popup) {
                this.currentPopup = null;
            }
        },
        closeCurrentPopup: function() {
            if ( ! this.currentPopup) {
                return;
            }

            this.closePopup(this.currentPopup);
        }
    };

    // MapService
    // Author: Ben Glassman <bglassman@gmail.com>
    var MapService = function(container) {
        this.container = container;
        this.currentVenue = null;
        this.venueMarkerMap = {};
    };

    MapService.prototype = {

        init: function(options) {
            var options = options || {};
            this.options = !isEmpty(options) ? extend(options, this.getDefaults()) : this.getDefaults();

            this.map = L.map(this.container);

            this.markerGroup = L.featureGroup().addTo(this.map);

            this.venueDetailsPopupManager = new MapPopupGroupManager(this.map, {
                group: L.featureGroup().addTo(this.map).bringToFront()
            });

            this.venueSummaryPopupManager = new MapPopupGroupManager(this.map, {
                group: L.featureGroup().addTo(this.map).bringToFront()
            });

            // Set map view to vermont
            this.setDefaultView();
            L.tileLayer('http://{s}.tile.cloudmade.com/' + apiKey + '/997/256/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
                maxZoom: 18
            }).addTo(this.map);

            this.initDrawingControls();
        },

        initDrawingControls: function() {
            var _this = this;

            // Initialize the FeatureGroup to store editable layers
            var drawnItems = new L.FeatureGroup();
            this.map.addLayer(drawnItems);

            // Initialize the draw control and pass it the FeatureGroup of editable layers
            var drawControl = new L.Control.Draw({
                draw: {
                    position: 'topleft'
                },
                edit: {
                    featureGroup: drawnItems
                }
            });
            this.map.addControl(drawControl);

            this.map.on('draw:created', function (e) {
                drawnItems.clearLayers();

                var type = e.layerType,
                    layer = e.layer;

                if (type === 'marker') {
                    layer.bindPopup('A popup!');
                }

                drawnItems.addLayer(layer);

                $http
                    .post('/search_venues.php', {
                        bounds: JSON.stringify(layer.toGeoJSON())
                    })
                    .success(function(data) {
                        _this.displayVenues(data.results);
                    });
            });
        },

        getDefaults: function() {
            return {
                popup_options: {
                    offset: new L.Point(0, -33)
                }
            };
        },

        setDefaultView: function() {
            this.map.setView(new L.LatLng(43.871754,-72.447783), 7);
        },

        reset: function() {
            this.setDefaultView();
            this.clearMarkers();
            this.currentVenue = null;
        },

        // Display venues on the map
        displayVenues: function(venues) {
            var x;
            this.clearMarkers();
            for (x in venues) {
                this.addVenue(venues[x]);
            }
            this.fitToMarkerGroup();
        },

        // Add a venue to the map, with info popup
        addVenue: function(venue) {
            var marker = L.marker([venue.lat, venue.lng]),
                _this = this;
            marker.on({
                mouseover: function(e) {
                    _this.showVenueSummary(venue);
                },
                mouseout: function(e) {
                    _this.hideVenueSummary(venue);
                },
                click: function(e) {
                    _this.displayVenueDetail(venue);
                }
            });
            this.markerGroup.addLayer(marker);
            this.venueMarkerMap[venue.id] = marker;

            return marker;
        },

        createVenuePopup: function(venue, options) {
            var _this = this,
                options = options || {},
                popup = L.popup({
                    offset: new L.Point(0, -30)
                })
                .setLatLng(new L.LatLng(venue.lat, venue.lng))

            if (options.onClose) {
                popup.on('close', options.onClose);
            }

            if (options.group) {
                group.addLayer(popup);
            }

            return popup;
        },

        destroyVenuePopup: function(venue) {
            if ( ! this.venuePopupMap[venue.id]) {
                return false;
            }

            this.popupGroup.removeLayer(this.venuePopupMap[venue.id]);

            delete this.venuePopupMap[venue.id];

            return true;
        },

        displayVenueDetail: function(venue) {
            var _this = this,
                popup;
            
            popup = this.createVenuePopup(venue, {
                    onClose: function(e) {
                        _this.currentVenue = null;
                    }
                })
                .setContent(['<h2>', venue.business_name, '</h2><p>', 'Some address', '<br />Phone: ', venue.phone, '</p>'].join(''))

            this.venueDetailsPopupManager.openPopup(popup);
            this.hideVenueSummary(venue);

            this.currentVenue = venue;
        },

        showVenueSummary: function(venue) {
            if (this.isCurrentVenue(venue)) {
                return false;
            }

            var popup = this.createVenuePopup(venue)
                .setContent(venue.business_name);

            this.venueSummaryPopupManager.openPopup(popup);
        },

        hideVenueSummary: function(venue) {
            if (this.isCurrentVenue(venue)) {
                return false;
            }

            this.venueSummaryPopupManager.closeCurrentPopup();
        },

        isCurrentVenue: function(venue) {
            if (this.currentVenue !== null && this.currentVenue.id === venue.id) {
                return true;
            }

            return false;
        },

        getVenueMarker: function(venue) {
            return this.venueMarkerMap[venue.id];
        },

        // Clear markers
        clearMarkers: function() {
            this.markerGroup.clearLayers();
        },

        // Fit the map to markers
        fitToMarkerGroup: function() {
            // Note: Since map width is percent-based we have to invalidate size before fitting to bounds
            // Without the line below fitbounds will fit bounds based on the map size when the page first loaded
            this.map.invalidateSize();
            this.map.fitBounds(this.markerGroup.getBounds());
        }

    };

    return new MapService(document.getElementById('search-map'));
});
