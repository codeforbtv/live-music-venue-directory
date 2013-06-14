define(
['jquery', 'backbone', 'underscore', 'app/event_dispatcher', 'service/map_renderer'],
function($, Backbone, _, dispatcher, MapRenderer) {
    
    var VenueCollectionMapView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render');
            this.map = new MapRenderer(this.el);
            // TODO: Implement this user a layer control in the map renderer? Doesnt seem to be possible with current leaflet api since you can't programmatically trigger toggling of layer controls.
            this.btnReset = $('<button id="btn-counties-toggle">Counties Off</button>').prependTo(this.$el);
            this.render(this.collection);
            dispatcher.on('county.focus', function(county) {
                dispatcher.trigger('search', { county_id: county.id });
                this.btnReset.text('Counties On');
            }, this);
        },
        events: {
            'click #btn-counties-toggle': 'toggleCounties'
        },
        render: function(options) {
            if (!this.collection) return false;

            this.map.displayVenues(this.collection.models);
        },
        toggleCounties: function() {
            this.map.toggleCounties();
            this.btnReset.text(this.map.countiesVisible ? 'Counties Off' : 'Counties On');
        }
    });

    return VenueCollectionMapView;

});
