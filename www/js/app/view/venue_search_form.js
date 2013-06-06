define(['jquery', 'underscore', 'backbone', 'mirui', 'text!tpl/venue_search_form.html', 'model/venue_search', 'app/event_dispatcher'], function($, _, Backbone, uri, tpl, VenueSearch, dispatcher) {

	var VenueSearchFormView = Backbone.View.extend({
		template: _.template(tpl),
		initialize: function(venue) {
			this.uri = new uri();
			this.model = new VenueSearch({
				location: this.uri.query('location')
			});
			this.render();
			this.$location = this.$el.find('#venue-search-form-location');
			this.$extra = this.$el.find('#venue-search-extra').hide();
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
		},
		events: {
			'submit #venue-search-form': 'search',
			'focus #venue-search-form-location': 'focus'
		},
		search: function(e) {
			e.preventDefault();
			// TODO: Validation
			dispatcher.trigger('search', { location: this.$location.val() });
			this.$extra.slideUp();
		},
		focus: function(e) {
			this.$extra.slideDown();
		}
	});

	return VenueSearchFormView;
});
