// strada_rozk.js
(function () {
    "use strict";
	var socket = require('socket.io-client')('http://127.0.0.1:'+(process.env.PORT || 8888)),
		strada = require("./main.js"),
		common = require("./common.js");

	socket.on('gpar', function (gpar) {
		console.log("storeGpar");
		// common.storeGpar(gpar);
	});		

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
				// console.log(gpar.rKonfCzasStrefa);
				// console.log(gpar.rKonfCzasLetni);
				// console.log(temp);
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
