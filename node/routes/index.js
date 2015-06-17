// routes/index.js
(function () {
    "use strict";
	var express = require('express'),
		router = express.Router(),
		path = require("path"),
		common = require("../common.js");

    router.get('/json/parametry.json', function (req, res) {
		odsw_par_i_podstaw_wer_jezyk("parametry", ".json", common.czytajPlikParametrowWiz, function (text) {
			res.jsonp(text);
		});
    });

    router.get('/json/sygnaly.json', function (req, res) {
		odsw_par_i_podstaw_wer_jezyk("sygnaly", ".json", common.czytajPlikSygnalow, function (text) {
			res.jsonp(text);
		});
    });

    router.get('/json/komunikaty.json', function (req, res) {
		odsw_par_i_podstaw_wer_jezyk("komunikaty", ".json", null, function (text) {
			res.jsonp(JSON.parse(text));
		});
    });

    router.get('/json/konfiguracja.json', function (req, res) {
		odsw_par_i_podstaw_wer_jezyk("konfiguracja", ".json", null, function (text) {
			if (text !== null) {
	//			text = text.replace(new RegExp('"czyNaviRamkaPLC":true', 'g'), '"czyNaviRamkaPLC":false');
				text = text.replace(new RegExp('"verSerwer":"0.0.0"', 'g'), '"verSerwer":"' + process.env.WER_NODE + '"');
				text = text.replace(new RegExp('"WER_NODE":"0.0.0"', 'g'), '"WER_NODE":"' + process.env.WER_NODE + '"');
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

	/**
	 * Description
	 * @method odsw_par_i_podstaw_wer_jezyk
	 * @param {} fileName
	 * @param {} fileType
	 * @param {} edit_fun
	 * @param {} callback
	 */
	function odsw_par_i_podstaw_wer_jezyk(fileName, fileType, edit_fun, callback){
		parametry.odswierzParametry(function (temp) {
			if (!temp || (typeof temp === 'string')) {
//				console.log("TCP - Brak połączenia z PLC");
				callback("Brak połączenia z PLC (" + fileName + fileType + ")");
			} else {
//				console.log(typeof temp);
				var file_to_read = wer_jezykowa(temp, fileName, fileType);
//				console.log('file_to_read');
				if (file_to_read) {
					fs.readFile(file_to_read, 'utf8', function (err, text) {
						if (err) {
							callback(fileName + fileType + " error");
						} else {
							if (edit_fun) {
								callback(edit_fun(text, temp));
							} else {
								callback(text);
							}
						}
					});
				} else {
					callback("Błąd odczytu parametrow (" + fileName + fileType + ")");
				}
			}
		});
	
	}


	module.exports = router;
}());