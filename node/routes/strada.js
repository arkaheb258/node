// routes/strada.js
(function () {
    "use strict";
	var express = require('express'),
		router = express.Router(),
		// strada_rozk = require("../strada_rozk.js"),
		// strada_dane = require("../strada_dane.js"),
		strada = require("../strada.js"),
		url = require("url");

    router.get('/rozkaz', function (req, res) {
		var get = url.parse(req.url, true).query,
			data,
			instrNo;
		if (get && get.data) {
			instrNo = parseInt(get.instrNo, 16);
			data = JSON.parse(get.data);
		} else {
			res.status(404);
			res.render('error', { error: "Brak wymaganych parametrów." });
			return;
		}

//			console.log(data);
		switch (instrNo) {
		case 0x201:	//Zapisz datę i czas.
		case 0x202:	//Zapisz aktualne blokady. - tymczasowo do testów
		case 0x203:	//Zapisz aktualny język.
		case 0x204:	//Zapisz aktualny numer sekcji.
		case 0x207:	//Zapisz miejsce sterowanie posuwem.
		case 0x208:	//Zapisz tryb pracy posuwu.
		case 0x209:	//Zapisz tryb pracy ciągników.
		case 0x20A:	//Zapisz całkowity czas pracy kombajnu.
		case 0x20B:	//Zapisz całkowity czas jazdy kombajnu.
		case 0x20C:	//Zapisz całkowity dystans kombajnu.
		case 0x216:	//Zapisz kanał radiowy SSRK. (1-69)
		case 0x21B:	//Zapisz typ skrawu wzorcowego.
		case 0x21C:	//Zapisz fazę skrawu wzorcowego.
		case 0x21D:	//Zapisz auto fazę skrawu wzorcowego.
		case 0x221:	//Zapisz miejsce sterowania kombajnu przez zewnętrzny system sterowania
		case 0x222:	//Zapisz tryb pracy pomp hydrauliki.
		case 0x310:	//Podaj status wejść/wyjść wybranego bloku.
		case 0x401:	//Testuj hamulec.
		case 0x402:	//Sterowanie reflektorami.
		case 0x403:	//Zeruj liczniki dzienne.
		case 0x404:	//Kalibracja czujnika położenia napędów hydraulicznych
		case 0x500:	//Podaj status wejść/wyjść wybranego bloku.
		case 0x502:	//Obsluga plików parametrów
		case 0x600:	//Zapisz nazwę pliku Skrawu Wzorcowego wybranego przez użytkownika. (ustaw aktywny)
		case 0x601:	//Podaj nazwy plików Skrawu Wzorcowego.
		case 0x602:	//Skasuj aktywny plik Skrawu Wzorcowego i usuń dane Skrawu z pamięci.
		case 0x603:	//Podaj nazwę aktualnego pliku Skrawu Wzorcowego.
		case 0x604:	//Skasuj plik Skrawu Wzorcowego (inny niż aktywny).
		case 0x605:	//Zmień nazwę pliku Skrawu Wzorcowego
		case 0x606:	//Stwórz nowy plik Skrawu Wzorcowego
			console.log("_" + instrNo);
			break;
		// case 0x302:	//Odczytanie obszaru danych wizualizacyjnych kombajnu
			// console.log("_0x302");
			// res.jsonp(JSON.parse(res.write(strada_dane.dane_json())));
			// instrNo = null;
			// break;
		// case 0x307:	//Odczytanie obszaru danych konfiguracyjnych
			// strada.readAll(instrNo, data, function (dane) {
				// res.jsonp(JSON.parse('{instNo:"' + get.instrNo + '",wynik:"' + JSON.stringify(strada_rozk.decodeStrada307(dane, parametry.gpar())) + '"}'));
			// });
			// instrNo = null;
			// break;
		// case 0x308:	//Podaj historię zdarzeń.
			// strada.readAll(instrNo, data, function (dane) {
				// res.jsonp(JSON.parse('{instNo:"' + get.instrNo + '",wynik:"' + JSON.stringify(strada_rozk.decodeStrada308(dane)) + '"}'));
			// });
			// instrNo = null;
			// break;
		default:
			instrNo = null;
			res.end();
			break;
		}
		if (instrNo) {
			strada.SendFunction(instrNo, data, function (dane) {
				res.jsonp(JSON.parse('{instNo:"' + get.instrNo + '",wynik:"' + dane.dane.toString() + '"}'));
			});
		}
//		return get;
    });

	module.exports = router;
}());