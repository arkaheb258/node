// webServer.js
(function () {
	"use strict";
	var express = require('express');
	var app = express();
	var server = require('http').Server(app);
	var socket = require('socket.io-client')('http://127.0.0.1:' + (process.env.WEB_PORT || 8888));
	var io = require('socket.io')(server);
	var fs = require('fs');
	var os = require('os');
	var url = require("url");
	var common = require("./common.js");
		// ftp_routes = require('./routes/ftp.js'),
		// json_routes = require('./routes/json.js'),
		// index_routes = require('./routes/index.js'),
		// rozkaz_routes = require('./routes/rozkaz.js'),
		// strada_routes = require('./routes/strada.js'),
	var web_dir = process.env.WEB_DIR || "../build";
	var instrID = 0;
	var port = process.env.WEB_PORT || 8888;        // set our port

	//logowanie pobieranych plikow w wersji development
	if (process.env.NODE_ENV !== "production") {
		app.use(function (req, res, next) {
			console.log(req.connection.remoteAddress + " -> " + req.url);
			next();
		});
	}

	//przekierowanie
	app.get('/', function (req, res) {
		res.redirect('/index.html');
	});

	//tresc statyczna na poczatku routowania
	app.use(express.static(__dirname + '/' + web_dir));

	//mapowanie plikow JSON
	// app.use('/json', json_routes);

	//obsluga rozkazow dla PLC
	app.get('/rozkaz', function (req, res) {
		var get = url.parse(req.url, true).query;
		instrID = (instrID + 1) % 0x10000;
		get.instrID = instrID;
		switch (get.rozkaz) {
		case "ustawCzas":
			if (isNaN(get.wartosc)) {
				res.jsonp("NaN");
				return;
			}
			break;
		default:
			break;
		}
		socket.emit("rozkaz", get);
		socket.on("odpowiedz", function (msg) {
			if (msg.instrID == get.instrID) { res.jsonp(msg.dane); }
		});
	});

	app.get('/json/hardware.json', function (req, res) {
		var data = "0.8.34";
		var ip = "192.168.x.x";
		var err = null;
		if (process.platform === "linux") {
			// execute('cat /etc/dogtag', console.log);
			 // /sbin/ifconfig eth0 | sed '/inet\ /!d;s/.*r://g;s/\ .*//g'
			// fs.readFile('~/kopex/git-revision.sh', 'utf8', function (err,data) {
				// console.log(data);
			ip = os.networkInterfaces().eth0[0].address;
			if (err) {
				res.jsonp(({"error": err}));
			}
			// });
		}
		if (process.env.verSerwer) { data = process.env.verSerwer; }
		res.jsonp(({"os": process.platform, "verSerwer": data, "ip": ip, "host": os.hostname(), "hw": process.env.HW}));
	});

	app.get('/json/*', function (req, res, next) {
		var gpar = common.getGpar();
		var file = req.url.match(/\/([a-z]+)\.json/);
		if (!file) {
			next();
		} else if (gpar) {
			var file_to_read = file[1];
			var dir = "";
			var sKonfTypKombajnu = gpar.sKonfTypKombajnu.trim().replace(" ", "_").toLowerCase();
			if (sKonfTypKombajnu !== "") {
				dir += sKonfTypKombajnu + "/";
			}
			if (gpar.rKonfWersjaJezykowa !== undefined) {
				file_to_read +=  "_" + gpar.rKonfWersjaJezykowa;
			}
			if (file[1] === 'sygnaly') {
				fs.readFile(__dirname + '/' + web_dir + '/json/' + dir + file_to_read + '.json', 'utf8', function (err, text) {
					if (err) {
						res.jsonp("sygnaly.json error");
					} else {
						res.jsonp(common.czytajPlikSygnalow(text, common.getGpar()));
					}
				});
			} else if (file[1] === 'parametry') {
				fs.readFile(__dirname + '/' + web_dir + '/json/' + dir + file_to_read + '.json', 'utf8', function (err, text) {
					if (err) {
						res.jsonp("parametry.json error");
					} else {
						res.jsonp(common.czytajPlikParametrowWiz(text, common.getGpar()));
					}
				});
			} else if (file[1] === 'komunikaty') {
				fs.readFile(__dirname + '/' + web_dir + '/json/' + 'STR_KOMUNIKATY.EXP', 'utf8', function (err, text) {
					if (err) {
						res.redirect('/json/' + dir + file_to_read + '.json');
					} else {
						res.jsonp(common.czytajPlikKomunikatow(text, false));
					}
				});
			} else {
				res.redirect('/json/' + dir + file_to_read + '.json');
			}
		} else {
			res.jsonp("brak polaczenia z PLC -> brak parametrow");
		}
	});

	//mapowanie FTP sterownika
	// app.use('/ftp', ftp_routes);

	//wystartowanie serwera
	server.listen(port, function () {
		console.log("HTTP Server listening on port " + port);
	});

	//Broadcast danych i parametrow
	io.on('connection', function (socket) {
		console.log("Nowy socket: ", socket.conn.id);
		//dane do wyslania dla nowo-podlaczonych
		socket.emit('dane', {error: "Dane nie gotowe - oczekiwanie na PLC"});
		var gpar = common.getGpar();
		if (gpar) {	socket.emit('gpar', gpar); } else { io.emit("get_gpar"); }

		socket.on('strada', function (msg) {
			console.log('strada: ' + msg);
		});
		socket.on('rozkaz', function (msg) {
			socket.broadcast.emit('rozkaz', msg);
		});
		socket.on('get_gpar', function () {
			// socket.broadcast.emit('get_gpar', msg);
			var gpar = common.getGpar();
			if (gpar) {	socket.emit('gpar', gpar); } else {	io.emit("get_gpar"); }
		});
		socket.on('odpowiedz', function (msg) {
			socket.broadcast.emit('odpowiedz', msg);
			// console.log('strada: ' + msg);
		});
		socket.on('dane', function (msg) {
			socket.broadcast.emit('dane', msg);
			// io.emit('dane', dane);
		});
		socket.on('broadcast', function (msg) {
			io.emit(msg);
		});
		
		socket.on('gpar', function (gpar) {
			console.log("webServer on gpar");
			common.storeGpar(gpar);
			socket.broadcast.emit('gpar', gpar);
		});
	});
}());
