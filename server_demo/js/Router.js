VenuesApp = (Backbone.Router.extend({
    routes: {
        "demo/index-backbone.html":"index",
    },
    initialize: function () {
    },
    start: function () {
        Backbone.history.start({pushState: true});
    },
    index: function () {
        //default view
        startView = new StartView();
        startView.render();
    }
    //show: function (id) {
   //     var noteView = new NoteDetailView({model: this.noteList.get(id)});
   //     $("#app").html(noteView.render().el);
   // },
    //edit: function (id) {
    //    var noteView = new NoteEditView({model: this.noteList.get(id)});
    //    $("#app").html(noteView.render().el);
   // }
}));


var venuesApp = new VenuesApp();
venuesApp.start();
