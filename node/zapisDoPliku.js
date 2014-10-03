// zapisDoPliku.js

(function () {
    "use strict";
    var fs = require("fs"),
		common = require("./common.js"),
		glob_par = require('../par.js'),
		parametry = require("./parametry.js"),
		cp = require("child_process"),
		prev_data;

    function createFile(fileName, par, czas) {
        console.log("Tworzenie pustego pliku danych: " + fileName);
        common.CreateDir(glob_par.LOGGER_DIR, function () {
//		if (true) {
			if (par) {
				var out_buff = new Buffer(255),
					adr = 0;
				out_buff.fill(0x20);
				out_buff.write("Typ kombajnu:\t\t" + par.sKonfTypKombajnu, adr);
				adr += 15 + 31;
				out_buff.write("\r\nNr komisji:\t\t" + par.sKonfNrKomisji, adr);
				adr += 15 + 31;
				out_buff.write("\r\nNazwa kopalni:\t\t" + par.sKonfNazwaKopalni, adr);
				adr += 18 + 31;
				out_buff.write("\r\nNr sciany:\t\t" + par.sKonfNrSciany, adr);
				adr += 14 + 31;
				out_buff.write("\r\nWersja programu:\t" + par.sKonfWersjaProgramu, adr);
				adr += 19 + 31;
				out_buff.write("\r\nCzas star.:", adr);
				adr += 13;
				out_buff.writeUInt32LE(czas, adr);        //epoch w sekundach
				adr += 4;
				out_buff.write("\r\n", adr);
				adr += 2;
				fs.writeFile(fileName, out_buff);
			} else {
				console.log("Błąd parametrów przy tworzeniu pliku");
			}
        });
    }

	function EmptyData() {
		return {
			TimeStamp_js: 0,
			Analog: [],
			Bit: [],
			Mesg: [],
			MesgType: [],
			MesgStatus: [],
			BlockUsr: [],
			BlockSrvc: [],
			BlockAdv: []
		};
	}

	function CopyData(src) {
		return {
			TimeStamp_js: src.TimeStamp_js,
			Analog: src.Analog.slice(),
			Bit: src.Bit.slice(),
			Mesg: src.Mesg.slice(),
			MesgType: src.MesgType.slice(),
			MesgStatus: src.MesgStatus.slice(),
			BlockUsr: src.BlockUsr.slice(),
			BlockSrvc: src.BlockSrvc.slice(),
			BlockAdv: src.BlockAdv.slice()
		};
	}

	function EncodeBlock(data, prev, offset, sign) {
		var len = data.length,
			i,
			count = 0,
			out_buff = new Buffer(4 * len);
        for (i = 0; i < len; i += 1) {
			if (prev[i] === undefined || prev[i] !== data[i]) {
				out_buff.writeUInt16LE(i + offset, 4 * count);        //id zmiennej
				if (sign) {
					out_buff.writeInt16LE(data[i], 4 * count + 2);        //wartosc zmiennej
				} else {
					out_buff.writeUInt16LE(data[i], 4 * count + 2);        //wartosc zmiennej
				}
				count += 1;
// console.log("EncodeBlock: " + len);
// console.log([i, count, data[i], prev[i]]);
			}
        }
		return out_buff.slice(0, count * 4);
	}

    function AppendAllFrame(data, par, forceAll) {
		var fileName,
			out_buff = new Buffer(10),
			adr = 0,
			out_buff_dane,
			countChange,
			d = new Date();

		if (!glob_par.LOGGER_DIR) {
			// console.log("skip logger");
			return;
		} else if (glob_par.LOGGER_DIR == "USB") {
			console.log("usb logger "+glob_par.LOGGER_DIR);
			glob_par.LOGGER_DIR = null;
			if (process.platform === "linux") {
				cp.exec("df | grep ^/dev/sd", function (error, stdout, stderr) {
					var poz = stdout.search("%");
					if (poz != -1) {
						var pen = stdout.substring(poz+2).trim();
						console.log("Znaleziono PENDRIVE: " + pen);
						cp.exec("mkdir " + pen + "/Rejestracja", function (error, stdout, stderr) {
							console.log(stdout);
							glob_par.LOGGER_DIR = pen + "/Rejestracja";
							if (stderr) { console.log("stderr: " + stderr); }
							if (error) { console.log("error 1: " + error); }					
						});
						
						// cp.exec("ls " + pen, function (error, stdout, stderr) {
							// console.log(stdout);
							// if (stderr) { console.log("stderr: " + stderr); }
							// if (error) { console.log("error: " + error); }					
						// });
					}
					if (stderr) { console.log("stderr: " + stderr); }
					if (error) { console.log("error 2: " + error); }
				});
			}
			return;
		}

        if (!data) {
			console.log("Brak danych");
			return;
        }

		d.setTime(data.TimeStamp_js);
		fileName = d.getUTCFullYear() + "_" + common.pad(d.getUTCMonth() + 1, 2) + "_" + common.pad(d.getUTCDate(), 2);
		
		// console.log(parametry.gpar().rZapisTyp === 1);
		if (parametry.gpar().rZapisTyp === 0) {
		// if (!glob_par.LOGGER_DAY_FILE) {
			fileName += "_" + common.pad(d.getUTCHours(), 2);
		}
		fileName += ".dat";
		
        if (glob_par.LOGGER_DIR) {
            fileName = glob_par.LOGGER_DIR + "/" + fileName;
        }

		if (!fs.existsSync(fileName)) {
			createFile(fileName, par, data.TimeStamp_s);
			prev_data.TimeStamp_js = 0;
			forceAll = true;
		}

		if (typeof parametry.gpar().tZapisCzasZrzutu !== 'number') {
			console.log("parametry.gpar().tZapisCzasZrzutu");
			console.log(parametry.gpar().tZapisCzasZrzutu);
			console.log(typeof parametry.gpar().tZapisCzasZrzutu);
		}
		// console.log(common.codesysTimeToMs(parametry.gpar().tZapisCzasZrzutu));
		// console.log(glob_par.LOGGER_ALL_FRAME_INTERVAL);
		
		// if (forceAll || (data.TimeStamp_js - prev_data.TimeStamp_js) > glob_par.LOGGER_ALL_FRAME_INTERVAL) {
		// if (forceAll || (data.TimeStamp_js - prev_data.TimeStamp_js) > common.codesysTimeToMs(parametry.gpar().tZapisCzasZrzutu)) {
		var czas_zrzutu = parametry.gpar().tZapisCzasZrzutu;
// console.log(forceAll);
// console.log(czas_zrzutu);
// console.log((data.TimeStamp_js - prev_data.TimeStamp_js));
		if (!czas_zrzutu) {czas_zrzutu = 60000};
		if (forceAll || ((data.TimeStamp_js - prev_data.TimeStamp_js) > czas_zrzutu)) {
			prev_data = new EmptyData();	// tylko przy zapisie całej ramki
//			console.log("adr "+adr);
			out_buff.writeUInt32LE(0xffffffff, adr);
			adr += 4;
		}

        out_buff.writeUInt32LE(data.TimeStamp_ms, adr);        //milisekund od polnocy
        adr += 4;

		out_buff_dane = new Buffer.concat([
			new EncodeBlock(data.Analog, prev_data.Analog, 1000, true),
			new EncodeBlock(data.Bit, prev_data.Bit, 2000),
			new EncodeBlock(data.Mesg, prev_data.Mesg, 3000),
			new EncodeBlock(data.MesgType, prev_data.MesgType, 4000),
			new EncodeBlock(data.MesgStatus, prev_data.MesgStatus, 5000),
			new EncodeBlock(data.BlockUsr, prev_data.BlockUsr, 6000),
			new EncodeBlock(data.BlockSrvc, prev_data.BlockSrvc, 7000),
			new EncodeBlock(data.BlockAdv, prev_data.BlockAdv, 8000)
		]);

        out_buff.writeUInt16LE(out_buff_dane.length / 4, adr);        //ilosc zmienionych danych
		adr += 2;
		out_buff = out_buff.slice(0, adr);
		out_buff = Buffer.concat([out_buff, out_buff_dane]);
		countChange = out_buff_dane.length / 4;
// console.log("countChange: " + countChange);
		if (countChange) {
			fs.appendFile(fileName, out_buff, function() {
				if (prev_data.TimeStamp_js === 0) {
					console.log("Zapis całej ramki do pliku: " + fileName + ", zmian = " + countChange);
				} else {
					console.log("Zapis zmian do pliku: " + fileName + ", zmian = " + countChange);
				}
			});
		}
		prev_data = CopyData(data)
    }
	prev_data = new EmptyData();

//    module.exports.CreateFile = createFile;
    module.exports.AppendFrame = AppendAllFrame;
}());
