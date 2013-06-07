define(
['jquery', 'router', 'app/event_dispatcher', 'view/app'],
function($, router, dispatcher, AppView) {

    var App = function() {
        this.router = router;
        this.dispatcher = dispatcher;
    };

    App.prototype.init = function(options) {
        this.options = options;
        this.appView = new AppView({
            el: $('#app')
        });
        this.router.start();
    };

    return new App();

});
