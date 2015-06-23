// parametry.js
(function () {
    'use strict';
	var fs = require('fs');
	var socket = require('socket.io-client')('http://127.0.0.1:' + (process.env.WEB_PORT || 8888));
	var common = require('./common.js');

	/**
	 * Description
	 * @method pobierzParametryPLC
	 * @param {} strada_readAll - funkcja odczytujaca obszary
	 * @param {} par
	 * @param {function} callback
	 */
	function pobierzParametryPLC(strada_readAll, par, callback) {
		strada_readAll(0x307, 0, function (dane) {
			if (!dane || dane.error) {
				console.log('blad odczytu - readAll');
				callback(null);
				return;
			}

			var temp =  decodeStrada307(dane, par);
			if (!temp) {
				console.log('Błędne parametry - 0x307');
			} else {
				console.log('0x307 - Struktura parametrów zgodna z danymi konfiguracyjnymi');
			}
			callback(temp);
		});
	}

	/**
	 * Description
	 * @method wyluskajParametry
	 * @param {} data
	 * @return out
	 */
	function wyluskajParametry(data) {
// return data;
		var js = JSON.parse(data);
		var out = [];
		if (js.DANE) {
			out = js;
			for (var i in js.DANE) {
				if (js.DANE.hasOwnProperty(i)) {
					var temp = js.DANE[i];
					switch (temp.NAZ) {
					case 'sKonfTypKombajnu':
					case 'rKonfWersjaJezykowa':
//						console.log(temp.NAZ, ': ', temp.WART);
					case 'sKonfNrKomisji':
					case 'sKonfNazwaKopalni':
					case 'sKonfNrSciany':
					case 'sKonfWersjaProgramu':
					case 'rKonfCzasLetni':
					case 'rKonfCzasStrefa':
						out[temp.NAZ] = temp.WART;
						break;
					case 'rZapisTyp':
						out[temp.NAZ] = temp.WART;
						break;
					case 'tZapisCzasZrzutu':
						out[temp.NAZ] = common.codesysTimeToMs(temp.WART.toString());
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
	 * @param {} callback
	 */
	function pobierzPlikParametrowLoc(callback) {
		var file = process.env.PARAM_LOC_FILE || 'default.json';
		// console.log('pobierzPlikParametrowLoc');
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) {
				callback(null);
				return;
			}
			if (data.length > 0) {
				callback(wyluskajParametry(data));
			} else {
				callback(null);
			}
		});
	}

	/**
	 * Description
	 * @method pobierzPlikParametrowFTP
	 * @param {} callback
	 */
	function pobierzPlikParametrowFTP(callback) {
		common.pobierzPlikFTP({host : process.env.PLC_IP || '192.168.3.30', user : 'admin', password : 'admin', file : 'ide/Parametry/Temp.par'}, function (string) {
			if (string === false) {
				console.log('FTP par error');
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
			console.log('Błąd parametrów - brak zapisu');
			return;
		}
		temp.DATA = (new Date()).toISOString().substring(0, 10);
		//podmiana wartości całkowitych x na x.0 wyrażeniem regularnym
		fs.writeFile(filename, JSON.stringify(temp).replace(/"WART":([-]?)(\d+),/g, '"WART":$1$2.0,'), function (err) {
			if (err) { console.log(err); } else { console.log('Zapisano parametry domyślne'); }
		});
	}

	/**
	 * Description
	 * @method pobierzParametryAll
	 * @param {} callback
	 * @param {} force
	 */
	function pobierzParametryAll(strada_readAll, callback, force) {
		pobierzPlikParametrowLoc(function (par) {
			if (par && !force) {
				console.log('Wczytano parametry domyślne');
				pobierzParametryPLC(strada_readAll, par, function (temp) {
					if (!temp) {
						console.log('Błędne parametry - pobranie struktury parametrów ze sterownika');
						pobierzPlikParametrowFTP(function (par2) {
							if (par2) {
								console.log('Pobrano parametry przez FTP');
								pobierzParametryPLC(strada_readAll, par2, function (temp) {
									if (temp !== null) {
										zapiszParametryLoc(process.env.PARAM_LOC_FILE || 'default.json', temp);
										common.storeGpar(temp);
										socket.emit('gpar', temp);
									}
									if (callback) { callback(temp); }
								});
							} else {
								var err = 'Nie pobrano parametrow przez FTP';
								console.log(err);
								if (callback) { callback({error: err}); }
								// socket.emit('gpar', {error: err});
							}
						});
					} else {
						// console.log('Struktura parametrów zgodna z danymi konfiguracyjnymi');
						zapiszParametryLoc(process.env.PARAM_LOC_FILE || 'default.json', temp);
						common.storeGpar(temp);
						socket.emit('gpar', temp);
						if (callback) { callback(temp); }
					}
				});
			} else {
				pobierzPlikParametrowFTP(function (par2) {
					if (par2) {
						console.log('Pobrano parametry przez FTP f');
						// console.log(par2.WER);
						pobierzParametryPLC(strada_readAll, par2, function (temp) {
							if (temp !== null) {
								zapiszParametryLoc(process.env.PARAM_LOC_FILE || 'default.json', temp);
								common.storeGpar(temp);
								socket.emit('gpar', temp);
							}
							if (callback) { callback(temp); }
						});
					} else {
						var err = 'Nie pobrano parametrow przez FTP f';
						console.log(err);
						if (callback) { callback({error: err}); }
					}
				});
			}
		});
	}

	/**
	 * Description
	 * @method decodeStrada307
	 * @param {Buffer} buf
	 * @param {Object} out_par
	 * @return out_par
	 */
	function decodeStrada307(buf, out_par) {
		var len, ptr = 0, temp, temp_str, ok = true;
		if (out_par && out_par.DANE) {
			len = out_par.DANE.length;
		} else {
			return null;
		}
		for (var i = 0; i < 5; i += 1) {
			temp_str = out_par.DANE[i];
			// console.log(temp_str);
			if (typeof buf === 'object' && buf.error !== undefined) {
				console.log('Błąd decodeStrada307 ' + i);
				console.log(buf);
				return null;
			}
			temp = common.readStringTo0(buf, i * 32, 32);
			// console.log(temp);
			if (temp !== temp_str.WART) { ok = false; console.log('[' + i + '] ' + temp_str.NAZ + ' zmiana z ' + temp_str.WART + ' na ' + temp); }
		}

		//jeżeli zmiana komisji, typu, itd. to przerwać i zwrócić null
		if (ok === false) { return null; }

		ptr = 5 * 32;
		for (var i = 5; i < len; i += 1) {
			temp_str = out_par.DANE[i];
			if (buf.length < ptr + temp_str.ROZM * 2) { ok = false; console.log('błąd ilości parametrów (za mało) ' + i); break; }
	//		console.log(temp_str);
			if (temp_str.NAZ[0] === 's') {
				temp = common.readStringTo0(buf, ptr, temp_str.ROZM * 2);
			} else if (temp_str.NAZ[0] === 't') {
				if (temp_str.ROZM !== 2) { temp_str.ROZM = 2; console.log('[' + i + '] ' + temp_str.NAZ + ' - błąd rozmiaru TIME'); }
				// temp = common.msToCodesysTime(buf.readInt32LE(ptr));
				temp = buf.readInt32LE(ptr) / 1000;
			} else {
				if (temp_str.ROZM === 1) { temp = buf.readInt16LE(ptr); } else { temp = buf.readInt32LE(ptr); }
				if (temp_str.PREC) { temp /= Math.pow(10, temp_str.PREC); }
			}
			if (temp_str.NAZ[0] === 't' && (typeof temp_str.WART === 'string') && temp_str.WART[0] === 'T') {
				// console.log('[' + i + '] ' + temp_str.NAZ + ' porownanie ' + temp_str.WART + ' z ' + temp);
				temp_str.WART = common.codesysTimeToMs(temp_str.WART);
				out_par.DANE[i].WART = temp;
			}
			if (temp !== temp_str.WART) {
				console.log('[' + i + '] ' + temp_str.NAZ + ' zmiana z ' + temp_str.WART + ' na ' + temp);
				out_par.DANE[i].WART = temp;
			}
			ptr += parseFloat(temp_str.ROZM) * 2;
		}
		if (ptr !== buf.length) { ok = false; console.log('błąd ilości parametrów ' + ptr + ' != ' + buf.length); }

		//jeżeli błąd w rozmiarze czasu lub różna długość parametrów to przerwać i zwrócić null
		if (ok === false) { return null; }
		out_par.sKonfTypKombajnu = common.readStringTo0(buf, 0, 32);
		out_par.sKonfNrKomisji = common.readStringTo0(buf, 32, 32);
		out_par.sKonfNazwaKopalni = common.readStringTo0(buf, 64, 32);
		out_par.sKonfNrSciany = common.readStringTo0(buf, 96, 32);
		out_par.sKonfWersjaProgramu = common.readStringTo0(buf, 128, 32);
		return out_par;
	}

    module.exports.odswierzParametry = pobierzParametryAll;
}());
