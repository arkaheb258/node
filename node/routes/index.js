// routes/index.js
(function () {
    "use strict";
	var express = require('express'),
		router = express.Router(),
		glob_par = require('../../par.js'),
		path = require("path"),
		common = require("../common.js");

    router.get('/json/parametry.json', function (req, res) {
		common.odsw_par_i_podstaw_wer_jezyk("parametry", ".json", common.czytajPlikParametrowWiz, function (text) {
			res.jsonp(text);
		});
    });

    router.get('/json/sygnaly.json', function (req, res) {
		common.odsw_par_i_podstaw_wer_jezyk("sygnaly", ".json", common.czytajPlikSygnalow, function (text) {
			res.jsonp(text);
		});
    });

    router.get('/json/komunikaty.json', function (req, res) {
		common.odsw_par_i_podstaw_wer_jezyk("komunikaty", ".json", null, function (text) {
			res.jsonp(JSON.parse(text));
		});
    });

    router.get('/json/konfiguracja.json', function (req, res) {
		common.odsw_par_i_podstaw_wer_jezyk("konfiguracja", ".json", null, function (text) {
			if (text !== null) {
	//			text = text.replace(new RegExp('"czyNaviRamkaPLC":true', 'g'), '"czyNaviRamkaPLC":false');
				text = text.replace(new RegExp('"verSerwer":"0.0.0"', 'g'), '"verSerwer":"' + glob_par.WER_NODE + '"');
				text = text.replace(new RegExp('"WER_NODE":"0.0.0"', 'g'), '"WER_NODE":"' + glob_par.WER_NODE + '"');
			} else {
				text = "text null";
			}
			res.jsonp(JSON.parse(text));
		});
    });

    router.get('/exit', function (req, res) {
		res.jsonp('exit OK');
		process.exit(0);
	});

    router.get('/', function (req, res) {
        res.sendFile(path.resolve(glob_par.WEB_DIR + '/index.html'));
    });

	router.use(express.static(glob_par.WEB_DIR));
	router.use(express.static(__dirname + "/../../test"));
	
	module.exports = router;
}());