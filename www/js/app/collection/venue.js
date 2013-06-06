define(
['backbone', 'model/venue'],
function(Backbone, Venue) {

var VenueCollection = Backbone.Collection.extend({
	model: Venue
});

return VenueCollection;

});
