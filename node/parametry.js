// parametry.js
(function () {
    'use strict';
	var argv = require('minimist')(process.argv.slice(2));
	var port = argv.port || 8888;
	var socket = require('socket.io-client')('http://127.0.0.1:' + port);
	var common = require('./common.js');
	var fs = require('fs');
	var freshPar = 0;

	/**
	 * Description
	 * @method pobierzParametryPLC
	 * @param {} stradaReadAll - funkcja odczytujaca obszary
	 * @param {} par
	 * @param {function} callback
	 */
	function pobierzParametryPLC(stradaReadAll, par, callback) {
		console.log('pobierzParametryPLC');
		stradaReadAll(0x307, 0, null, function (dane) {
			if (!dane || dane.error) {
				console.log('blad odczytu - readAll');
				if (callback) callback(null);
				return;
			}

			var temp =  decodeStrada307(dane, par);
			if (!temp) {
				console.log('Błędne parametry - 0x307');
			} else {
				console.log('0x307 - Struktura parametrów zgodna z danymi konfiguracyjnymi');
			}
			if (callback) callback(temp);
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
		// console.log('pobierzPlikParametrowLoc');
		var file = process.env.PARAM_LOC_FILE || 'default.json';
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
		// console.log('pobierzPlikParametrowFTP');
		common.pobierzPlikFTP({host : process.env.PLC_IP || '192.168.3.30', 
		user : 'admin', password : 'admin', file : 'ide/Parametry/Temp.par'},
		function (string) {
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
		fs.writeFile(filename, 
		JSON.stringify(temp).replace(/"WART":([-]?)(\d+),/g, '"WART":$1$2.0,'),
		function (err) {
			if (err) { console.log(err); } else { console.log('Zapisano parametry domyślne'); }
		});
	}

	function zapiszParametry(temp) {
		if (temp !== null) {
			zapiszParametryLoc(process.env.PARAM_LOC_FILE || 'default.json', temp);
			common.storeGpar(temp);
			freshPar = 2;
			setTimeout(function () {
				freshPar = 0;
			}, 1000);
			socket.emit('gpar', temp);
		}
	}
	
	/**
	 * Description
	 * @method pobierzParametryAll
	 * @param {} callback
	 * @param {} force
	 */
	function pobierzParametryAll(stradaReadAll, callback, force) {
		console.log('pobierzParametryAll ', force, ' ', freshPar);
		var temp = common.getGpar();
		if (!force && freshPar > 0) {
			socket.emit('gpar', temp);
			if (callback) { callback(temp); }
			return;
		}
		freshPar = 1;
		pobierzPlikParametrowLoc(function (par) {
			if (par && !force) {
				console.log('Wczytano parametry domyślne');
				pobierzParametryPLC(stradaReadAll, par, function (temp) {
					if (!temp) {
						console.log('Błędne parametry - pobranie struktury parametrów ze sterownika');
						pobierzPlikParametrowFTP(function (par2) {
							if (par2) {
								console.log('Pobrano parametry przez FTP');
								pobierzParametryPLC(stradaReadAll, par2, 
								function (temp) {
									zapiszParametry(temp);
									if (callback) { callback(temp); }
								});
							} else {
								var err = 'Nie pobrano parametrow przez FTP';
								console.log(err);
								freshPar = 0;
								if (callback) { callback({error: err}); }
								// socket.emit('gpar', {error: err});
							}
						});
					} else {
						zapiszParametry(temp);
						if (callback) { callback(temp); }
					}
				});
			} else {
				pobierzPlikParametrowFTP(function (par2) {
					if (par2) {
						console.log('Pobrano parametry przez FTP f');
						// console.log(par2.WER);
						pobierzParametryPLC(stradaReadAll, par2, function (temp) {
							zapiszParametry(temp);
							if (callback) { callback(temp); }
						});
					} else {
						var err = 'Nie pobrano parametrow przez FTP f';
						freshPar = 0;
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
	 * @param {Object} outPar
	 * @return outPar
	 */
	function decodeStrada307(buf, outPar) {
		var len, ptr = 0, temp, tempStr, ok = true;
		if (outPar && outPar.DANE) {
			len = outPar.DANE.length;
		} else {
			return null;
		}
		for (var i = 0; i < 5; i += 1) {
			tempStr = outPar.DANE[i];
			// console.log(tempStr);
			if (typeof buf === 'object' && buf.error !== undefined) {
				console.log('Błąd decodeStrada307 ' + i);
				console.log(buf);
				return null;
			}
			temp = common.readStringTo0(buf, i * 32, 32);
			// console.log(temp);
			if (temp !== tempStr.WART) { 
				ok = false; 
				console.log('[', i, '] ', tempStr.NAZ, 
				' zmiana z ', tempStr.WART, ' na ', temp); 
			}
		}

		//jeżeli zmiana komisji, typu, itd. to przerwać i zwrócić null
		if (ok === false) { return null; }

		ptr = 5 * 32;
		for (var i = 5; i < len; i += 1) {
			tempStr = outPar.DANE[i];
			if (buf.length < ptr + tempStr.ROZM * 2) { 
				ok = false; 
				console.log('błąd ilości parametrów (za mało) ' + i); 
				break; 
			}
	//		console.log(tempStr);
			if (tempStr.NAZ[0] === 's') {
				temp = common.readStringTo0(buf, ptr, tempStr.ROZM * 2);
			} else if (tempStr.NAZ[0] === 't') {
				if (tempStr.ROZM !== 2) { 
					tempStr.ROZM = 2; 
					console.log('[', i, '] ', tempStr.NAZ, ' - błąd rozmiaru TIME');
				}
				// temp = common.msToCodesysTime(buf.readInt32LE(ptr));
				temp = buf.readInt32LE(ptr) / 1000;
			} else {
				if (tempStr.ROZM === 1) { temp = buf.readInt16LE(ptr); } 
				else { temp = buf.readInt32LE(ptr); }
				if (tempStr.PREC) { temp /= Math.pow(10, tempStr.PREC); }
			}
			if (tempStr.NAZ[0] === 't' && (typeof tempStr.WART === 'string') && tempStr.WART[0] === 'T') {
				// console.log('[', i, '] ', tempStr.NAZ, ' porownanie ', tempStr.WART, ' z ', temp);
				tempStr.WART = common.codesysTimeToMs(tempStr.WART);
				outPar.DANE[i].WART = temp;
			}
			if (temp !== tempStr.WART) {
				console.log('[', i, '] ', tempStr.NAZ, 
				' zmiana z ', tempStr.WART, ' na ', temp);
				outPar.DANE[i].WART = temp;
			}
			ptr += parseFloat(tempStr.ROZM) * 2;
		}
		if (ptr !== buf.length) { ok = false; console.log('błąd ilości parametrów ', ptr, ' != ', buf.length); }

		//jeżeli błąd w rozmiarze czasu lub różna długość parametrów to przerwać i zwrócić null
		if (ok === false) { return null; }
		outPar.sKonfTypKombajnu = common.readStringTo0(buf, 0, 32);
		outPar.sKonfNrKomisji = common.readStringTo0(buf, 32, 32);
		outPar.sKonfNazwaKopalni = common.readStringTo0(buf, 64, 32);
		outPar.sKonfNrSciany = common.readStringTo0(buf, 96, 32);
		outPar.sKonfWersjaProgramu = common.readStringTo0(buf, 128, 32);
		return outPar;
	}

    module.exports.odswierzParametry = pobierzParametryAll;
}());
