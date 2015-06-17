// strada_rozk.js
(function () {
    "use strict";
	var common = require("./common.js");
		
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
