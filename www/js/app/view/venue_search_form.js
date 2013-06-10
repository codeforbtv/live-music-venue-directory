define(['jquery', 'underscore', 'backbone', 'mirui', 'text!tpl/venue_search_form.html', 'model/venue_search', 'app/event_dispatcher'], function($, _, Backbone, uri, tpl, VenueSearch, dispatcher) {

    var VenueSearchFormView = Backbone.View.extend({
        template: _.template(tpl),
        options: {
            'radius.choices': [5, 10, 15, 25, 50, 100]
        },
        initialize: function(venue) {
            this.uri = new uri();
            this.model = new VenueSearch({
                location: this.uri.query('location')
            });
            this.render();
            this.setupFields();
        },
        render: function() {
            this.$el.html(this.template(this.model.attributes));
        },
        events: {
            'submit #venue-search-form': 'search',
            'focus #venue-search-form-location': 'focus'
        },
        setupFields: function() {
            this.$location = this.$el.find('#venue-search-form-location');
            this.$extra = this.$el.find('#venue-search-extra').hide();
            this.$radius = this.$el.find('#venue-search-form-radius');
            var frag = document.createDocumentFragment();
            for (x in this.options['radius.choices']) {
                var rad = this.options['radius.choices'][x];
                var content = document.createElement('option');
                content.setAttribute('value', rad);
                content.appendChild(document.createTextNode(rad))
                frag.appendChild(content);
            }
            this.$radius.append(frag.cloneNode(true));
        },
        search: function(e) {
            e.preventDefault();
            dispatcher.trigger('search', { location: this.$location.val(), radius: this.$radius.val() }, { reset: true });
            this.$extra.slideUp();
        },
        focus: function(e) {
            this.$extra.slideDown();
        }
    });

    return VenueSearchFormView;
});
