// main.js
(function () {
    "use strict";
	var glob_par = require('../par.js'),
		strada = require("./strada.js"),
		http = require("http"),
		strada_dane = require("./strada_dane.js"),
		parametry = require("./parametry.js"),
		webServer = require("./webServer.js"),
		zapis = require("./zapisDoPliku.js"),
		firstLoop = true,
		firstRun = true;

	webServer.StartServer();

//strada.startServer();

	strada.connect(function () {
		console.log('Strada Polaczono ....');
		firstLoop = true;
		parametry.odswierzParametry(function (gpar) {
			strada_dane.StartInterval(function (dane) {
				if (gpar) {
					if (glob_par.WEB_PROXY) {
						http.get("http://"+glob_par.WEB_PROXY.host+":"+glob_par.WEB_PROXY.port+glob_par.WEB_PROXY.path, function(res) {
							var body = '';
							res.on('data', function(chunk) {
								body += chunk;
							});
							res.on('end', function() {
								// console.log(body);
								webServer.emit(JSON.parse(body));
							});	
						}).on('error', function(e) {
							console.log("Got error: " + e.message);
						});
					} else {
						webServer.emit(dane);
					}
					if (! dane.error) {
						zapis.AppendFrame(dane, gpar, firstLoop);
					}
					firstLoop = false;
					firstRun = false;
				} else {
					console.log("Nie zapisano z powodu braku parametrow");
				}
			});
		}, firstRun);

	}, 0);
}());