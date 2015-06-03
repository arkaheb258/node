// main.js
(function () {
    "use strict";
	// var glob_par = require('../par.js');
	var strada = require("./strada.js");
	// var http = require("http");
	var strada_dane = require("./strada_dane.js");
	var parametry = require("./parametry.js");
	var webServer = require("./webServer.js");
	var zapis = require("./zapisDoPliku.js");
	var firstLoop = true,
		firstRun = true;

	// webServer.StartServer();

	strada.connect(function () {
		if (firstRun) {
			
		}
		console.log('Strada Polaczono ....');
		firstLoop = true;
		parametry.odswierzParametry(function (gpar) {
			strada_dane.StartInterval(function (dane) {
				if (gpar) {
					webServer.emit(dane);
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