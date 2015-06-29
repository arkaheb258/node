// proxy.js 
(function () {
    "use strict";
	var socket = require('socket.io-client')('http://127.0.0.1:' + (process.env.WEB_PORT || 8888)),
		is_reading = false,
		exDataTimerId = null,
		external_data = false,
		fs = require("fs");

	function readDane() {
		is_reading = true;
		fs.readFile("dane.json", 'utf8', function (err, data) {
			is_reading = false;
			data = JSON.parse(data);
			data.TimeStamp_js = Date.now();
			data.TimeStamp_s = Math.floor(data.TimeStamp_js / 1000);
			data.TimeStamp_ms = data.TimeStamp_js - (new Date()).setUTCHours(0, 0, 0, 0);
			if (!err) {
				socket.emit('dane', data);
			} else {
				console.log(err);
			}
		});
	}

  function readDaneDiag() {
		is_reading = true;
		fs.readFile("daneDiag.json", 'utf8', function (err, data) {
			is_reading = false;
			if (!err) {
				socket.emit('daneDiag', data);
			} else {
				console.log(err);
			}
		});
	}

	setInterval(function () {
		if (!external_data && !is_reading) {
			readDane();
		}
	}, 200);

	setInterval(function () {
		if (!external_data && !is_reading) {
			readDaneDiag();
		}
	}, 1000);
  
	socket.emit('dane', {error: "Dane nie gotowe - oczekiwanie na PLC (PROXY)"});
	socket.on('dane', function () {
		external_data = true;
		clearTimeout(exDataTimerId);
		exDataTimerId = setTimeout(function () {external_data = false; }, 1000);
	});
}());
