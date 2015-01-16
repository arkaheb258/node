// main.js
(function () {
    "use strict";
	var strada = require("./strada.js"),
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