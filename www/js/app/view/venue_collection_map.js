define(
['jquery', 'backbone', 'underscore', 'app/event_dispatcher', 'service/map_renderer'],
function($, Backbone, _, dispatcher, MapRenderer) {
	
	var VenueCollectionMapView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			this.map = new MapRenderer(this.el);
			// TODO: Implement this user a layer control in the map renderer;
			this.btnReset = $('<button id="btn-counties-toggle">Counties Off</button>').prependTo(this.$el);
			this.render(this.collection);
			dispatcher.on('county.focus', function(county) {
				this.btnReset.text('Counties On');
			}, this);
		},
		events: {
			'click #btn-counties-toggle': 'toggleCounties'
		},
		render: function() {
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
