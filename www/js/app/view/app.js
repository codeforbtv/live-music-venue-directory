define(
['underscore', 'backbone', 'app/event_dispatcher', 'text!tpl/app.html', 'view/venue_search_form', 'collection/venue', 'view/venue_collection_list', 'view/venue_collection_map'],
function(_, Backbone, dispatcher, tpl, VenueSearchFormView, VenueCollection, VenueCollectionListView, VenueCollectionMapView) {

	var AppView = Backbone.View.extend({
		template: _.template(tpl),
		initialize: function(venue) {
			this.render();
			this.loadingMessage = this.$('#loading').hide();
			dispatcher.on('search.complete', this.searchComplete, this);
			dispatcher.on('ajax.start', this.ajaxStart, this);
			dispatcher.on('ajax.complete', this.ajaxComplete, this);
		},
		render: function() {
			this.$el.html(this.template());
			// TODO: Better way to handle subviews, LayoutManager?
			this.searchView = new VenueSearchFormView({
				el: this.$('#search-form')
			});
			this.mapView = new VenueCollectionMapView({
				el: this.$('#search-map')
			});
			this.listView = new VenueCollectionListView({
				el: this.$('#search-list')
			});
		}
	});

	AppView.prototype.searchComplete = function(venues) {
		if (venues.length) {
			this.$el.addClass('twocol');
			var venueCollection = new VenueCollection(venues);
			this.listView.render(venueCollection);
			this.mapView.render(venueCollection);
		} else {
			// TODO: Better handling for no results
			alert('No venues match your search');
		}
	};

	AppView.prototype.ajaxStart = function() {
		this.loadingMessage.show();
	};

	AppView.prototype.ajaxComplete = function() {
		this.loadingMessage.hide();
	};

	return AppView;
});
