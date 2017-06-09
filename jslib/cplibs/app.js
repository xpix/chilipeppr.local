// Makes sure we only run once jquery is loaded as well
// as ensuring we don't load javascript libraries multiple times
require(["jquery","bootstrap","amplify","google"], function() {
    
	console.log("ChiliPeppr Run-level 1: inside app.js define method...");
	
	// Define the top-level chiliPeppr object for
	// all main functionality of the Hardware Fiddle app
	chilipeppr = new function() {
		
		// Array to hold all panels
		this.panels = [];
		this.defines = {};
		
		// The load method that must be called when creating/loading a panel
		this.load = function(id, url) {
	
			var callback;
			
			// see if they want url content appended
			// this is known by just having 1 argument passed in 
			var isAppend = false;
			if (arguments.length == 1 || (arguments.length == 2 && typeof arguments[1] === 'function')) {
				isAppend = true;
				
				if (arguments.length == 2)
					callback = arguments[1];

				// make the url and id be the same value so we don't
				// load this element a 2nd time, i.e. we only support singletons
				url = id;
			}
			
			// see if they want a callback
			if (arguments.length == 3) {
				// they do
				callback = arguments[2];
			}
			
			// make sure there is a # at start of id (if not in append mode)
			if (!isAppend)
				if (!id.match(/^#/)) id = "#" + id;
			
			if (isAppend)
				console.log("Attempting to load URL:", url, "and prepend to start of body");
			else
				console.log("Attempting to load " + id + " at URL " + url);
			
			// make sure this id doesn't already exist
			for (var i = 0; i < this.panels.length; i++) {
				if (this.panels[i].id == id) {
					console.log("This panel " + id + " already exists. Still giving you a callback though.");
					if (callback) {
						//console.log("You asked for a callback. Here it is.");
						callback.apply();
					}
					return;
				}
			}
			
			// create new object representing this panel
			var panel = new function() {			
				this.id = "";
				this.url = "";
				this.isLoaded = false;
			}
			panel.id = id;
			panel.url = url;
			
			// push this panel on the stack
			this.panels.push(panel);
			
			// now load it
			// see if we're running inside jsfiddle
			// if so, just load direct since it's same domain
			var that = this;
			// fix for IE not have window.location.origin
			if (!window.location.origin) {
				window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
			}
			
			// see if memcache busting
			// if loading inside jsfiddle or cloud9, then we are not going thru
			// chilipeppr's /geturl proxy, so we can ignore 
			// but if loading from inside chilipeppr, then only bust if
			// in url has ?forcerefresh=true in it
			if (window.location.origin.indexOf("fiddle.jshell.net") != -1 ||
					window.location.origin.match(/c9users.io/i) ||
					window.location.origin.match(/localhost/) ) {
				console.log("We are doing a raw load (not via chilipeppr.com/geturl) cuz in jsfiddle, cloud9, or localhost. window.location.origin:", window.location.origin);
				$.get("//i2dcui.appspot.com/slingshot?url=" + panel.url, function(data) {
					data = that.cleanup(data);
					if (isAppend)
						$('body').prepend(data);
					else
				  		$(panel.id).html(data);
				  	console.log("Load of " + panel.id + " was performed via local jsfiddle/cloud9.");
					panel.isLoaded = true;
					if (callback) {
						//console.log("You asked for a callback. Here it is.");
						callback.apply();
					};
				});
			} else {
				// otherwise, load thru chiliPeppr geturl() method
				console.log("We are NOT doing a raw load (via chilipeppr.com/geturl) cuz NOT in jsfiddle, cloud9, or localhost. window.location.origin:", window.location.origin);
				
				// see if we need to memcache bust
				var bust = ""; 
				if (window.location.href.indexOf("forcerefresh=true") != -1) {
					// being asked to bust memcache
					console.log("Being asked to bust memcache cuz forcerefresh=true in window url");
					bust = "forcerefresh=true&";
				}
				
            // set to local directory if location == chilipeppr.local
            if( window.location.pathname.match(/chilipeppr.local/) && panel.url.match(/githubusercontent/)){
               // https://raw.githubusercontent.com/chilipeppr/widget-pubsubviewer/master/auto-generated-widget.html
               var res = panel.url.replace(/^.+widget\-/, "widgets/widget-");
               res = res.replace(/\/master/, "");
               panel.url = res;
               alert(panel.url);
            }
            
				//$.get("/geturl?" + bust + "url=" + panel.url, function(data) {
				//$.get("http://chilipeppr.com/geturl?" + bust + "url=" + panel.url, function(data) {
				$.get(panel.url, function(data) { // set for chilipeppr.local == pure url
					data = that.cleanup(data);
				  	if (isAppend)
						$('body').prepend(data);
					else
				  		$(panel.id).html(data);
				  	console.log("Load of " + panel.id + " was performed.");
					panel.isLoaded = true;
					if (callback) {
						//console.log("You asked for a callback. Here it is.");
						callback.apply();
					};
				});
			}
		};
		
		this.cleanup = function(html) {
			html = html.replace(/\/\/.*?\ncprequire_test/,"cprequire_test");
			html = html.replace(/cprequire_test\([\s\S]*\/\*end_test\*\/.*?\);\n*/i, "");
			html = html.replace(/<title>.*?<\/title>/i, "");
			html = html.replace(/<link.*?result-light.css.*?>/i, "");
			html = html.replace(/<link.*?bootstrap.min.css.*?>/i, "");
			html = html.replace(/<script.*?bootstrap.min.js.*?script>/i, "");
			html = html.replace(/<script.*?dummy.js.*?script>/i, "");
			html = html.replace(/<script.*?require.js.*?script>/i, "");
			html = html.replace(/<meta http-equiv="content-type" content="text\/html; charset=UTF-8">/i, "");
			html = html.replace(/(\r{0,1}\n\s*\r{0,1}\n\s*){3,}/, "\n\n");
			html = html.replace(/<meta name="robots" content="noindex, nofollow">/gi, "");
			html = html.replace(/<meta name="googlebot" content="noindex, nofollow">/gi, "");
			
			return html;
		};
		
		// Map amplify.js's pubsub calls to chiliPeppr
		// amplify.subscribe( string topic, function callback )
		// amplify.subscribe( string topic, object context, function callback )
		// amplify.subscribe( string topic, function callback, number priority )
		// amplify.subscribe(
		//    string topic, object context, function callback, number priority )
		//	}
		this.subscribe = function( topic, context, callback, priority ) {
			console.log("Got a subscribe call. topic:", topic);
			var args = Array.prototype.splice.call(arguments, 0);
			amplify.subscribe.apply( null, args );
		};
		
		this.publish = function( topic, data ) {
			var args = Array.prototype.splice.call(arguments, 0);
			console.log("Got a publish call. topic:", topic, " data:", data);
			amplify.publish.apply( null, args );
		};
		
		this.unsubscribe = function( topic, context, callback ) {
			console.log("Got an unsubscribe call. topic:", topic);
			var args = Array.prototype.splice.call(arguments, 0);
			amplify.unsubscribe.apply( null, args );
		};
	};
});
