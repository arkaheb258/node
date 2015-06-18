// webServer.js
(function () {
    "use strict";
    var express = require('express'),
		app = express(),
		server = require('http').Server(app),
		socket = require('socket.io-client')('http://127.0.0.1:'+(process.env.PORT || 8888)),
        io = require('socket.io')(server),
		fs = require('fs'),
		os = require('os'),
		url = require("url"),
		common = require("./common.js"),
		ftp_routes = require('./routes/ftp.js'),
		// index_routes = require('./routes/index.js'),
		// rozkaz_routes = require('./routes/rozkaz.js'),
		// strada_routes = require('./routes/strada.js'),
		web_dir = process.env.WEB_DIR || "../build",
	    instrID = 0,
		port = process.env.PORT || 8888;        // set our port

	//logowanie pobieranych plikow w wersji development
	if (process.env.NODE_ENV != "production") {
		app.use(function (req, res, next) {
			console.log(req.connection.remoteAddress + " -> " + req.url);
			next();
		});
	}

	app.get('/json/komunikaty.json', function (req, res, next) {
		// var gpar = common.getGpar();
		var gpar = null;
		if (gpar) {
			var file_to_read = "komunikaty";
			var dir = "";
			var sKonfTypKombajnu = gpar.sKonfTypKombajnu.trim().replace(" ", "_").toLowerCase();
			if (sKonfTypKombajnu != "") {
				dir += sKonfTypKombajnu+"/";
			}
			if (gpar.rKonfWersjaJezykowa !== undefined) {
				file_to_read +=  "_"+rKonfWersjaJezykowa;
			}
			res.redirect('/json/' + dir + file_to_read + '.json');
		} else {
			next();
		}
	})
	
	//podstawienie aktualnych wartosci parametrow
	app.get('/json/parametry.json', function (req, res) {
		fs.readFile(__dirname+'/'+web_dir + "/json/parametry.json", 'utf8', function (err, text) {
			if (err) {
				res.end(JSON.stringify("parametry.json error"));
			} else 
				res.end(JSON.stringify(common.czytajPlikParametrowWiz(text, common.getGpar())));
		});
	});

    app.get('/json/sygnaly.json', function (req, res) {
		// odsw_par_i_podstaw_wer_jezyk("sygnaly", ".json", common.czytajPlikSygnalow, function (text) {
		fs.readFile(__dirname+'/'+web_dir + "/json/sygnaly.json", 'utf8', function (err, text) {
			// console.log(text);
			if (err) {
				res.end(JSON.stringify("sygnaly.json error"));
			} else 
				res.end(JSON.stringify(common.czytajPlikSygnalow(text, common.getGpar())));
		});
    });

	//TODO: uzgodnic kształt informacji o wersji sprzętu (Beagle, Olimex, Tinycore) i serwera(/git-revision.sh ) i IP (/sbin/ifconfig eth0 | sed '/inet\ /!d;s/.*r://g;s/\ .*//g')
	app.get('/hardware.json', function (req, res) {
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
				} else {
				}
			// });		
		}
		if (process.env.verSerwer)
			data = process.env.verSerwer;
		res.jsonp(({"os": process.platform, "verSerwer":data, "ip":ip, "host":os.hostname(), "hw": process.env.HW}));
	});
	
	//przekierowanie
	app.get('/', function (req, res) {
		res.redirect('/index.html');
	})
	
	//tresc statyczna na poczatku routowania
	app.use(express.static(__dirname+'/'+web_dir));

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
		socket.on("odpowiedz", function(msg){
			if (msg.instrID == get.instrID) { res.jsonp(msg.dane); }
		});
	});
	
	//mapowanie FTP sterownika
	app.use('/ftp', ftp_routes);
	
	// app.use('/', index_routes);
	// app.use('/', rozkaz_routes);

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
		if (gpar)
			socket.emit('gpar', gpar);
		else
			io.emit("get_gpar");
		
		socket.on('strada', function (msg) {
			console.log('strada: ' + msg);
		});
		socket.on('rozkaz', function (msg) {
			socket.broadcast.emit('rozkaz', msg);
		});
		socket.on('get_gpar', function (msg) {
			socket.broadcast.emit('get_gpar', msg);
		});
		socket.on('odpowiedz', function (msg) {
			socket.broadcast.emit('odpowiedz', msg);
			// console.log('strada: ' + msg);
		});
		socket.on('dane', function (msg) {
			socket.broadcast.emit('dane', msg);
			// io.emit('dane', dane);
		});		
		socket.on('gpar', function (gpar) {
			console.log("on gpar");
			common.storeGpar(gpar);
			socket.broadcast.emit('gpar', gpar);
		});		
    });
}());
