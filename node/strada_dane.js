// strada_dane.js 
(function () {
    "use strict";
	var socket = require('socket.io-client')('http://127.0.0.1:8888'),
		common = require("./common.js"),
		strada_req_time = false,
	    stradaIntEnabled = false,
		dane302_json = '{"error":"Dane nie gotowe - oczekiwanie na PLC"}';

	/**
	 * Description
	 * @method f_dane302_json
	 * @param {} err
	 */
	function f_dane302_json(err) {
		if (err) {
			dane302_json = '{"error":"' + err + '"}';
		} else {
			return dane302_json;
		}
	}

	/**
	 * Description
	 * @method MySetInterval
	 * @param {function} fun
	 * @param {Number} interval
	 */
	function MySetInterval(fun, interval) {
        //problem z this przy use strict gdy brak new przy wywołaniu
		if (typeof interval != 'number') {
			interval = parseInt(interval);
		}
		if (!this.start) {
			this.start = new Date().getTime();
			this.start -= this.start % interval;	//zaokrglenie czasu startu
			this.nextAt = this.start;
		}
		this.nextAt += interval;
		var delay =  this.nextAt - new Date().getTime();
//		console.log("delay = "+delay + "ms");
		if (stradaIntEnabled) {
			setTimeout(function () {
				this.interval = new MySetInterval(fun, interval);
			}, delay);
		} else {
			this.start = 0;
			this.nextAt = 0;
		}
		fun();
	}

	/**
	 * Description
	 * @method stradaStartInterval
	 * @param {function} callback
	 */
	function stradaStartInterval(strada_SendFunction) {
		// console.log("StradaStartInterval");
		MySetInterval.start = 0;
		stradaIntEnabled = true;
		var temp = new MySetInterval(function () {
			// console.log("StradaStartInterval ex");
			strada_SendFunction(0x302, 0, function (dane) {
				if (dane.error) {
					dane = {error:"Brak połączenia z PLC: " + dane.error};
					console.log("zerwane połączenie ze sterownikiem");
					console.log(dane);
					dane302_json = JSON.stringify(dane);
					socket.emit('dane',dane);
					return;
				}
				dane = new DecodeStrada302(dane.dane);
				if (dane.wDataControl === 1) {
					//console.log("Sterownik rząda daty");
					strada_req_time = true;
				} else {
					strada_req_time = false;
				}
				dane302_json = JSON.stringify(dane);
				socket.emit('dane',dane);
			});
		}, process.env.STRADA_INTERVAL_MS || 200);
	}

	/**
	 * Description
	 * @method stradaStopInterval
	 */
	function stradaStopInterval() {
//		console.log("stradaStopInterval !!!");
		stradaIntEnabled = false;
	}

	/**
	 * Description
	 * @method Strada_req_time
	 * @return strada_req_time
	 */
	function Strada_req_time() {
		return strada_req_time;
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
		// gpar = parametry.gpar();
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
	
	// stradaStartInterval();
    module.exports.strada_req_time = Strada_req_time;
    module.exports.StartInterval = stradaStartInterval;
    module.exports.stradaStopInterval = stradaStopInterval;
    module.exports.dane_json = f_dane302_json;
}());
