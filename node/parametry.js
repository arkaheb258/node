// parametry.js
(function () {
    "use strict";
	var fs = require("fs"),
		strada = require("./strada.js"),
		strada_rozk = require("./strada_rozk.js"),
		common = require("./common.js"),
		glob_par = require('../par.js'),
		gpar = null,
		ftp = require("ftp");

	/**
	 * Description
	 * @method pobierzParametryPLC
	 * @param {} strada
	 * @param {} par
	 * @param {function} callback
	 
	 */
	function pobierzParametryPLC(strada, par, callback) {
		strada.readAll(0x307, 0, function (dane) {
			if (!dane || dane.error) {
				console.log("blad odczytu - readAll");
				callback(null);
				return;
			}

			var temp =  strada_rozk.decodeStrada307(dane, par);
			if (!temp) {
				console.log("Błędne parametry - 0x307");
			} else {
				console.log("0x307 - Struktura parametrów zgodna z danymi konfiguracyjnymi");
			}
			callback(temp);
		});
	}

	/**
	 * Description
	 * @method f_gpar
	 * @return gpar
	 */
	function f_gpar() {
		return gpar;
	}

	/**
	 * Description
	 * @method wyluskajParametry
	 * @param {} data
	 * @return out
	 */
	function wyluskajParametry(data) {
// return data;
		var js = JSON.parse(data),
			out = [],
			i,
			temp;
		if (js.DANE) {
			out = js;
			for (i in js.DANE) {
				if (js.DANE.hasOwnProperty(i)) {
					temp = js.DANE[i];
					switch (temp.NAZ) {
					case "sKonfTypKombajnu":
					case "rKonfWersjaJezykowa":
//						console.log(temp.WART);
					case "sKonfNrKomisji":
					case "sKonfNazwaKopalni":
					case "sKonfNrSciany":
					case "sKonfWersjaProgramu":
					case "rKonfCzasLetni":
					case "rKonfCzasStrefa":

						out[temp.NAZ] = temp.WART;
						break;
					case "rZapisTyp":


						out[temp.NAZ] = temp.WART;
						break;
					case "tZapisCzasZrzutu":
						out[temp.NAZ] = common.codesysTimeToMs(temp.WART);	
						break;
					default:
						break;
					}
				}
			}
		}
//console.error(out);
		return out;
	}

	/**
	 * Description
	 * @method pobierzPlikParametrowLoc
	 * @param {} file
	 * @param {} callback
	 
	 */
	function pobierzPlikParametrowLoc(file, callback) {
		fs.readFile(file, function (err, data) {
			if (err) {
				callback(null);
				return;
			}
			if (data.length > 0) { callback(wyluskajParametry(data)); } else { callback(null); }
		});
	}

	/**
	 * Description
	 * @method pobierzPlikParametrowFTP
	 * @param {} callback
	 
	 */
	function pobierzPlikParametrowFTP(callback) {
		common.pobierzPlikFTP({"host" : glob_par.PLC_IP, "user" : "admin", "password" : "admin", "file" : 'ide/Parametry/Temp.par'}, function (string) {
			if (string === false) {
				console.log("FTP par error");
				callback(null);
				return;
			}
			callback(wyluskajParametry(string));
		});
	}

	/**
	 * Description
	 * @method zapiszParametryLoc
	 * @param {} filename
	 * @param {} temp
	 
	 */
	function zapiszParametryLoc(filename, temp) {
		if (!temp) {
			console.log("Błąd parametrów - brak zapisu");
			return;
		}
		temp.DATA = (new Date()).toISOString().substring(0, 10);
		//podmiana wartości całkowitych x na x.0 wyrażeniem regularnym
		fs.writeFile(filename, JSON.stringify(temp).replace(/"WART":([-]?)(\d+),/g, '"WART":$1$2.0,'), function (err) {
			if (err) { console.log(err); } else { console.log("Zapisano parametry domyślne"); }
		});
	}

	/**
	 * Description
	 * @method pobierzParametryPLCWhile
	 * @param {} strada
	 * @param {} par2
	 * @param {} callback
	 
	 */
	function pobierzParametryPLCWhile(strada, par2, callback) {
		console.log("pobierzParametryPLCWhile");
		pobierzParametryPLC(strada, par2, function (temp) {
			console.log("pobierzParametryPLC...");
//			console.log(temp);
			if (temp !== null) { callback(temp); }
		});
	}

	/**
	 * Description
	 * @method pobierzParametryAll
	 * @param {} callback
	 * @param {} force
	 
	 */
	function pobierzParametryAll(callback, force) {
		pobierzPlikParametrowLoc(glob_par.PARAM_LOC_FILE, function (par) {
			if (par && !force) {
				console.log("Wczytano parametry domyślne");
				pobierzParametryPLC(strada, par, function (temp) {
					gpar = temp;
					if (!temp || !par) {
						console.log("Błędne parametry - pobranie struktury parametrów ze sterownika");
						pobierzPlikParametrowFTP(function (par2) {
	//						console.log(par2);
							if (par2) {
								console.log("Pobrano parametry przez FTP");
								pobierzParametryPLCWhile(strada, par2, function (temp) {
									gpar = temp;
									zapiszParametryLoc(glob_par.PARAM_LOC_FILE, temp);
									if (callback) { callback(temp); }
								});
							} else {
								console.log("Nie pobrano parametrow przez FTP");
								if (callback) { callback({error: "Nie pobrano parametrow przez FTP"}); }
							}
						});
					} else {
						console.log("Struktura parametrów zgodna z danymi konfiguracyjnymi");
						zapiszParametryLoc(glob_par.PARAM_LOC_FILE, temp);
						if (callback) { callback(temp); }
					}
				});
			} else {
				pobierzPlikParametrowFTP(function (par2) {
					if (par2) {
						console.log("Pobrano parametry przez FTP f");
						// console.log(par2.WER);
						pobierzParametryPLCWhile(strada, par2, function (temp) {
							gpar = temp;
							zapiszParametryLoc(glob_par.PARAM_LOC_FILE, temp);
							if (callback) { callback(temp); }
						});
					} else {
						console.log("Nie pobrano parametrow przez FTP f");
						if (callback) { callback({error: "Nie pobrano parametrow przez FTP f"}); }
					}
				});
			}
		});
	}

    module.exports.odswierzParametry = pobierzParametryAll;
    module.exports.gpar = f_gpar;
}());
