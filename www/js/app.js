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

	App.prototype.init = function() {
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

	App.prototype.search = function(criteria) {
		var _this = this;
		// TODO: Obviously this needs to not be hard coded, probably pass in via config?
		// Does this even belong here?
		$.getJSON('/data/venues.json', criteria, function(data) {
			_this.dispatcher.trigger('search.complete', data.results);
		});
	};

	App.prototype.foobar = function() {
		console.log('foobar beotch');
	};

	return new App();

});
