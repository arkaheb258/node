// strada_rozk.js
(function () {
    "use strict";
	var common = require("./common.js"),
		parametry = require("./parametry.js");

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
	 * @method DecodeStrada302
	 * @param {Buffer} data
	 * @return ThisExpression
	 */
	function DecodeStrada302(data) {
		var br,
			TimeStamp,
			d,
			n,
			gpar,
			SpecData;
		if (data.length < 20) { return "ERROR"; }
		br = new common.BlockRW();
		TimeStamp = br.read(data);
		this.TimeStamp_s = (TimeStamp[1] << 16) + TimeStamp[0];
		this.TimeStamp_ms = (TimeStamp[3] << 16) + TimeStamp[2];
		this.TimeStamp_js = (this.TimeStamp_s * 1000 + this.TimeStamp_ms % 1000);

		//konwersja UTC -> czas lokalny
		d = new Date(this.TimeStamp_js);
		n = d.getTimezoneOffset();
		d.setMonth(0);
		n -= d.getTimezoneOffset();
		gpar = parametry.gpar();
		if (gpar) {
			if (gpar.rKonfCzasStrefa !== undefined) { this.TimeStamp_js += (gpar.rKonfCzasStrefa - 12) * 3600000; }
			if (gpar.rKonfCzasLetni) { this.TimeStamp_js -= n * 60000; }
			if (gpar.sKonfNrKomisji) { this.komisja = gpar.sKonfNrKomisji; }
		}
		SpecData = br.read(data);
		this.wDataControl = SpecData[0];
		this.wData = SpecData;
		br = new common.BlockRW(24);
		this.Analog = br.read(data, true);
		this.Bit = br.read(data);
		this.Mesg = br.read(data);
		this.MesgType = br.read(data);
		this.MesgStatus = br.read(data);
		this.BlockUsr = br.read(data);
		this.BlockSrvc = br.read(data);
		this.BlockAdv = br.read(data);
		return this;
	}

	/**
	 * Description
	 * @method decodeStrada307
	 * @param {Buffer} buf
	 * @param {Object} out_par
	 * @return out_par
	 */
	function decodeStrada307(buf, out_par) {
		var i, len, ptr = 0, temp, temp_str, ok = true;
		if (out_par && out_par.DANE) {
			len = out_par.DANE.length;
		} else {
			return null;
		}
		for (i = 0; i < 5; i += 1) {
			temp_str = out_par.DANE[i];
			// console.log(temp_str);
			if (typeof buf === "object" && buf.error !== undefined) {
				console.log("Błąd decodeStrada307 " + i);
				console.log(buf);
				return null;
			}
			temp = common.readStringTo0(buf, i * 32, 32);
			// console.log(temp);
			if (temp !== temp_str.WART) { ok = false; console.log("[" + i + "] " + temp_str.NAZ + " zmiana z " + temp_str.WART + " na " + temp); }
		}

		//jeżeli zmiana komisji, typu, itd. to przerwać i zwrócić null
		if (ok === false) { return null; }

		ptr = 5 * 32;
		for (i = 5; i < len; i += 1) {
			temp_str = out_par.DANE[i];
			if (buf.length < ptr + temp_str.ROZM * 2) { ok = false; console.log("błąd ilości parametrów (za mało) " + i); break; }
	//		console.log(temp_str);
			if (temp_str.NAZ[0] === "s") {
				temp = common.readStringTo0(buf, ptr, temp_str.ROZM * 2);
			} else if (temp_str.NAZ[0] === "t") {
				if (temp_str.ROZM !== 2) { temp_str.ROZM = 2; console.log("[" + i + "] " + temp_str.NAZ + " - błąd rozmiaru TIME"); }
				// temp = common.msToCodesysTime(buf.readInt32LE(ptr));
				temp = buf.readInt32LE(ptr) / 1000;
			} else {
				if (temp_str.ROZM === 1) { temp = buf.readInt16LE(ptr); } else { temp = buf.readInt32LE(ptr); }
				if (temp_str.PREC) { temp /= Math.pow(10, temp_str.PREC); }
			}
			if (temp_str.NAZ[0] === "t" && (typeof temp_str.WART === "string") && temp_str.WART[0] === "T") {
				// console.log("[" + i + "] " + temp_str.NAZ + " porownanie " + temp_str.WART + " z " + temp); 
				temp_str.WART = common.codesysTimeToMs(temp_str.WART);
				out_par.DANE[i].WART = temp;
			}
			if (temp !== temp_str.WART) {
				console.log("[" + i + "] " + temp_str.NAZ + " zmiana z " + temp_str.WART + " na " + temp);
				out_par.DANE[i].WART = temp;
			}
			ptr += parseFloat(temp_str.ROZM) * 2;
		}
		if (ptr !== buf.length) { ok = false; console.log("błąd ilości parametrów " + ptr + " != " + buf.length); }

		//jeżeli błąd w rozmiarze czasu lub różna długość parametrów to przerwać i zwrócić null
		if (ok === false) { return null; }
		out_par.sKonfTypKombajnu = common.readStringTo0(buf, 0, 32);
		out_par.sKonfNrKomisji = common.readStringTo0(buf, 32, 32);
		out_par.sKonfNazwaKopalni = common.readStringTo0(buf, 64, 32);
		out_par.sKonfNrSciany = common.readStringTo0(buf, 96, 32);
		out_par.sKonfWersjaProgramu = common.readStringTo0(buf, 128, 32);
		return out_par;
	}

	/**
	 * Description
	 * @method decodeStrada308
	 * @param {Buffer} dane
	 * @return out
	 */
	function decodeStrada308(dane) {
		var i = 0,
			temp,
			gpar,
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
			gpar = parametry.gpar();
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
    module.exports.DecodeStrada302 = DecodeStrada302;
    module.exports.decodeStrada307 = decodeStrada307;
    module.exports.decodeStrada308 = decodeStrada308;
}());
