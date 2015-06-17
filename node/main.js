// main.js
(function () {
    "use strict";
	var net = require('net'),
		strada_rozk = require("./strada_rozk.js"),
		parametry = require("./parametry.js"),
		common = require("./common.js"),
		strada_dane = require("./strada_dane.js"),

	    DEFAULT_TIMEOUT_MS = 1000,
	    CONNECT_DELAY = 200,
	    TIMEOUT_MUL = 5,
	    CONNECT_TIMEOUT_MS = (process.env.STRADA_INTERVAL_MS || 200 ) * 2, // * TIMEOUT_MUL,
		timeout_counter = 0,
		ntp_date = -1,
		NTP_IP_i = 0,
	    dt = new Date(),
	    instrID = 0,
	    client = null,
		main_client = null,
	    queue = [],
	    lastSent = null,
	    PLCConnected = false;

	/**
	* Konstruktor klasy
	* @param client socket do po³czenia
	* @param onConnect funkcja wywo³ywana po polaczeniu
	*/
	function strada(onConnect, num) {
//		console.log("strada(onConnect)");
		client = new net.Socket();
		client.setTimeout(CONNECT_TIMEOUT_MS, function () {
			StradaTimeout(client);
		});
		client.on('data', stradaGetData);
		client.on('connect', function () {
			console.log("on Connect 0");
			PLCConnected = true;
			strada_dane.stradaStopInterval();
			// stradaClearQueue(true);
			// console.log("queue.length "+queue.length);
			main_client = client;
			console.log('main_client = client');
			
			console.log('Strada Polaczono ....');
			strada_dane.StartInterval(stradaEnqueue);
			parametry.odswierzParametry(StradaReadAll, null, true);

			onConnect();
		});
		client.on('error', function (err) {
			strada_dane.dane_json('Strada client ErRoR: ' + err.code);
			console.log(num + ": Strada ErRoR: " + err.code);
			PLCConnected = false;
		});
		client.on('close', function () {
			console.log('client.on(close)');
			setTimeout(function () {
				strada(onConnect, 0);
			}, CONNECT_DELAY);
			if (client && !client.destroyed) {
				console.log('client.destroy()');
				client.destroy();
			}
			if (PLCConnected) {
				PLCConnected = false;
				strada_dane.dane_json('Strada Connection closed');
				// console.log(dane302_json);
				// stradaClearQueue(true);
			}
			strada_dane.stradaStopInterval();
		});
		client.connect(process.env.STRADA_PORT || 20021, process.env.PLC_IP || "192.168.3.30");
		console.log('try to connect to PLC');
	}

	/**
	* Przegl¹d kolejki wiadomoœci w celu sprawdzenia timeoutów
	*/
	function stradaClearQueue(force) {
		var len = queue.length, i, el;
//		console.log("len: " + len);
		if (len === 0) { return; }
		// if (force) console.log("stradaClearQueue " + len);
		for (i = 0; i < queue.length; i += 1) {
			el = queue[i];
			if ((new Date() - el.time) > el.timeout || force) {
				queue.splice(i, 1)[0].callback({error: "timeout"});
				console.log("queue.splice + timeout");
				i -= 1;
				len -= 1;
			}
		}
	}

	/**
	* Gdy sterownik nie odpowiada - reset po³¹czenia
	*/
	function StradaTimeout(clientt) {
		// Close the client socket completely
		console.log("Wystapil Strada timeout ");
		timeout_counter += 1;
		if (timeout_counter < TIMEOUT_MUL) { return; }
		if (clientt && !clientt.destroyed) {
			clientt.destroy();
		}
		stradaClearQueue(true);
		PLCConnected = false;
	}

	/**
	* Wys³anie instrukcji do sterownika protoko³em Strada
	* @param instrNo kod instrukcji
	* @param data dane do wyslania
	*/
	function stradaSendFunction(instrNo, data) {
//		console.log(" stradaSendFunction()");
		instrID = (instrID + 1) % 0x10000;
		var DstID = 1,
		    SrcID = 4,
		    Dir = 0x01,
		    out_buff = new Buffer(16),
			temp,
			ip,
		    temp_out_buff;

		if (instrNo.length === 2) {
			Dir = 0x101;
			instrNo = instrNo[0];
		}

		out_buff.writeUInt32LE(DstID, 0);
		out_buff.writeUInt32LE(SrcID, 4);
		out_buff.writeUInt16LE(Dir, 8);
		out_buff.writeUInt16LE(instrNo, 10);
		out_buff.writeUInt16LE(instrID, 12);
		out_buff.writeUInt16LE(0, 14);

		if (instrNo === 0x204) {
			data = data * 100;
		}

		if (instrNo === 0x20C) {
			data = data * 10;
		}

		switch (instrNo) {
		case 0x0:	//External instrNo
			instrNo = data[0];
			out_buff.writeUInt16LE(instrNo, 10);
			temp_out_buff = data[1];
			data = null;
			break;
		case 0x201:	//Zapisz datê i czas.
            temp_out_buff = new Buffer(8);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(4, 2);
            temp_out_buff.writeUInt32LE(data, 4);
            // temp_out_buff.writeUInt16LE(data, 4);
            // temp_out_buff.writeUInt16LE(0, 6);
			break;
		case 0x202:	//Zapisz aktualne blokady.
			data = strada_rozk.encodeStrada202(data);
            if (!data || !data.length) { data = [0, 0, 0, 0]; }
            temp_out_buff = new Buffer(4);		//naglowek Iver >=4bajty
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(data.length, 2);
			break;
		case 0x203:	//Zapisz aktualny jêzyk.
		case 0x204:	//Zapisz aktualny numer sekcji.
		case 0x207:	//Zapisz miejsce sterowanie posuwem.
		case 0x208:	//Zapisz tryb pracy posuwu.
		case 0x209:	//Zapisz tryb pracy ci¹gników.
		case 0x20A:	//Zapisz ca³kowity czas pracy kombajnu.
		case 0x20B:	//Zapisz ca³kowity czas jazdy kombajnu.
		case 0x20C:	//Zapisz ca³kowity dystans kombajnu.
		case 0x216:	//Zapisz kana³ radiowy SSRK. (1-69)
		case 0x21B:	//Zapisz typ skrawu wzorcowego.
		case 0x21C:	//Zapisz fazê skrawu wzorcowego.
		case 0x21D:	//Zapisz auto fazê skrawu wzorcowego.
		case 0x221:	//Zapisz miejsce sterowania kombajnu przez zewnêtrzny system sterowania
		case 0x222:	//Zapisz tryb pracy pomp hydrauliki.
		case 0x307:	//Odczytanie obszaru danych konfiguracyjnych
		case 0x308:	//Podaj historiê zdarzeñ.
		case 0x401:	//Testuj hamulec.
		case 0x601:	//Podaj nazwy plików Skrawu Wzorcowego.
		case 0x603:	//Podaj nazwê aktualnego pliku Skrawu Wzorcowego.
            temp_out_buff = new Buffer(8);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(4, 2);
            temp_out_buff.writeUInt16LE(data, 4);
            temp_out_buff.writeUInt16LE(0, 6);
            // temp_out_buff.writeUInt16LE(data, 4);
			break;
		case 0x402:	//Sterowanie reflektorami.
		case 0x404:	//Kalibracja czujnika po³o¿enia napêdów hydraulicznych
		case 0x502:	//Obsluga plików parametrów
            temp_out_buff = new Buffer(8);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(4, 2);
            temp_out_buff.writeUInt16LE(data[0], 4);
            temp_out_buff.writeUInt16LE(data[1], 6);
			data = null;
			break;
		case 0x701:	//Kalibracja czujników po³o¿enia napêdów hydraulicznych kombajnów chodnikowych
            temp_out_buff = new Buffer(8);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(4, 2);
            temp_out_buff.writeUInt16LE(data[0], 4);
            temp_out_buff.writeInt16LE(data[1], 6);
			data = null;
			break;
		case 0x702:	//Ustawianie liczników czasu pracy dla kombajnów chodnikowych.
            temp_out_buff = new Buffer(12);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(8, 2);
            temp_out_buff.writeUInt16LE(data[0], 4);
            temp_out_buff.writeUInt16LE(0, 6);
            temp_out_buff.writeInt32LE(data[1], 8);
			data = null;
			break;
		case 0x403:	//Zeruj liczniki dzienne.
		case 0x602:	//Skasuj aktywny plik Skrawu Wzorcowego i usuñ dane Skrawu z pamiêci.
            temp_out_buff = new Buffer(4);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(0, 2);
			data = null;
			break;
		case 0x600:	//Zapisz nazwê pliku Skrawu Wzorcowego wybranego przez u¿ytkownika.
		case 0x604:	//Skasuj plik Skrawu Wzorcowego (inny ni¿ aktywny).
		case 0x606:	//Stwórz nowy plik Skrawu Wzorcowego
            temp_out_buff = new Buffer(26);
            temp_out_buff.fill(0);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(24, 2);
			temp_out_buff.write(data, 4);
			data = null;
			break;
		case 0x605:	//Zmieñ nazwê pliku Skrawu Wzorcowego
            temp_out_buff = new Buffer(50);
            temp_out_buff.fill(0);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(24, 2);
			temp_out_buff.write(data[0], 4);
			temp_out_buff.write(data[1], 28);
			data = null;
			break;
		case 0x302:	//Odczytanie obszaru danych wizualizacyjnych kombajnu
            temp_out_buff = new Buffer(16);
            temp_out_buff.fill(0);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(12, 2);
	//		console.log("uiCzytajObszarNr: "+data);
            temp_out_buff.writeUInt16LE(data, 4);	//uiCzytajObszarNr
//console.log(strada_dane.strada_req_time());
			if (strada_dane.strada_req_time()) {
				console.log("Sterownik rz¹da daty 2");
				if (ntp_date === -1) {
					ntp_date = 0;
					common.getTime(function (ret) {
						if (ret.error) {
							console.log("error " + ret.error);
							ntp_date = -1;
						} else {
							console.log(ret.date);
							console.log("data po zmianie: " + Math.round((new Date()).getTime() / 1000));
							ntp_date = 1;
						}
					});
				} else if (ntp_date === 1) {
					temp_out_buff.writeUInt16LE(1, 6);
					temp_out_buff.writeUInt32LE(Math.round((new Date()).getTime() / 1000), 8);
				}
			}
			break;
		case 0x310:	//Podaj status wejœæ/wyjœæ wybranego bloku.
            temp_out_buff = new Buffer(32);
            temp_out_buff.fill(0);
            temp_out_buff.writeUInt16LE(1, 0);	//instrVer
            temp_out_buff.writeUInt16LE(28, 2);	//ClientDataLen
			temp_out_buff.writeUInt16LE(0, 4);	//uiCzytajObszarNr
			temp_out_buff.writeUInt16LE(0, 6);	//Rezerwa
			temp_out_buff.write(data, 8);
			data = null;
			break;
		case 0x500:	//Zapisz parametr
            temp_out_buff = new Buffer(100);
            temp_out_buff.fill(0);
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(96, 2);
			if (data.NAZ.length > 31) {
				console.log("0x500 - za d³uga NAZWA (" + data.NAZ.length + ")");
				data.NAZ = data.NAZ.substr(0, 31);
			}
			temp_out_buff.write(data.NAZ, 4);
			temp_out_buff.write(data.TYP, 36);
//console.log(data.TYP);
			if (data.TYP === "STRING") {
				if (data.WART.length > 29) {
					console.log("0x500 - za d³ugi STRING (" + data.WART.length + ")");
					data.WART = data.WART.substr(0, 29);
				}
				temp_out_buff.write('"' + data.WART + '"', 68);
			// } else if (data.TYP === "LISTA") {
				// temp_out_buff.write(data.WART.toFixed(1), 68);
			} else if (data.TYP === "REAL" || (data.TYP === "LISTA")) {
				temp = data.WART.toString();
				if (temp.indexOf('.') === -1) {
					data.WART = temp + ".0";
				} else if (temp.length - temp.indexOf('.') < 3) {
					data.WART = parseFloat(temp).toFixed(1);//.toString();
				} else {
					data.WART = temp;
				}
				temp_out_buff.write(data.WART, 68);
			} else if (data.TYP === "TIME") {
//				temp_out_buff.write('"T#' + common.msToCodesysTime(data.WART) + 'ms"', 68);
// console.log('"T#' + (data.WART*1000) + 'ms"');
				// temp_out_buff.write('"T#' + (data.WART * 1000) + 'ms"', 68);
				temp_out_buff.write('"' + common.msToCodesysTime(data.WART * 1000) + '"', 68);
			} else {
				console.log("0x500 - B³¹d TYPU");
				temp_out_buff.write(data.WART, 68);
			}
			break;
        default:	//domyœlnie jako parametr przyjmuje tablicê
			if (instrNo < 0x200 || instrNo === 0x301) { break; }	//dla rozkazow SSN, SSO i Tiefenbach
            if (!data || !data.length) { data = [0, 0, 0, 0]; }
            temp_out_buff = new Buffer(4);		//naglowek Iver >=4bajty
            temp_out_buff.writeUInt16LE(1, 0);
            temp_out_buff.writeUInt16LE(data.length, 2);
			break;
		}

        if (temp_out_buff && temp_out_buff.length) {
			out_buff = Buffer.concat([out_buff, temp_out_buff]);
		}

        if (data && data.length) {
            out_buff = Buffer.concat([out_buff, new Buffer(data)]);
        }

		out_buff.writeUInt16LE(out_buff.length - 16, 14);	//d³ugoœæ StradaData
		if (lastSent) {
			console.log("nadpisanie lastSent");
		}
		lastSent = {"DstID": DstID, "SrcID": SrcID, "Dir": Dir, "instrNo" : instrNo, "instrID" : instrID, "time" : new Date()};
//		console.log("194 lastSent set");
		if (main_client) { main_client.write(out_buff); } else { console.log("b³¹d main_client"); }
//		console.log("wys³ano ID=" + instrID + " instrNo: " + instrNo + " lastSent.instrID = " + lastSent.instrID);
		return instrID;
	}

	function stradaEnqueue(instrNo, data, callback, timeout) {
		var lastID = null,
			outTimeout;
		if (timeout) { outTimeout = timeout; } else { outTimeout = DEFAULT_TIMEOUT_MS; }
		stradaClearQueue();
//		console.log("instrNo: " + instrNo);
//		console.log("queue.length: " + queue.length);
		if (!PLCConnected) {
			console.log("PLC nie polaczony");
			callback({error: "PLC nie polaczony"});
			return 1;
		}
		if (queue.length === 0) {
//			console.log(" stradaSendFunction from enqueue");
			lastID = stradaSendFunction(instrNo, data);
		}
		if (!callback) { callback = console.log; }
		// console.log("push");
		queue.push({instrNo: instrNo, data: data, callback: callback, timeout: outTimeout, time: new Date(), instrID: lastID});
		if (queue.length > 2) {
			console.log("queue.length = " + queue.length + " instrNo = " + instrNo);
		}
		if (queue.length > 20) {
			throw new Error({'opis': 'Przepe³nienie kolejki'});
		}
	}

	function stradaSendNext(dane, asyn) {
		// console.log("stradaSendNext(dane)");
		var el = queue[0],
			tempDate = new Date();
		if (el) {
			if (asyn) {
//				console.log(el);
//				console.log(tempDate - el.time);
				if (el.instrNo.length === 2) { el.instrNo = el.instrNo[0]; }
				stradaEnqueue([el.instrNo, 0x101], el.data, el.callback, el.timeout - (tempDate - el.time));
			} else {
				el.callback(dane);
			}
		}
		queue.shift();
		stradaClearQueue();
		if (queue.length > 0) {
			el = queue[0];
			queue[0].instrID = stradaSendFunction(el.instrNo, el.data);
		}
	}

	/**
	* Odebranie danych ze sterownika protoko³em Strada
	* @param dane odebrane dane
	*/
	function stradaGetData(dane) {
//		console.log("dane");
//		console.log(dane.length);
		var DstIDR = dane.readUInt32LE(0),
		    SrcIDR = dane.readUInt32LE(4),
		    DirR = dane.readUInt16LE(8),
		    instrNoR = dane.readUInt16LE(10),
		    instrIDR = dane.readUInt16LE(12),
		    DataLenR = dane.readUInt16LE(14),
			error = true,
			StatusInfNo,
			InstrVer,
		    InstrID2,
		    DataType,
		    DataLen,
		    DataSegmentNo,
			rawHead,
			ErrNo,
			ErrDesc;

//		console.log(" stradaGetData lastSent.instrID = " + lastSent.instrID);
		if (lastSent) {
			if (DstIDR !== lastSent.SrcID) {
				console.log("B³¹d DstID");
			} else if (SrcIDR !== lastSent.DstID) {
				console.log("B³¹d SrcID");
			} else if (DirR !== 0x10) {
				console.log("B³¹d Dir");
				if (DirR === 0x110) {
					console.log("BOT nr=" + dane.readInt16LE(16) + ": " + dane.slice(20) + " (" + dane.slice(20).length + ")");
				} else {
					console.log("Dir = " + DirR);
				}
			} else if (instrNoR !== lastSent.instrNo) {
				console.log("B³¹d instrNo");
			// } else if (instrIDR !== lastSent.instrID) {
			} else if (instrIDR !== lastSent.instrID && instrNoR > 0x200 && instrNoR !== 0x301) {	//ignorowanie b³êdu STRADA w rozkazach 0x001- 0x1FF oraz 0x301
				console.log("B³¹d instrID jest: " + instrIDR + " powinno byæ: " + lastSent.instrID);
			} else if (dane.length - 16 !== DataLenR) {
				console.log("B³¹d DataLen");
			} else {
				timeout_counter = 0;
				error = null;
			}
		}
		// console.log("odebrano ID=" + instrIDR);
		dane = dane.slice(16);	//przes³anie dalej tylko StradaData

		if (instrNoR < 0x200 || instrNoR === 0x301) {
			stradaSendNext({error: error, Dir: DirR, dane: dane, RawHead: new Buffer([])});
			lastSent = null;
			return;
		}
//		console.log(lastSent);
		if (!error) {
			//SIN
			StatusInfNo = dane.readInt16LE(0);
		    InstrVer = dane.readUInt16LE(2);
		    InstrID2 = dane.readUInt16LE(4);
		    DataType = dane.readUInt16LE(6);
		    DataLen  = dane.readUInt16LE(8);
		    DataSegmentNo = dane.readUInt16LE(10);
			rawHead = dane.slice(0, 12);
			dane = dane.slice(12);	//przes³anie dalej tylko SerwerData
			lastSent = null;
			// if (instrNoR === 0x302) {
				// dane302 = {error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead};
			// }
			if (DataType === 0) {
				dane = dane.toString();
			}
			switch (StatusInfNo) {
			case -1:
				stradaSendNext({error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead});
				break;
			case -2:
			case -4:
			case -5:
				console.log("StatusInfNo: " + StatusInfNo + " - wyslanie ponowne");
				setTimeout(function () {
					stradaSendNext({error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead}, true);
					// stradaSendNext({error: error, Dir: 0x101, dane: dane, DataLen: DataLen, RawHead: rawHead}, true);
				}, 100);
				break;
			default:
				// console.log("StatusInfNo: " + StatusInfNo);
				// console.log("StatusInfNo: " + StatusInfNo);
				// console.log("InstrVer: " + InstrVer);
				// console.log("InstrID2: " + InstrID2);
				// console.log("DataType: " + DataType);
				// console.log("DataLenR: " + DataLenR);
				// console.log("DataLen: " + DataLen);
				// console.log("DataSegmentNo: " + DataSegmentNo);
				error = StatusInfNo;
				stradaSendNext({error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead});
				break;
			}
		} else {
			//BOT
		    ErrNo = dane.readInt16LE(0);	//numer b³êdu
			ErrDesc = dane.slice(4);			//opis b³êdu
			error = ErrNo;
			dane = ErrDesc.toString();
			stradaSendNext({error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead});
		}
	}

	function StradaReadAll(instrNo, uiCzytajObszarNr, callback) {
		if (uiCzytajObszarNr === 0) {
			StradaReadAll.tempKonf = {dane: new Buffer(0), DataLen: 0};
		}
// console.log("uiCzytajObszarNr "+uiCzytajObszarNr);
		stradaEnqueue(instrNo, uiCzytajObszarNr, function (dane) {
			if (!dane.dane || (typeof dane.dane === "string")) {
				callback(dane);
			} else {
				StradaReadAll.tempKonf.dane = new Buffer.concat([StradaReadAll.tempKonf.dane, dane.dane]);
				StradaReadAll.tempKonf.DataLen = dane.DataLen;
				if (uiCzytajObszarNr > 3) {
					console.log("nie ma koñca - (uiCzytajObszarNr > 3)");
					return;
				}
				if (StradaReadAll.tempKonf.dane.length < StradaReadAll.tempKonf.DataLen) {
					new StradaReadAll(instrNo, uiCzytajObszarNr + 1, callback);
				} else {
					callback(StradaReadAll.tempKonf.dane);
				}
			}
		});
	}

	StradaReadAll.tempKonf = {dane: new Buffer(0), DataLen: 0};

	strada(function(){});
	
    module.exports.connect = strada;
    module.exports.SendFunction = stradaEnqueue;
    module.exports.readAll = StradaReadAll;
}());
