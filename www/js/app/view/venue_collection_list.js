define(
['backbone', 'underscore', 'collection/venue', 'text!tpl/venue_collection_list.html'],
function(Backbone, _, VenueCollection, tpl) {
	
	var VenueCollectionListView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			this.render(this.collection);
		},
		render: function(collection) {
			var compiled_template = _.template(tpl),
				collection = collection || this.collection,
				data = { venues: collection ? collection.models : [] };

			this.$el.html(compiled_template(data));
		}
	});

	return VenueCollectionListView;

});
