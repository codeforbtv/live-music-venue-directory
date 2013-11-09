app.factory('Map', function($http, $rootScope, leafletApiKey) {
    var apiKey = leafletApiKey,
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
    var MapService = function(container, options) {
        this.container = container;
        this.options = ! isEmpty(options) ? extend(this.getDefaults(), options) : this.getDefaults();
        this.validateOptions(this.options);
        this.center = null;
    };

    MapService.prototype = {

        init: function(options) {
            this.currentResult = null;
            this.resultMarkerMap = {};

            this.map = L.map(this.container);

            this.markerGroup = L.featureGroup().addTo(this.map);

            this.resultDetailsPopupManager = new MapPopupGroupManager(this.map, {
                group: L.featureGroup().addTo(this.map).bringToFront()
            });

            this.resultSummaryPopupManager = new MapPopupGroupManager(this.map, {
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

        validateOptions: function(options) {
            var options = this.options;

            angular.forEach(['center', 'zoom', '$scope'], function(option) {
                if (options[option] === undefined) {
                    throw new Error('Please provide option ' + option);
                }
            });

            if ( ! this.options.center.lat) {
                throw new Error('Please provide a center with lat property');
            }
            if ( ! this.options.center.lon) {
                throw new Error('Please provide a center with lon property');
            }
        },

        initDrawingControls: function() {
            var _this = this;

            // Initialize the FeatureGroup to store editable layers
            var drawnItems = new L.FeatureGroup();
            this.map.addLayer(drawnItems);

            // Initialize the draw control and pass it the FeatureGroup of editable layers
            var drawControl = new L.Control.Draw({
                draw: {
                    polyline: false,
                    marker: false
                },
                edit: {
                    featureGroup: drawnItems,
                    edit: false
                }
            });
            this.map.addControl(drawControl);

            this.map.on('draw:created', function (e) {
                var $scope = _this.options.$scope;

                drawnItems.clearLayers();

                var type = e.layerType,
                    layer = e.layer;

                if (type === 'marker') {
                    layer.bindPopup('A popup!');
                }

                drawnItems.addLayer(layer);

                // TODO: This should probably just broadcast a search event with the criteria to be handled by the controller instead of doing the search itself.
                $http
                    .post('/search_venues.php', {
                        bounds: JSON.stringify(layer.toGeoJSON())
                    })
                    .success(function(data) {
                        $rootScope.$broadcast('resultsUpdated', data.results);
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
            this.map.setView(
                new L.LatLng(this.options.center.lat, this.options.center.lon),
                this.options.zoom
            );
        },

        reset: function() {
            this.setDefaultView();
            this.clearMarkers();
            this.currentResult = null;
        },

        // Display results on the map
        displayResults: function(results) {
            var x;
            this.clearMarkers();
            for (x in results) {
                this.addResult(results[x]);
            }
            this.fitToMarkerGroup();
        },

        // Add a result to the map, with info popup
        addResult: function(result) {
            var marker = L.marker([result.lat, result.lng]),
                _this = this;
            marker.result = result;
            marker.on({
                mouseover: function(e) {
                    _this.showResultSummary(result);
                },
                mouseout: function(e) {
                    _this.hideResultSummary(result);
                },
                click: function(e) {
                    _this.displayResultDetail(result);
                }
            });
            this.markerGroup.addLayer(marker);
            this.resultMarkerMap[result.id] = marker;

            return marker;
        },

        createResultPopup: function(result, options) {
            var _this = this,
                options = options || {},
                popup = L.popup({
                    offset: new L.Point(0, -30)
                })
                .setLatLng(new L.LatLng(result.lat, result.lng))

            if (options.onClose) {
                popup.on('close', options.onClose);
            }

            if (options.group) {
                group.addLayer(popup);
            }

            return popup;
        },

        destroyResultPopup: function(result) {
            if ( ! this.resultPopupMap[result.id]) {
                return false;
            }

            this.popupGroup.removeLayer(this.resultPopupMap[result.id]);

            delete this.resultPopupMap[result.id];

            return true;
        },

        displayResultDetail: function(result) {
            var _this = this,
                popup;
            
            popup = this.createResultPopup(result, {
                    onClose: function(e) {
                        _this.currentResult = null;
                    }
                })
                .setContent(['<h2>', result.business_name, '</h2><p>', 'Some address', '<br />Phone: ', result.phone, '</p>'].join(''))

            this.resultDetailsPopupManager.openPopup(popup);
            this.hideResultSummary(result);

            this.currentResult = result;
        },

        showResultSummary: function(result) {
            if (this.isCurrentResult(result)) {
                return false;
            }

            var popup = this.createResultPopup(result)
                .setContent(result.business_name);

            this.resultSummaryPopupManager.openPopup(popup);
        },

        hideResultSummary: function(result) {
            if (this.isCurrentResult(result)) {
                return false;
            }

            this.resultSummaryPopupManager.closeCurrentPopup();
        },

        isCurrentResult: function(result) {
            if (this.currentResult !== null && this.currentResult.id === result.id) {
                return true;
            }

            return false;
        },

        getResultMarker: function(result) {
            return this.resultMarkerMap[result.id];
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
            var bounds = this.markerGroup.getBounds();

            this.map.fitBounds(bounds);
        }

    };

    return MapService;
});
