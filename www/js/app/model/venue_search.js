define(['backbone'], function(Backbone) {
    var VenueSearch = Backbone.Model.extend({
        defaults: {
            location: ''
        }
    });

    return VenueSearch;
});
