define(['backbone'], function(Backbone) {

	return new (Backbone.Router.extend({
		routes: {
			"":"index",
			"venue/:slug":"venueDetail",
			"list/foo":"listFoo"
		},
		start: function () {
			Backbone.history.start({ pushState: true });
		},
		index: function () {
			console.log('Router.index, go!');
		},
		listFoo: function () {
			console.log('list the foo');
		}
	}));

});
