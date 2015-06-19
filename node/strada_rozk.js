// strada_rozk.js
(function () {
    "use strict";
	var socket = require('socket.io-client')('http://127.0.0.1:'+(process.env.PORT || 8888)),
		strada = require("./main.js"),
		// zamienic strada.SendFunction na strada_SendFunction
		common = require("./common.js");

	socket.on('gpar', function (gpar) {
		console.log("storeGpar");
		// common.storeGpar(gpar);
	});		
	
	function emitSIN(dane, msg){
		if ((dane.error === 0) || (dane.error === null) || (dane.error === undefined)) {
			msg.dane = "PAR_OK";
		} else if (dane.dane) {
			msg.dane = dane.dane;
		} else if (dane.error) {
			msg.dane = dane.error;
		} else {
			msg.dane = "Error Node SIN";
		}
		socket.emit("odpowiedz", msg);
	}

	socket.on("rozkaz", function(get){
		var msg = {};
		msg.instrID = get.instrID;
		switch (get.rozkaz) {
		case "podajHistorie":
			strada.SendFunction(0x308, 0, function (dane) {
				msg.dane = decodeStrada308(common.getGpar(), dane.dane);
				socket.emit("odpowiedz", msg);
			});
			break;
		case "ustawCzas":
			var temp = get.wartosc / 1000;
			//konwersja czas lokalny -> UTC
			var d = new Date(temp * 1000);
			var n = d.getTimezoneOffset();
			var dataa = new Date();

			d.setMonth(0);
			n -= d.getTimezoneOffset();
			var gpar = common.getGpar();
			if (gpar) {
				if (gpar.rKonfCzasStrefa !== undefined) { temp -= (gpar.rKonfCzasStrefa - 12) * 3600; }
				if (gpar.rKonfCzasLetni) { temp += n * 60; }
			}
			dataa.setTime(temp * 1000);
			if (temp < 0) {
				msg.dane = "NaN";
				socket.emit("odpowiedz", msg);
			} else {
				console.log("Ustawienie nowego czasu: ", dataa);
				common.set_time(dataa);
				strada.SendFunction(0x201, temp, function (dane) {
					console.log("dane 201", dane);
					if (!dane.error){
						msg.dane = "OK";
						socket.emit("odpowiedz", msg);
					}
				});
			}
			break;
		case "ustawBlokade":
			if (get.dostep === "User") {
				get.dostep = "Usr";
			}
			var blok = "Block" + get.dostep;
			//dodać kontrolę poprawności zmiennej "blok"
			var tempBlock = common.getDane()[blok];
			temp = {};
			if (get.wartosc === "1") {
				tempBlock[parseInt(get.slowo, 10)] |= 1 << get.bit;
			} else {
				tempBlock[parseInt(get.slowo, 10)] &= ~(1 << get.bit);
			}
			temp[blok] = tempBlock;
			strada.SendFunction(0x202, temp, function (dane) {
				console.log("dane 202");
				console.log(dane);
				emitSIN(dane, msg);
			});
			break;
		case "ustawParametr":
			var typ = "STRING";
			if (get.typ === "pCzas") {
				typ = "TIME"; //wartosc w sekundach
			} else if (get.typ === "pLiczba") {
				typ = "REAL";
			} else if (get.typ === "pLista") {
//				typ = "LISTA";				//Błąd w dokumentacji Strada do wersji (1.2.2 włącznie)
				typ = "REAL";
			}
			strada.SendFunction(0x500, {NAZ: get.id, TYP: typ, WART: get.wartosc}, function (dane) {
				console.log("dane 500");
				console.log(dane);
				emitSIN(dane, msg);
				socket.emit("get_gpar");
			}, 10000);
			break;
		case "ustawPlik":
			var plik = 0;
			var kierunek = 0;
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
				emitSIN(dane, msg);
			});
			break;
		case "kalibracja":
			console.log("kalibracja 2");
			console.log(get.napedId);
			console.log(get.pozycja * 100);
			strada.SendFunction(0x701, [parseInt(get.napedId, 10), parseFloat(get.pozycja) * 100], function (dane) {
				console.log("dane 701");
				console.log(dane);
				emitSIN(dane, msg);
			}, 10000);
			console.log("kalibracja end");
			break;
		case "liczniki":
			console.log("liczniki");
			console.log(get.rozkazId);
			console.log(get.wartosc);
			strada.SendFunction(0x702, [parseInt(get.rozkazId, 10), parseFloat(get.wartosc)], function (dane) {
				console.log("dane 702");
				console.log(dane);
				emitSIN(dane, msg);
			});
			console.log("liczniki end");
			break;
		case "statusWeWyBloku_310":
			console.log(get.rozkaz);
			console.log(get.uiCzytajObszarNr);
			console.log(get.sIDbloku);
			strada.SendFunction(0x310, [parseInt(get.uiCzytajObszarNr, 10), get.sIDbloku], function (dane) {
				console.log("dane 310");
				console.log(dane);
				emitSIN(dane, msg);
			});
			// msg.dane = "Nieznany rozkaz";
			// socket.emit("odpowiedz", msg);
			break;
		case "eks_520":
			console.log(get.rozkaz);
			console.log(get.wActivID);// identyfikator rozkazu (np 2001 dla prac miesięcznych)
			strada.SendFunction(0x520, [parseInt(get.wActivID, 10)], function (dane) {
				console.log("dane 520");
				console.log(dane);
				emitSIN(dane, msg);
			});
			break;
		case "trybSerwisowy":
			console.log(get.rozkaz);
			console.log(get.aktywuj);
			console.log(get.wTrybCiagnikowId);
			msg.dane = "Nieznany rozkaz";
			socket.emit("odpowiedz", msg);
			break;

		case "miejsceSterPosuw_207":
		case "trybPracyPosuw_208":
		case "trybPracyCiagniki_209":
		case "calkDystKomb_20C":
		case "kanalSSRK_216":
		case "typSkrawu_21B":
		case "fazaSkrawu_21C":
		case "autoFazaSkrawu_21D":
		case "zewnSystSter_221":
		case "trybHydr_222":
		case "daneWizDodatkowe_31A":
		case "testHamulca_401":
		case "podajNazwyPlikow_601":
		case "podajNazwePliku_603":
			console.log(get.rozkaz);
			console.log(get.wWartosc);
			strada.SendFunction(parseInt(get.rozkaz.split('_')[1], 16), [parseInt(get.wWartosc, 10), 0], function (dane) {
				console.log(dane);
				emitSIN(dane, msg);
			});
			break;

		case "nrSekcji_204":
		case "czasPracy_20A":
		case "czasJazdy_20B":
		case "sterReflektorami_402":
		case "kalibracjeEnk_404":
			console.log(get.rozkaz);
			console.log(get.wWartosc);
			console.log(get.wID);
			strada.SendFunction(parseInt(get.rozkaz.split('_')[1], 16), [parseFloat(get.wWartosc), parseInt(get.wID, 10)], function (dane) {
				console.log(dane);
				emitSIN(dane, msg);
			});
			break;
			
		case "plikSkrawuWz_600":
		case "skasujPlik_604":
		case "nowyPlik_606":
			console.log(get.rozkaz);
			console.log(get.sWartosc);
			strada.SendFunction(parseInt(get.rozkaz.split('_')[1], 16), get.sWartosc, function (dane) {
				console.log(dane);
				emitSIN(dane, msg);
			});
			break;

		case "zerujLicznikiDzien_403":
		case "skasujAktywnyPlik_602":
			console.log(get.rozkaz);
			strada.SendFunction(parseInt(get.rozkaz.split('_')[1], 16), null, function (dane) {
				console.log(dane);
				emitSIN(dane, msg);
			});
			break;

		case "zmienNazwePliku_605":
			console.log(get.rozkaz);
			console.log(get.sNazwaPlikuOld);
			console.log(get.sNazwaPlikuNew);
			strada.SendFunction(parseInt(get.rozkaz.split('_')[1], 16), [get.sNazwaPlikuOld, get.sNazwaPlikuNew], function (dane) {
				console.log(dane);
				emitSIN(dane, msg);
			});
			break;
			
		default:
			msg.dane = "Nieznany rozkaz";
			socket.emit("odpowiedz", msg);
			break;
	}
	});
		
	/**
	 * Description
	 * @method encodeStrada202
	 * @param {Object} data
	 * @return out_buff
	 */
	function encodeStrada202(data) {
		var out_buff,
			bw;
		if (!data.BlockUsr) {
			console.log("Brak BlockUsr");
			data.BlockUsr = [];
		}
		// else
		if (!data.BlockSrvc) {
			console.log("Brak BlockSrvc");
			data.BlockSrvc = [];
		}
		// else
		if (!data.BlockAdv) {
			console.log("Brak BlockAdv");
			data.BlockAdv = [];
		}
		// else
	// {
		bw = new common.BlockRW();
		out_buff = bw.write(data.BlockUsr, false);
		out_buff = Buffer.concat([out_buff, bw.write(data.BlockSrvc, false)]);
		out_buff = Buffer.concat([out_buff, bw.write(data.BlockAdv, false)]);

		if (out_buff.length % 4) {
			out_buff = Buffer.concat([out_buff, new Buffer([0, 0])]);
		}
		return out_buff;
	//	}
//		return [];
	}

	/**
	 * Description
	 * @method decodeStrada308
	 * @param {Buffer} dane
	 * @return out
	 */
	function decodeStrada308(gpar, dane) {
		var i = 0,
			temp,
			d,
			n,
			out = [];
		while (i < dane.length) {
			temp = {};
			temp.nr = dane.readUInt16LE(i) & 0x7FFF;
			if (dane.readUInt16LE(i) > 0x8000) {
				temp.typ = "Ostrzeżenie";
			} else {
				temp.typ = "Alarm";
			}
			i += 2;
			temp.czas = dane.readUInt32LE(i) * 1000;
			i += 4;
			if (temp.czas === 0 && temp.nr === 0) {
				break;
			}
			d = new Date(temp.czas);
			n = d.getTimezoneOffset();
			d.setMonth(0);
			n -= d.getTimezoneOffset();
			if (gpar) {
				if (gpar.rKonfCzasStrefa !== undefined) {
					temp.czas += (gpar.rKonfCzasStrefa - 12) * 3600000;
				}
				if (gpar.rKonfCzasLetni) {
					temp.czas -= n * 60000;
				}
			}
			out.push(temp);
		}
		return out;
	}

    module.exports.encodeStrada202 = encodeStrada202;
    module.exports.decodeStrada308 = decodeStrada308;
}());
