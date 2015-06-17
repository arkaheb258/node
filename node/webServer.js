// webServer.js
(function () {
    "use strict";
    var express = require('express'),
		app = express(),
		server = require('http').Server(app),
        io = require('socket.io')(server),
		// index_routes = require('./routes/index.js'),
		// rozkaz_routes = require('./routes/rozkaz.js'),
		// strada_routes = require('./routes/strada.js'),
		ftp_routes = require('./routes/ftp.js'),
		web_dir = process.env.WEB_DIR || "../build",
		port = process.env.PORT || 8888;        // set our port

	app.use(function (req, res, next) {
		console.log(req.connection.remoteAddress + " -> " + req.url);
		next();
	});
	
	app.get('/', function (req, res) {
		res.redirect('/index.html');
	})
	
	//tresc statyczna na poczatku routowania
	app.use(express.static(__dirname+'/'+web_dir));
	
	//mapowanie FTP sterownika
	app.use('/ftp', ftp_routes);
	
	// app.use('/', index_routes);
	// app.use('/', rozkaz_routes);

    server.listen(port, function () {
        console.log("HTTP Server listening on port " + port);
    });

	//dane i parametry do wyslania dla nowo-podlaczonych
	var dane = {error: "Dane nie gotowe - oczekiwanie na PLC"};
	var gpar = null;
	
	//Broadcast danych i parametrow
    io.on('connection', function (socket) {
		// console.log('conn web');
		socket.emit('dane', dane);
		if (gpar)
			socket.emit('gpar', gpar);
		socket.on('strada', function (msg) {
			console.log('strada: ' + msg);
		});
		socket.on('dane', function (msg) {
			dane = msg;
			// console.log('dane web');
			socket.broadcast.emit('dane', dane);
			// io.emit('dane', dane);
		});		
		socket.on('gpar', function (msg) {
			gpar = msg;
			socket.broadcast.emit('gpar', gpar);
		});		
    });
}());
