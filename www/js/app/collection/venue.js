define(
['backbone', 'model/venue'],
function(Backbone, Venue) {

var VenueCollection = Backbone.Collection.extend({
	model: Venue,
	url: '/search_venues.php',
	parse: function(response) {
		return response.results;
	}
});

return VenueCollection;

});
