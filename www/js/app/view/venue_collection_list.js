define(
['jquery', 'backbone', 'underscore', 'app/event_dispatcher', 'collection/venue', 'text!tpl/venue_collection_list.html'],
function($, Backbone, _, dispatcher, VenueCollection, tpl) {
	
	var VenueCollectionListView = Backbone.View.extend({
		events: {
			"mouseenter .venue": "venueHover",
			"mouseleave .venue": "venueHover"
		},
		initialize: function() {
			_.bindAll(this, 'render');
			this.render(this.collection);
		},
		render: function() {
			var compiled_template = _.template(tpl),
				data = { venues: this.collection ? this.collection.models : [] };

			this.$el.html(compiled_template(data));
		},
		// TODO:  Over/Out and Enter/Leave fire too frequently instead of once when mousing over the vneue and once when leaving due to bubbling;
		venueHover: function(e) {
			var target = e.target,
				venue_id = $(e.currentTarget).data('id');
			//if (e.type == 'mouseleave' && e.target.className.indexOf('.venue') == -1) return;

			dispatcher.trigger('venue.hover', {
				venue: this.collection.get(venue_id),
				event: e
			});
		}
	});

	return VenueCollectionListView;

});
