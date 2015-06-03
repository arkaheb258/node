// tcp_cl4.js - zarządzanie uruchomieniem programu i logowanie do pliku
(function () {
    "use strict";
    console.log("Start tcp_cl4.js");
	var child, io, startApp, connectCounter = 0,
		glob_par = require('./par.js'),
		cp = require("child_process");

	/**
	 * Logowanie w Socket.io
	 * @method mylog
	 * @param {string} str
	 * @param {string} typ
	 */
	function mylog(str, typ) {
		// console.log(str);
		str = str.trim();
		if (str) {
			if (!typ) { typ = 'log'; }
			if (io && connectCounter > 0) {
				io.emit(typ, (new Date()).toISOString() + ": " + str);
			} else {
				console.log((new Date()).toISOString() + ": " + str);
			}
		}
	}

	/**
	 * Restart main.js
	 * @method restartApp
	 */
	function restartApp(req, res) {
		mylog("restartApp()", 'log');
		if (child) {
			mylog("child.kill()", 'log');
			child.kill();
		}
		if (startApp) {	startApp(); }
	}

	/**
	 * Wystartowanie main.js (child)
	 * @method startApp
	 */
	startApp = function () {
		mylog("startApp()");
		child = cp.spawn('node', [glob_par.NODE_MAIN]);

		child.stdout.setEncoding('utf8');
		child.stdout.on('data', function (data) {
			mylog(data.toString(), 'log');
		});

		child.stderr.setEncoding('utf8');
		child.stderr.on('data', function (data) {
			mylog(data.toString(), 'err');
		});

		child.on('close', function (code) {
			mylog('child process exit code ' + code, 'err');
			setTimeout(function () {
				child = null;
				restartApp();
			}, 500);
		});
	};

    mylog("After first require: ");
	startApp();

    var express = require('express'),
		app = express(),
		server = require('http').Server(app);
    io = require('socket.io')(server);
	// compression = require('compression'),

    mylog("After second require: ");

	//tresc statyczna na poczatku routowania
	app.use(express.static('adm'));
	// app.use(compression());	//wylaczone z powodu opóźnień
	app.use(function (req, res, next) {
		mylog('Time');
		mylog(req.connection.remoteAddress + " -> " + req.url);
		next();
	});

	app.get('/', function (req, res) {
		res.redirect('/index.html');
	});

    server.listen(glob_par.NODE_DIAGN_PORT, function () {
		mylog("Start serv");
        mylog("HTTP Server listening on port " + glob_par.NODE_DIAGN_PORT);
    });

    io.on('connection', function (socket) {
		connectCounter += 1;
		console.log("connectCounter = ", connectCounter);
		socket.emit('log', "Połączenie nawiązane");
		socket.on('restart', function (msg) {
			if (child) {
				child.kill();
			}
		});
		socket.on('exit', function (msg) {
			child.kill();
			process.exit(0);
		});
		socket.on('refresh', function (msg) {
			io.emit('x_agent', 'xdotool search --onlyvisible --name "chromium" windowactivate --sync key --delay 250 F5');
		});
		socket.on('exec', function (msg) {
			mylog(msg, 'log');
			cp.exec(msg, function (error, stdout, stderr) {
				mylog(stdout, 'text');
				mylog(stderr, 'err');
				mylog(error, 'err');
			});
		});
		socket.on('disconnect', function () { 
			connectCounter -= 1; 
			console.log("connectCounter = ", connectCounter);
		});
    });
}());