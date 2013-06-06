define(['backbone'], function(Backbone) {

	return new (Backbone.Router.extend({
		routes: {
			"":"index"
		},
		start: function () {
			Backbone.history.start({ pushState: true });
		}
	}));

});
