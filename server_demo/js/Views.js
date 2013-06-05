  var StartView = Backbone.View.extend({
    template: _.template($('#start-template').html()),
    el: $('#search_form'),
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    events: {
        'click #search_submit': 'search',
    },
    search: function () {
        console.log('search');
        searchView = new SearchView();
        console.log(searchView.render().$el);
        this.$el.append(searchView.render().$el);
        //this prevents the form from actually submitting
        return false;
    }
 });


  var SearchView = Backbone.View.extend({
    template: _.template($('#search-template').html()),
    el: $('#main_area'),
    render: function () {
        console.log("rendering search view");
        this.$el.html(this.template());
        return this;
    },
 });
