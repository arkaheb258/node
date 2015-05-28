// webServer.js
(function () {
    "use strict";
    var express = require('express'),
		app = express(),
		server = require('http').Server(app),
        io = require('socket.io')(server),
		index_routes = require('./routes/index.js'),
		rozkaz_routes = require('./routes/rozkaz.js'),
		strada_routes = require('./routes/strada.js'),
		compression = require('compression'),
//		port = process.env.PORT || 8888;        // set our port
		port = 8888;        // set our port

	app.use(compression());
	app.use(function (req, res, next) {
		console.log(req.connection.remoteAddress + " -> " + req.url);
		next();
	});
	app.use('/', index_routes);
	app.use('/', rozkaz_routes);

    app.get('/test.html', function (req, res) {
        res.sendFile('../test/test.html');
    });

    server.listen(port, function () {
        console.log("HTTP Server listening on port " + port);
    });

    io.on('connection', function (socket) {
		socket.emit('dane', {error: "Dane nie gotowe - oczekiwanie na PLC"});
		socket.on('strada', function (msg) {
			console.log('strada: ' + msg);
		});
    });

	module.exports.emit = function (msg) {
		io.emit('dane', msg);
	};

    module.exports.StartServer = function () {};
}());
