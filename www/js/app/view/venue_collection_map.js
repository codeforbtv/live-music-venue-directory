define(
['backbone', 'underscore', 'app/event_dispatcher', 'service/map_renderer'],
function(Backbone, _, dispatcher, MapRenderer) {
	
	var VenueCollectionMapView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			this.map = new MapRenderer(this.el);
			this.render(this.collection);
		},
		render: function() {
			if (!this.collection) return false;

			this.map.displayVenues(this.collection.models);
		}
	});

	return VenueCollectionMapView;

});
