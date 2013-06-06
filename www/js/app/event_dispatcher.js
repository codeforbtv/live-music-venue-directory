define(['backbone', 'underscore', 'require'], function() {
	var Backbone = require('backbone'),
	    _ = require('underscore');

	return _.extend({}, Backbone.Events);
});
