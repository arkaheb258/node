// common.js
(function () {
    "use strict";
	var http = require('http'),
		fs = require("fs"),
		glob_par = process.env,
		exec = require('child_process').exec,
		NTP_IP_i = 0,
		ftp = require("ftp");

	/**
	 * Description
	 * @method pad
	 * @param {} num
	 * @param {} size
	 * @return s
	 */
	function pad(num, size) {
		var s = num.toString();
		while (s.length < size) { s = "0" + s; }
		return s;
	}

	/**
	 * Description
	 * @method BlockRW
	 * @param {} adr
	 */
	function BlockRW(adr) {
		if (adr) {
			this.adr = adr;
		} else {
			this.adr = 0;
		}
	}

	/**
	 * Description
	 * @method read
	 * @param {} data
	 * @param {} sign
	 * @return Temp
	 */
	BlockRW.prototype.read = function (data, sign) {
		var Temp = [],
			i,
			Temp_Len = data.readUInt16LE(this.adr);
		this.adr += 2;
		if (Temp_Len > data.length) {
			console.error("Temp_Len " + Temp_Len);
			console.error("data.length " + data.length);
		}
		for (i = 0; i < Temp_Len; i = i + 2) {
			if (sign) {
				Temp.push(data.readInt16LE(i + this.adr));
			} else {
				Temp.push(data.readUInt16LE(i + this.adr));
			}
		}
		this.adr += Temp_Len;
		return Temp;
	};

	/**
	 * Description
	 * @method write
	 * @param {} tempBlock
	 * @param {} sign
	 * @return temp_out_buff
	 */
	BlockRW.prototype.write = function (tempBlock, sign) {
		var temp_out_buff,
			tempLen,
			i;

		tempLen = tempBlock.length;
		temp_out_buff = new Buffer(tempLen * 2 + 2);
		temp_out_buff.writeUInt16LE(tempLen * 2, 0);		//rozmiar bloku w bajtach !!! (zmiana 09-05-2004 po uzgodnieniu z Wieśkiem)
//		temp_out_buff.writeUInt16LE(tempLen, 0);
		for (i = 0; i < tempLen; i += 1) {
			if (sign) {
				temp_out_buff.writeInt16LE(tempBlock[i], i * 2 + 2);
			} else {
				temp_out_buff.writeUInt16LE(tempBlock[i], i * 2 + 2);
			}
		}
		return temp_out_buff;
	};

    /**
     * Description
     * @method CreateDir
     * @param {} dirName
     * @param {} callback
     * @param {} my_console
     */
    function CreateDir(dirName, callback, my_console) {
		if (!my_console) {my_console = console.log; }
		// my_console("CreateDir() " + dirName);
		try {
			fs.readdirSync(dirName);
			// my_console("CreateDir try callback");
			if (callback) { callback(); }
		} catch (err) {
			my_console("CreateDir catch");
			my_console(err);
			if (err.code === 'ENOENT') {
				fs.mkdirSync(dirName);
			} else {
				my_console(err);
			}
			// my_console("CreateDir catch callback");
			if (callback) { callback(); }
			return;
		// } finally {
			// my_console("CreateDir finally");
		}
	}

	/**
	 * Description
	 * @method pobierzPlikFTP
	 * @param {} con_par
	 * @param {} callback
	 * @param {} cache
	 */
	function pobierzPlikFTP(con_par, callback, cache) {
		var c = new ftp(),
			cache_file;
		if (glob_par.FTP_CACHE_DIR) {
			cache_file = glob_par.FTP_CACHE_DIR + '/' + con_par.file.replace(new RegExp("/", 'g'), "_");
		}
		c.on('ready', function () {
			c.get(con_par.file, function (err, stream) {
				if (err) {
					console.log("FTP error");
					console.log(err);
					callback(false);
					return;
//					throw err;
				}
	//            console.log("ftp");
				c.on('readable', function (dane) {
					var chunk;
					while (null !== (chunk = c.read())) {
						console.log('got %d bytes of data', chunk.length);
					}
				});
				var string = "";
				stream.on('data', function (response) {
					string += response;
					//console.log(response);
				});
				stream.once('close', function () {
					console.log("FTP pobrano " + con_par.file);
					callback(string);
					c.end();
				});
				// console.log("con_par.file " + con_par.file);
				if (cache && glob_par.FTP_CACHE_DIR) {
					stream.pipe(fs.createWriteStream(cache_file));
				}
			});
		});
		c.on('timeout', function () {
			console.log("FTP timeout");
			callback(false);
		});
		c.on('error', function () {
			console.log("FTP error");
			callback(false);
		});
		// console.log("cache");
		// console.log(cache);
		// console.log(glob_par.FTP_CACHE_DIR);
		if (cache && glob_par.FTP_CACHE_DIR) {
			CreateDir(glob_par.FTP_CACHE_DIR, function () {
				fs.readFile(cache_file, function (err, text) {
					if (err) {
						// throw err;
						console.log(err);
						c.connect({"host" : con_par.host, "user" : con_par.user, "password" : con_par.password, "connTimeout" : 2000, "pasvTimeout" : 2000});
					} else {
						console.log("FTP cache " + con_par.file);
						callback(text.toString());
					}
				});
			});
		} else {
			c.connect({"host" : con_par.host, "user" : con_par.user, "password" : con_par.password, "connTimeout" : 2000, "pasvTimeout" : 2000});
		}
	}

	/**
	 * Description
	 * @method set_time
	 * @param {} dataa
	 */
	function set_time(dataa) {
		var request,
			i,
			sDate,
			sTime;
		sDate = dataa.getUTCFullYear() + "-" + pad(dataa.getUTCMonth() + 1, 2) + "-" + pad(dataa.getUTCDate(), 2);
		sTime = pad(dataa.getUTCHours(), 2) + ":" + pad(dataa.getUTCMinutes(), 2) + ":" + pad(dataa.getUTCSeconds(), 2);
		if (process.platform === "linux") {
			// console.log('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime);
			exec('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime, function (error, stdout, stderr) {
				console.log('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime);
				// console.log("date 2");
				console.log("stdout: " + stdout);
				console.log("stderr: " + stderr);
				console.log("error: " + error);
				// console.log(sDate);
				// console.log(sTime);
				exec("sudo hwclock -w", function (error, stdout, stderr) {
					console.log("sudo hwclock -w");
					console.log("stdout: " + stdout);
					console.log("stderr: " + stderr);
					console.log("error: " + error);
					if (glob_par.NTP_HWCLOCK) {
						exec("sudo hwclock -w -f /dev/rtc1", function (error, stdout, stderr) {
							console.log("sudo hwclock -w -f /dev/rtc1");
							console.log("stdout: " + stdout);
							console.log("stderr: " + stderr);
							console.log("error: " + error);
						});
					}
				});
			});
			// console.log("sudo hwclock -w");
			if (glob_par.NTP_IPs) {
				for (i in glob_par.NTP_IPs) {
					// console.log("ustaw czas zdalnie na " + glob_par.NTP_IPs[i]);
					console.log("http://" + glob_par.NTP_IPs[i] + "/set_time?time=" + dataa.getTime());
					try {
						http.get({ host: glob_par.NTP_IPs[i], port: glob_par.NODE_DIAGN_PORT, path: "/set_time?time=" + dataa.getTime() }, function (res) {
							// console.log("http://" + glob_par.NTP_IPs[i] + "/set_time?time=" + dataa.getTime() + " says:");
							if (res && res.req && res.req._headers)
								console.log(res.req._headers.host + res.req.path + " OK");
						}).on('error', function(e) {
							console.log("http.get got error: " + e.message);
						}).setTimeout(3000, function () {
							// handle timeout here
							console.log("http://" + glob_par.NTP_IPs[i] + "/set_time?time=" + dataa.getTime() + " timeout");
						});
					} catch (err) {
						my_console("http.get catch");
						my_console(err);
					}
				}
			}
		} else if (process.platform === "win32") {
					// child = exec('date ' + dataa.getUTCFullYear() + "/" + dataa.getUTCMonth() + "/" + dataa.getUTCDate(), function (error, stdout, stderr) {
	//					console.log('stdout: ' + stdout);
	//					console.log('stderr: ' + stderr);
	//					if (error !== null) { console.log('exec error: ' + error);	}
					// });
					// child = exec('time ' + dataa.getUTCHours() + ":" + dataa.getUTCMinutes() + ":" + dataa.getUTCSeconds(), function (error, stdout, stderr) {});
		}
		//TODO: obsługa błędu zapisu
	}

	/**
	 * Description
	 * @method getTime
	 * @param {} callback
	 */
	function getTime(callback) {
		if (process.platform === "linux") {
			if (glob_par.NTP_IPs) {
				if (glob_par.NTP_IPs[NTP_IP_i + 1]) {
					NTP_IP_i += 1;
				} else {
					NTP_IP_i = 0;
				}
				// exec("(sudo service ntp stop; sudo ntpdate " + glob_par.NTP_IPs[NTP_IP_i] + "; sudo service ntp start)", { timeout: 2000 }, function (error, stdout, stderr) {
				exec("sudo service ntp stop", function (error0, stdout0, stderr0) {
					// console.log("sudo service ntp stop");
					exec("sudo ntpdate " + glob_par.NTP_IPs[NTP_IP_i], { timeout: 10000 }, function (error, stdout, stderr) {
						// console.log("sudo ntpdate " + glob_par.NTP_IPs[NTP_IP_i]);
						exec("sudo service ntp start", function (error0, stdout0, stderr0) {
							// console.log("sudo service ntp start");
							if (!error) {
								set_time(new Date());
								if (callback) { callback({type: "ntp " + glob_par.NTP_IPs[NTP_IP_i], date: new Date(), error: error, err: stderr, out: stdout}); }
							} else {
								if (glob_par.NTP_HWCLOCK) {
									// exec("sudo hwclock -r", { timeout: 2000 }, function (error, stdout, stderr) {
									exec("sudo hwclock -r -f /dev/rtc1", { timeout: 2000 }, function (error, stdout, stderr) {
										if (!error) {
											set_time(new Date());
											callback({type: "hwclock", date: new Date(), error: error, err: stderr, out: stdout});
										}
									});
								} else {
									if (callback) { callback({error: "Błąd ntp, brak hwclock"}); }
								}
							}
						});
					});
				});
			} else {
				if (glob_par.NTP_HWCLOCK) {
				// exec("sudo hwclock -r", { timeout: 2000 }, function (error, stdout, stderr) {
					exec("sudo hwclock -r -f /dev/rtc1", { timeout: 2000 }, function (error, stdout, stderr) {
						callback({type: "hwclock", date: new Date(), error: error, err: stderr, out: stdout});
					});
				} else {
					if (callback) { callback({error: "Brak ntp i hwclock"}); }
				}
			}
		} else {
			if (callback) { callback({date: new Date(), out: "Platforma nie obslugiwana"}); }
		}
	}

	/**
	 * Description
	 * @method refresh_browser
	 * @param {} res
	 */
	function refresh_browser(res) {
//return;
		if (process.platform === "linux") {
			console.log('xdotool search --onlyvisible --name "chromium" windowactivate --sync key --delay 250 F5');
			exec('xdotool search --onlyvisible --name "chromium" windowactivate --sync key --delay 250 F5', function (error, stdout, stderr) {
				if (stderr) { console.log("stderr: " + stderr); }
				if (error) { console.log("error: " + error); }
				if (res) {
					res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
					res.write("refreshing ...");
					res.end();
				}
			});
		} else {
			if (res) {
				res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
				res.end("Platforma nie obslugiwana");
			}
		}
	}

	/**
	 * Description
	 * @method msToCodesysTime
	 * @param {} ms
	 * @return out
	 */
	function msToCodesysTime(ms) {
		var out = "T#0ms";
		if (parseInt(ms, 10) > 0) {
			out = "T#" + (Math.floor(ms / 86400000) ? (Math.floor(ms / 86400000)) + "d" : "")
				+ (((Math.floor(ms / 3600000)) % 24) ? ((Math.floor(ms / 3600000)) % 24) + "h" : "")
				+ (((Math.floor(ms / 60000)) % 60) ? ((Math.floor(ms / 60000)) % 60) + "m" : "")
				+ (((Math.floor(ms / 1000)) % 60) ? ((Math.floor(ms / 1000)) % 60) + "s" : "")
				+ (ms % 1000 ? (ms % 1000) + "ms" : "");
		}
		return out;
	}

	/**
	 * Description
	 * @method codesysTimeToMs
	 * @param {} time
	 * @return BinaryExpression
	 */
	function codesysTimeToMs(time) {
		if (typeof time !== 'string') {
			console.log(time);
			console.log("codesysTimeToMs time error");
			return 0;
		}
//		var regexp = /(\d+)d(\d+)h(\d+)m(\d+)s(\d+)ms/;
		var d = time.match(/(\d+)d/),
			h = time.match(/(\d+)h/),
			m = time.match(/(\d+)m/),
			s = time.match(/(\d+)s/),
			ms = time.match(/(\d+)ms/);
		if (d) { d = d[1] * 86400000; }
		if (h) { h = h[1] * 3600000; }
		if (m) { m = m[1] * 60000; }
		if (s) { s = s[1] * 1000; }
		if (ms) { ms = parseFloat(ms[1]); }
		return d + h + m + s + ms;
	}

	/**
	 * Description
	 * @method readStringTo0
	 * @param {} buf
	 * @param {} start
	 * @param {} len
	 * @return CallExpression
	 */
	function readStringTo0(buf, start, len) {
		var i;
		for (i = start; i < start + len; i += 1) {
			if (buf[i] === 0) {
				break;
			}
		}
		return buf.toString('utf8', start, i).substr(0, len);
	}
	

	/**
	 * Description
	 * @method szukajPar
	 * @param {} gpar
	 * @param {} naz
	 * @return Literal
	 */
	function szukajPar(gpar, naz) {
		var i;
		if (gpar && gpar.DANE) {
			for (i in gpar.DANE) {
				if (gpar.DANE.hasOwnProperty(i) && gpar.DANE[i].NAZ === naz) { return gpar.DANE[i].WART; }
			}
		}
		return null;
	}

	/**
	 * Description
	 * @method czytajPlikParametrowWiz
	 * @param {} data
	 * @param {} gpar
	 */
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
											// console.log("P - Nie znaleziono parametru \"" + s + "\"");
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

	/**
	 * Description
	 * @method czytajPlikSygnalow
	 * @param {} data
	 * @param {} gpar
	 * @return js
	 */
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

	/**
	 * Description
	 * @method czytajPlikKomunikatow
	 * @param {} text
	 * @param {} word
	 * @return output
	 */
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

	/**
	 * Description
	 * @method wer_jezykowa
	 * @param {} par
	 * @param {} file_name
	 * @param {} file_type
	 * @return file_to_read
	 */
	function wer_jezykowa(par, file_name, file_type){
		console.log(par.error);
		if (!glob_par || par.error) return null;
		var file_to_read = glob_par.WEB_DIR + "/json/";
		var sKonfTypKombajnu = par.sKonfTypKombajnu.trim().replace(" ", "_").toLowerCase();
		var rKonfWersjaJezykowa = par.rKonfWersjaJezykowa/1;
		if (sKonfTypKombajnu != "") {
			file_to_read += sKonfTypKombajnu+"/";
		}
		file_to_read += file_name;
		if (rKonfWersjaJezykowa !== undefined) {
			file_to_read +=  "_"+rKonfWersjaJezykowa;
		}
		file_to_read += file_type;
//		console.log(file_to_read);
		
		if (!fs.existsSync(file_to_read)) {
			if (sKonfTypKombajnu != "") {
			    file_to_read = glob_par.WEB_DIR + "/json/" + sKonfTypKombajnu + "/" + file_name + file_type;
				if (!fs.existsSync(file_to_read)) {
				    file_to_read = glob_par.WEB_DIR + "/json/" + file_name + file_type;
				}
			} else {
				    file_to_read = glob_par.WEB_DIR + "/json/" + file_name + file_type;
			}
		}
		console.log(file_to_read);
		return file_to_read;
	}

    module.exports.refresh_browser = refresh_browser;
    module.exports.getTime = getTime;
    module.exports.set_time = set_time;
    module.exports.pobierzPlikFTP = pobierzPlikFTP;
    module.exports.pad = pad;
    module.exports.CreateDir = CreateDir;
    module.exports.BlockRW = BlockRW;
    module.exports.msToCodesysTime = msToCodesysTime;
    module.exports.codesysTimeToMs = codesysTimeToMs;
    module.exports.readStringTo0 = readStringTo0;

    module.exports.szukajPar = szukajPar;
    module.exports.czytajPlikParametrowWiz = czytajPlikParametrowWiz;
    module.exports.czytajPlikSygnalow = czytajPlikSygnalow;
    module.exports.czytajPlikKomunikatow = czytajPlikKomunikatow;
    module.exports.wer_jezykowa = wer_jezykowa;
	
	var gpar = null;
	var dane = null;

	module.exports.storeDane = function(_dane){dane = _dane};
	module.exports.getDane = function(){return dane};
	
	module.exports.storeGpar = function(_gpar){gpar = _gpar};
	module.exports.getGpar = function(){return gpar};
    // module.exports.odsw_par_i_podstaw_wer_jezyk = odsw_par_i_podstaw_wer_jezyk;
}());