define(['backbone'], function(Backbone) {
	var Venue = Backbone.Model.extend({
		urlRoot: '/venue/:slug',
		defaults: {
			name: '',
			address: '',
			address2: '',
			city: '',
			state: '',
			zip: '',
			lat: '',
			lon: ''
		},
		getFullAddress: function() {
			var parts = [this.attributes.address];
			if (this.attributes.address2) parts.push(this.attributes.address2);
			parts.push(this.attributes.city + ',', this.attributes.state, this.attributes.zip);
			return parts.join(' ');
		}
	});

	return Venue;
});
