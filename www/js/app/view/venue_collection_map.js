define(
['jquery', 'backbone', 'underscore', 'app/event_dispatcher', 'service/map_renderer'],
function($, Backbone, _, dispatcher, MapRenderer) {
	
	var VenueCollectionMapView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			this.map = new MapRenderer(this.el);
			// TODO: Implement this user a layer control in the map renderer;
			this.btnReset = $('<button id="btn-map-reset">Back to State View</button>').prependTo(this.$el);
			this.render(this.collection);
		},
		events: {
			'click #btn-map-reset': 'reset'
		},
		render: function() {
			if (!this.collection) return false;

			this.map.displayVenues(this.collection.models);
		},
		reset: function() {
			this.map.reset();
		}
	});

	return VenueCollectionMapView;

});
