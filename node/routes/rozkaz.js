// routes/rozkaz.js
(function () {
    "use strict";
	var express = require('express'),
		socket = require('socket.io-client')('http://127.0.0.1:'+(process.env.PORT || 8888)),
		router = express.Router(),
		url = require("url"),
	    instrID = 0,
		fs = require('fs'),
		os = require('os'),
		parametry = require("../parametry.js"),
		// strada_rozk = require("../strada_rozk.js"),
		// strada_dane = require("../strada_dane.js"),
		// strada = require("../strada.js"),
		common = require("../common.js");
		
	var exec = require('child_process').exec;
	function execute(command, callback){
		exec(command, function(error, stdout, stderr){ callback(stdout); });
	};			
	
	//TODO: uzgodnic kształt informacji o wersji sprzętu (Beagle, Olimex, Tinycore) i serwera(/git-revision.sh ) i IP (/sbin/ifconfig eth0 | sed '/inet\ /!d;s/.*r://g;s/\ .*//g')
    router.get('/hardware.json', function (req, res) {
		var data = "0.8.34";
		var ip = "192.168.x.x";
		var err = null;
		if (process.platform === "linux") {
			// execute('cat /etc/dogtag', console.log);
			 // /sbin/ifconfig eth0 | sed '/inet\ /!d;s/.*r://g;s/\ .*//g'
			// fs.readFile('~/kopex/git-revision.sh', 'utf8', function (err,data) {
				// console.log(data);
				ip = os.networkInterfaces().eth0[0].address;
				if (err) {
					res.jsonp(({"error": err}));
				} else {
				}
			// });		
		}
		if (process.env.verSerwer)
			data = process.env.verSerwer;
		res.jsonp(({"os": process.platform, "verSerwer":data, "ip":ip, "host":os.hostname(), "hw": process.env.HW}));
	});

    router.get('/rozkaz3', function (req, res) {
		// webServer.AddUrl('/rozkaz', function (jsonp, res, get) {
			var get = url.parse(req.url, true).query,
				end = true,
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
		});

    router.get('/rozkaz', function (req, res) {
		var get = url.parse(req.url, true).query;
		instrID = (instrID + 1) % 0x10000;
		get.instrID = instrID;
		console.log(get);
		socket.emit("rozkaz", get);
		socket.on("odpowiedz", function(msg){
			if (msg.instrID == get.instrID) {
				// console.log(msg);
				res.jsonp(msg.dane);
			}
		});
	});
	
		
    router.get('/rozkaz2', function (req, res) {
		var get = url.parse(req.url, true).query,
			end = true,
			blok,
			tempBlock,
			gpar,
			dataa,
			d,
			n,
			typ,
			plik,
			kierunek,
			temp,
			error = null;
		console.log(get);
		// console.log("get.rozkaz");
		switch (get.rozkaz) {
		case "ustawBlokade":
			end = false;
//			res.jsonp(("ustawiam blokade"));
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
					res.jsonp("BLOK_OK");
				} else if (dane.dane) {
					res.jsonp(dane.dane);
				} else if (dane.error) {
					res.jsonp(dane.error);
				} else {
					res.jsonp("Error Node 202");
				}
			});
			break;
		case "ustawCzas":
			if (isNaN(get.wartosc)) {
				res.jsonp(("NaN"));
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
			res.jsonp(("OK"));
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
					res.jsonp(("PAR_OK"));
				} else if (dane.dane) {
					res.jsonp((dane.dane));
				} else if (dane.error) {
					res.jsonp((dane.error));
				} else {
					res.jsonp(("Error Node 500"));
				}
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
					res.jsonp(("OK"));
				} else if (dane.dane) {
					res.jsonp((dane.dane));
				} else if (dane.error) {
					res.jsonp((dane.error));
				} else {
					res.jsonp(("Error Node 502"));
				}
			});
			break;
		case "podajHistorie":
			end = false;
			strada.SendFunction(0x308, 0, function (dane) {
				res.jsonp((strada_rozk.decodeStrada308(dane.dane)));
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
					res.jsonp(("OK"));
				} else if (dane.dane) {
					res.jsonp((dane.dane));
				} else if (dane.error) {
					res.jsonp((dane.error));
				} else {
					res.jsonp(("Error Node 701"));
				}
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
					res.jsonp(("OK"));
				} else if (dane.dane) {
					res.jsonp((dane.dane));
				} else if (dane.error) {
					res.jsonp((dane.error));
				} else {
					res.jsonp(("Error Node 702"));
				}
			});
			console.log("liczniki end");
			break;
		default:
			error = {error: "nieznany typ"};
			break;
		}
		if (end) {
			if (error) { res.jsonp(({"error": error})); }
		}
    });

	module.exports = router;
}());
