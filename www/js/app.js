define(
['jquery', 'router', 'app/event_dispatcher', 'view/app'], 
function($, router, dispatcher, AppView) {

	var App = function() {
		this.router = router;
		this.dispatcher = dispatcher;
	};

	App.prototype.events = {
		'search': 'search'
	};

	App.prototype.init = function(options) {
		this.options = options;
		this.setupEvents();
		this.appView = new AppView({
			el: $('#app')
		});
		this.router.start();
	};

	App.prototype.setupEvents = function() {
		for (x in this.events) {
			var callback = this.events[x];
			this.dispatcher.on(x, this[callback], this);
		}
		$(document).ajaxStart(function() { dispatcher.trigger('ajax.start'); });
		$(document).ajaxComplete(function() { dispatcher.trigger('ajax.complete'); });
	};

	return new App();

});
