define(
['backbone', 'underscore', 'service/map_renderer'],
function(Backbone, _, MapRenderer) {
	
	var VenueCollectionMapView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			this.map = new MapRenderer(this.el);
			this.render(this.collection);
		},
		render: function(collection) {
			var collection = collection || this.collection;
			if (!collection) return false;

			this.map.displayVenues(collection.models);
		}
	});

	return VenueCollectionMapView;

});
