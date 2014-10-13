// webServerPawel.js
(function () {
    "use strict";
	var
		fs = require("fs"),
		common = require("./common.js"),
		http = require("http"),
		exec = require('child_process').exec,
		glob_par = require('../par.js'),
		parametry = require("./parametry.js"),
		strada_rozk = require("./strada_rozk.js"),
		strada_dane = require("./strada_dane.js"),
		strada = require("./strada.js");

	if (!glob_par.WER_NODE) {
		glob_par.WER_NODE = "1.?.?";
	}

	function szukajPar(gpar, naz) {
		var i;
		if (gpar && gpar.DANE) {
			for (i in gpar.DANE) {
				if (gpar.DANE.hasOwnProperty(i) && gpar.DANE[i].NAZ === naz) { return gpar.DANE[i].WART; }
			}
		}
		return null;
	}

	function czytajPlikParametrowWiz(data, gpar) {
		var temp = null,
			g,
			p,
			s,
			js;
		try {
			js = JSON.parse(data);
			if (js.DANE) {
				for (g in js.DANE) {
					if (typeof js.DANE[g] === "object") {
						for (p in js.DANE[g]) {
							if (typeof js.DANE[g][p] === "object") {
								for (s in js.DANE[g][p]) {
									if (typeof js.DANE[g][p][s] === "object" && js.DANE[g][p][s].WART !== undefined) {
										// if (js.DANE[g][p][s].TYP === "pCzas") console.log(js.DANE[g][p][s].WART);
										temp = szukajPar(gpar, s);
										if (temp === null) {
											console.log("P - Nie znaleziono parametru \"" + s + "\"");
										} else if (js.DANE[g][p][s].WART !== temp) {
			//console.log(" "+ s + ": " + js.DANE[g][p][s].WART + " -> " + temp);
											js.DANE[g][p][s].WART = temp;
										}
									}
								}
							}
						}
					}
				}
			}
			return js;
		} catch (err) {
			console.log(data);
			return "Błąd pliku parametrów (JSON parser)";
		}
	}

	function czytajPlikSygnalow(data, gpar) {
		var temp = null,
			g,
			p,
			s,
			js = JSON.parse(data);
		if (typeof js === "object") {
			for (g in js) {
				if (typeof js[g] === "object") {
					for (p in js[g]) {
						//TODO: Paweł - poprawa reakcji na undefined przy odchudzonym pliku
						// if (js[g][p] === null) {
							// delete js[g][p];
						// } else 
						if (typeof js[g][p] === "string") {
							//TODO: Paweł - poprawa reakcji na undefined przy odchudzonym pliku
							// console.log(p+": "+js[g][p]);
							// if (js[g][p] === "") {
								// delete js[g][p];
							// } else 
							if (js[g][p].indexOf("_par_") === 0) {
								s = js[g][p].substr(5);
								temp = szukajPar(gpar, s);
								if (temp === null) {
									console.log("S - Nie znaleziono parametru \"" + s + "\"");
								} else {
		//							console.log(" "+ s + ": " + js[g][p] + " -> " + temp);
									js[g][p] = temp;
								}
							}
						}
					}
				}
			}
		}
		return js;
	}

	function czytajPlikKomunikatow(text, word) {
//		text = text.replace(/\t(.*)/mg, "$1");	//usuniecie tabulacji na początku wierszy
		var lines = text.split("\n"),
			output = [],
			l,
			nr,
			nb,
			bit,
			opis,
			out_string = "", //do generowania listy komunikatów dla serwisu
			i = 0;
		for (l in lines) {
			if (lines.hasOwnProperty(l)) {
				lines[l] = lines[l].trim();
				if (lines[l].search(";") !== -1 && lines[l].search("x") === 0) {
					nr = (i - (i % 16)) / 16;
					bit = (i % 16);
					opis = lines[l].substring(lines[l].search(/\(\*/g) + 2, lines[l].search(/\*\)/g)).trim();
					if (output[nr] === undefined) { output[nr] = {opis: "opis slowa " + nr, nr: nr, bity: []}; }
					if (opis.indexOf("_nb_") === 0) {
						opis = opis.substring(4).trim();
						nb = 1;
					} else {
						nb = 0;
					}
		//				output[nr].bity[bit] = {nr: nr, bit: bit, opis: opis};
					out_string += "Kod " + (nr * 16 + bit) + ": " + opis + "\n";
					output[nr].bity[bit] = {nb: nb, bit: bit, opis: opis};
					i += 1;
				}
			}
		}
		if (word) { return out_string; } //else { 
		return output; //}
	}

	function init(webServer) {
		webServer.AddUrl('/json/parametry.json', function (jsonp, res, get) {
			parametry.odswierzParametry(function (temp) {
				if (!temp) {
					console.log("TCP - Brak połączenia z PLC");
					res.write(JSON.stringify("Brak połączenia z PLC (parametry.json)"));
					res.end();
				} else if (glob_par.WEB_PAR_FTP) {
					common.pobierzPlikFTP({"host" : glob_par.PLC_IP, "user" : "admin", "password" : "admin", "file" : "flash/Wizualizacja/parametry.json"}, function (text) {
						var p;
						if (text !== false) {
							p = czytajPlikParametrowWiz(text, temp);
							if (temp.WER !== p.WER || temp.DATA !== p.DATA) { console.log("Nieprawidlowy plik parametrow"); }
							res.write(JSON.stringify(p));
							// res.end();
						} else {
							console.log("FTP - Błąd pobrania pliku parametry.json");
							res.write(JSON.stringify("Błąd pobrania pliku parametry.json"));
							// res.end();
						}
						res.end();
					}, true);
				} else {
					fs.readFile(glob_par.WEB_DIR + "/json/parametry.json", function (err, text) {
						if (err) {
							res.write(JSON.stringify("parametry.json error"));
//							throw err;
						}
						res.write(JSON.stringify(czytajPlikParametrowWiz(text, temp)));
						res.end();
					});
				}
			});
		});

		webServer.AddUrl('/json/sygnaly.json', function (jsonp, res, get) {
			// console.log("sygnaly.json 1");
			parametry.odswierzParametry(function (temp) {
				// console.log("sygnaly.json 2");
				var gpar = temp;
				if (!gpar) {
					// console.log("sygnaly.json 2a");
					console.log("TCP - Brak połączenia z PLC");
					res.write(JSON.stringify("Brak połączenia z PLC (sygnaly.json)"));
					res.end();
				} else if (glob_par.WEB_SYGN_FTP) {
					// console.log("sygnaly.json 2b");
					common.pobierzPlikFTP({"host" : glob_par.PLC_IP, "user" : "admin", "password" : "admin", "file" : "flash/Wizualizacja/sygnaly.json"}, function (text) {
						// console.log("sygnaly.json 3b");
						if (text !== false) {
							res.write(JSON.stringify(czytajPlikSygnalow(text, gpar)));
						} else {
							console.log("FTP - Błąd pobrania pliku sygnaly.json");
							res.write(JSON.stringify("Błąd pobrania pliku sygnaly.json"));
						}
						res.end();
					}, true);
				} else {
					// console.log("sygnaly.json 2c");
					fs.readFile(glob_par.WEB_DIR + "/json/sygnaly.json", function (err, text) {
						// console.log("sygnaly.json 3c");
						if (err) {
							res.write(JSON.stringify("sygnaly.json error"));
//							throw err;
						}
						res.write(JSON.stringify(czytajPlikSygnalow(text, gpar)));
						res.end();
					});
				}
			});
		});

		webServer.AddUrl('/json/komunikaty.json', function (jsonp, res, get) {
			if (glob_par.WEB_KOM_FTP) {
				common.pobierzPlikFTP({"host" : glob_par.PLC_IP, "user" : "admin", "password" : "admin", "file" : "flash/Wizualizacja/STR_KOMUNIKATY.EXP"}, function (text) {
					if (text !== false) {
						res.write(JSON.stringify(czytajPlikKomunikatow(text)));
					} else {
						console.log("FTP - Błąd pobrania pliku FTP STR_KOMUNIKATY.EXP");
						res.write(JSON.stringify("Błąd pobrania pliku STR_KOMUNIKATY.EXP"));
					}
					res.end();
				}, true);
			} else {
				fs.readFile(glob_par.WEB_DIR + "/json/STR_KOMUNIKATY.EXP", 'utf8', function (err, text) {
					if (err) {
						res.write(JSON.stringify("STR_KOMUNIKATY.EXP error"));
//						res.write(JSON.stringify(err));
//							throw err;
					} else {
						res.write(JSON.stringify(czytajPlikKomunikatow(text)));
					}
					res.end();
				});
			}
		});

		webServer.AddUrl('/json/komunikaty.txt', function (jsonp, res, get) {
			if (glob_par.WEB_KOM_FTP) {
				common.pobierzPlikFTP({"host" : glob_par.PLC_IP, "user" : "admin", "password" : "admin", "file" : "flash/Wizualizacja/STR_KOMUNIKATY.EXP"}, function (text) {
					if (text !== false) {
						res.write(czytajPlikKomunikatow(text, true));
					} else {
						console.log("FTP - Błąd pobrania pliku FTP STR_KOMUNIKATY.EXP");
						res.write(JSON.stringify("Błąd pobrania pliku STR_KOMUNIKATY.EXP"));
					}
					res.end();
				}, true);
			} else {
				fs.readFile(glob_par.WEB_DIR + "/json/STR_KOMUNIKATY.EXP", 'utf8', function (err, text) {
					if (err) {
						res.write(JSON.stringify("STR_KOMUNIKATY.EXP error"));
//						res.write(JSON.stringify(err));
//							throw err;
					} else {
						res.write(czytajPlikKomunikatow(text, true));
					}
					res.end();
				});
			}
		});

		webServer.AddUrl('/dane', function (jsonp, res, get) {
			if (jsonp) {
				res.write(jsonp + "(");
			}
			if (glob_par.WEB_PROXY) {
				var options = glob_par.WEB_PROXY;
				http.get(options, function (res2) {
					res2.on('data', function (chunk) {
						res.write(chunk);
					});
					res2.on('end', function (chunk) {
						if (jsonp) {
							res.write(")");
						}
						res.end();
					});
				}).on('error', function (e) {
					res.write(e.message);
					if (jsonp) {
						res.write(")");
					}
					res.end();
				});
			} else {
				res.write(strada_dane.dane_json());
				if (jsonp) {
					res.write(")");
				}
				res.end();
			}
		});

		// webServer.AddUrl('/skrypty/wspolne/zmienneGlobalneProxy.js', function (jsonp, res, get, req) {
		webServer.AddUrl('/skrypty/wspolne/zmienneGlobalne.js', function (jsonp, res, get, req) {
			fs.readFile(glob_par.WEB_DIR + '/skrypty/wspolne/zmienneGlobalne.js', 'utf8', function (err, text) {
				// console.log(res.socket._peername.address);
				// text = text.replace(new RegExp("127.0.0.1:8888", 'g'), "192.168.3.31:8888");
				// podstawienie (skasowanie) adresu serwera dla danych i rozkazow
				text = text.replace(new RegExp("http://127.0.0.1:8888/", 'g'), "");
				res.write(text);
				res.end();
			});
		});

		webServer.AddUrl("/json/konfiguracja_proxy.json", function (jsonp, res, get) {
			fs.readFile(glob_par.WEB_DIR + "/json/konfiguracja.json", 'utf8', function (err, text) {
				// console.log(res.socket._peername.address);
				// text = text.replace(new RegExp("127.0.0.1:8888", 'g'), "192.168.3.31:8888");
				// text = text.replace(new RegExp("127.0.0.1:8888", 'g'), res.socket._peername.address + ":8888");
				text = text.replace(new RegExp('"czyNaviRamkaPLC":true', 'g'), '"czyNaviRamkaPLC":false');
				text = text.replace(new RegExp('"verSerwer":"0.0.0"', 'g'), '"verSerwer":"' + glob_par.WER_NODE + '"');
				text = text.replace(new RegExp('"WER_NODE":"0.0.0"', 'g'), '"WER_NODE":"' + glob_par.WER_NODE + '"');
				res.write(text);
				res.end();
			});
		});

		webServer.AddUrl("/json/konfiguracja.json", function (jsonp, res, get) {
			fs.readFile(glob_par.WEB_DIR + "/json/konfiguracja.json", 'utf8', function (err, text) {
				text = text.replace(new RegExp('"verSerwer":"0.0.0"', 'g'), '"verSerwer":"' + glob_par.WER_NODE + '"');
				text = text.replace(new RegExp('"WER_NODE":"0.0.0"', 'g'), '"WER_NODE":"' + glob_par.WER_NODE + '"');
				res.write(text);
				res.end();
			});
		});

		webServer.AddUrl('/rozkaz', function (jsonp, res, get) {
			var end = true,
				blok,
				tempBlock,
				child,
				temptime,
				gpar,
				dataa,
				d,
				n,
				typ,
				plik,
				kierunek,
				temp,
				error = null;
			if (jsonp) {
				res.write(jsonp + "(");
			}
			console.log(get);
			switch (get.rozkaz) {
			case "ustawBlokade":
				end = false;
	//			res.write(JSON.stringify("ustawiam blokade"));
				if (get.dostep === "User") {
					get.dostep = "Usr";
				}
				blok = "Block" + get.dostep;
				//dodać kontrolę poprawności zmiennej "blok"
				tempBlock = JSON.parse(strada_dane.dane_json())[blok];
				temp = {};
				if (get.wartosc === "1") {
					tempBlock[parseInt(get.slowo, 10)] |= 1 << get.bit;
				} else {
					tempBlock[parseInt(get.slowo, 10)] &= ~(1 << get.bit);
				}
	//			console.log(tempBlock[get.slowo/1]);
				temp[blok] = tempBlock;
				strada.SendFunction(0x202, temp, function (dane) {
					console.log("dane 202");
					console.log(dane);
					if ((dane.error === 0) || (dane.error === null)) {
						res.write(JSON.stringify("BLOK_OK"));
					} else if (dane.dane) {
						res.write(JSON.stringify(dane.dane));
					} else if (dane.error) {
						res.write(JSON.stringify(dane.error));
					} else {
						res.write(JSON.stringify("Error Node 202"));
					}
					if (jsonp) {
						res.write(")");
					}
					res.end();
				});
				break;
			case "ustawCzas":
				if (isNaN(get.wartosc)) {
					res.write(JSON.stringify("NaN"));
					break;
				}

				temp = get.wartosc / 1000;

				//konwersja czas lokalny -> UTC
				d = new Date(temp * 1000);
				n = d.getTimezoneOffset();
				dataa = new Date();

				d.setMonth(0);
				n -= d.getTimezoneOffset();
				gpar = parametry.gpar();
				if (gpar) {
					if (gpar.rKonfCzasStrefa !== undefined) { temp -= (gpar.rKonfCzasStrefa - 12) * 3600; }
					if (gpar.rKonfCzasLetni) { temp += n * 60; }
				}
				dataa.setTime(temp * 1000);
				strada.SendFunction(0x201, temp, function (dane) {
					console.log("dane 201");
					console.log(dane);
				});
				common.set_time(dataa);
				res.write(JSON.stringify("OK"));
				break;
			case "ustawParametr":
				typ = "STRING";
				end = false;
				if (get.typ === "pCzas") {
					typ = "TIME";
					//wartosc w sekundach
				} else if (get.typ === "pLiczba") {
					typ = "REAL";
				} else if (get.typ === "pLista") {
//						typ = "LISTA";				//Błąd w dokumentacji Strada do wersji (1.2.2 włącznie)
					typ = "REAL";
				}
	//			else if (get.typ == "pString")
		// console.log(get);
//		console.log(get.typ);	//"pLiczba" (STRING,REAL,LISTA,TIME)
//		console.log(get.nazwa);	//"id"
		// console.log(get.wartosc);	//"id"
				strada.SendFunction(0x500, {NAZ: get.id, TYP: typ, WART: get.wartosc}, function (dane) {
					console.log("dane 500");
					console.log(dane);
					if ((dane.error === 0) || (dane.error === null)) {
						res.write(JSON.stringify("PAR_OK"));
					} else if (dane.dane) {
						res.write(JSON.stringify(dane.dane));
					} else if (dane.error) {
						res.write(JSON.stringify(dane.error));
					} else {
						res.write(JSON.stringify("Error Node 500"));
					}
					if (jsonp) {
						res.write(")");
					}
					res.end();
					parametry.odswierzParametry(function (temp) {});
				}, 10000);
				break;
			case "ustawPlik":
				end = false;
				plik = 0;
				kierunek = 0;
//		console.log(get);
				switch (get.plik) {
				case "default":
					plik = 1;
					break;
				case "user1":
					plik = 2;
					break;
				case "user2":
					plik = 3;
					break;
				case "user3":
					plik = 4;
					break;
				case "user4":
					plik = 5;
					break;
				case "user5":
					plik = 6;
					break;
				}
				if (get.akcja === "load") {
					kierunek = 1;
				} else if (get.akcja === "save") {
					kierunek = 2;
				}
				strada.SendFunction(0x502, [plik, kierunek], function (dane) {
					console.log("dane 502");
					console.log(dane);
					if ((dane.error === 0) || (dane.error === null) || (dane.error === undefined)) {
						res.write(JSON.stringify("OK"));
					} else if (dane.dane) {
						res.write(JSON.stringify(dane.dane));
					} else if (dane.error) {
						res.write(JSON.stringify(dane.error));
					} else {
						res.write(JSON.stringify("Error Node 502"));
					}
					if (jsonp) {
						res.write(")");
					}
					res.end();
				});
				break;
			case "podajHistorie":
				end = false;
				strada.SendFunction(0x308, 0, function (dane) {
					res.write(JSON.stringify(strada_rozk.decodeStrada308(dane.dane)));
					// res.write(JSON.stringify(out));
					if (jsonp) {
						res.write(")");
					}
					res.end();
	//				console.log(out);
	//				console.log("koniec dane");
				});
				break;
			case "kalibracja":
				end = false;
				console.log("kalibracja 2");
				console.log(get.napedId);
				console.log(get.pozycja * 100);
				strada.SendFunction(0x701, [parseInt(get.napedId, 10), parseFloat(get.pozycja) * 100], function (dane) {
					console.log("dane 701");
					console.log(dane);
					if ((dane.error === 0) || (dane.error === null) || (dane.error === undefined)) {
						res.write(JSON.stringify("OK"));
					} else if (dane.dane) {
						res.write(JSON.stringify(dane.dane));
					} else if (dane.error) {
						res.write(JSON.stringify(dane.error));
					} else {
						res.write(JSON.stringify("Error Node 701"));
					}
					if (jsonp) { res.write(")"); }
					res.end();
				}, 10000);
				console.log("kalibracja end");
				break;
			case "liczniki":
				end = false;
				console.log("liczniki");
				console.log(get.rozkazId);
				console.log(get.wartosc);
				strada.SendFunction(0x702, [parseInt(get.rozkazId, 10), parseFloat(get.wartosc)], function (dane) {
					console.log("dane 702");
					console.log(dane);
					if ((dane.error === 0) || (dane.error === null) || (dane.error === undefined)) {
						res.write(JSON.stringify("OK"));
					} else if (dane.dane) {
						res.write(JSON.stringify(dane.dane));
					} else if (dane.error) {
						res.write(JSON.stringify(dane.error));
					} else {
						res.write(JSON.stringify("Error Node 702"));
					}
					if (jsonp) { res.write(")"); }
					res.end();
				});
				console.log("liczniki end");
				break;
			default:
				error = {error: "nieznany typ"};
				break;
			}
			if (end) {
				if (error) { res.write(JSON.stringify({"error": error})); }
				if (jsonp) { res.write(")"); }
				res.end();
			}
		});

		webServer.AddUrl('/strada', function (jsonp, res, get) {
			var data,
				instrNo;
			if (get && get.data) {
				instrNo = parseInt(get.instrNo, 16);
				data = JSON.parse(get.data);
			} else {
				res.writeHead(404, {"Content-Type": "text/plain" });
				res.write("Brak wymaganych parametrów.");
				res.end();
				return;
			}

		//	console.log(get);
			console.log(data);
		//	console.log(instrNo);
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
			case 0x302:	//Odczytanie obszaru danych wizualizacyjnych kombajnu
				console.log("_0x302");
				if (jsonp) { res.write(jsonp + "("); }
				res.write(strada_dane.dane_json());
				if (jsonp) { res.write(")"); }
				res.end();
				instrNo = null;
				break;
			case 0x307:	//Odczytanie obszaru danych konfiguracyjnych
				strada.readAll(instrNo, data, function (dane) {
					if (jsonp) { res.write(jsonp + "("); }
					res.write('{instNo:"' + get.instrNo + '",wynik:"' + JSON.stringify(strada_rozk.decodeStrada307(dane, parametry.gpar())) + '"}');
					if (jsonp) { res.write(")"); }
					res.end();
				});
				instrNo = null;
				break;
			case 0x308:	//Podaj historię zdarzeń.
				strada.readAll(instrNo, data, function (dane) {
					if (jsonp) { res.write(jsonp + "("); }
					res.write('{instNo:"' + get.instrNo + '",wynik:"' + JSON.stringify(strada_rozk.decodeStrada308(dane)) + '"}');
					if (jsonp) { res.write(")"); }
					res.end();
				});
				instrNo = null;
				break;
			default:
				instrNo = null;
				res.end();
				break;
			}
			if (instrNo) {
				strada.SendFunction(instrNo, data, function (dane) {
					if (jsonp) { res.write(jsonp + "("); }
					res.write('{instNo:"' + get.instrNo + '",wynik:"' + dane.dane.toString() + '"}');
					if (jsonp) { res.write(")"); }
					res.end();
				});
			}
			return get;
		});
	}

    module.exports.init = init;
}());
