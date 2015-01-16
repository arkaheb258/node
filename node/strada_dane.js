// strada_dane.js 
(function () {
    "use strict";
	var glob_par = require('../par.js'),
		strada = require("./strada.js"),
		strada_rozk = require("./strada_rozk.js"),
		strada_req_time = false,
	    stradaIntEnabled = false,
		dane302_json = '{"error":"Dane nie gotowe - oczekiwanie na PLC"}';

	function f_dane302_json(err) {
		if (err) {
			dane302_json = '{"error":"' + err + '"}';
		} else {
			return dane302_json;
		}
	}

	function MySetInterval(fun, interval) {
        //problem z this przy use strict gdy brak new przy wywołaniu
		if (!this.start) {
			this.start = new Date().getTime();
			this.start -= this.start % interval;	//zaokrglenie czasu startu
			this.nextAt = this.start;
		}
		this.nextAt += interval;
		var delay =  this.nextAt - new Date().getTime();
//		console.log("delay = "+delay + "ms");
//		if (stradaIntEnabled) console.log("stradaIntEnabled true");
//		else console.log("stradaIntEnabled false");
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

	function stradaStartInterval(callback) {
//		console.log("StradaStartInterval");
		MySetInterval.start = 0;
		stradaIntEnabled = true;
		var temp = new MySetInterval(function () {
			strada.SendFunction(0x302, 0, function (dane) {
				if (dane.error) {
					dane = {error:"Brak połączenia z PLC: " + dane.error};
					console.log("zerwane połączenie ze sterownikiem");
					console.log(dane);
					dane302_json = JSON.stringify(dane);
					callback(dane);
					return;
				}
				dane = strada_rozk.DecodeStrada302(dane.dane);
				if (dane.wDataControl === 1) {
//console.log("Sterownik rząda daty");
					strada_req_time = true;
				} else {
					strada_req_time = false;
				}
				dane302_json = JSON.stringify(dane);
				callback(dane);
			});
		}, glob_par.STRADA_INTERVAL_MS);
	}

	function stradaStopInterval() {
//		console.log("stradaStopInterval !!!");
		stradaIntEnabled = false;
	}

	function Strada_req_time() {
		return strada_req_time;
	}
	

    module.exports.strada_req_time = Strada_req_time;
    module.exports.StartInterval = stradaStartInterval;
    module.exports.stradaStopInterval = stradaStopInterval;
    module.exports.dane_json = f_dane302_json;
}());
