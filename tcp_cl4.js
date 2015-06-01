// tcp_cl4.js - zarządzanie uruchomieniem programu i logowanie do pliku
(function () {
    "use strict";
    console.log("Start: ", Date.now());
    var express = require('express'),
		app = express(),
		server = require('http').Server(app),
        io = require('socket.io')(server),
		// compression = require('compression'),
		child,
		glob_par = require('./par.js'),
		// path = require("path"),
		// common = require("./node/common.js"),
		cp = require("child_process");

    console.log("After require: ", Date.now());
	startApp();

	//tresc statyczna na poczatku routowania
	app.use(express.static('adm'));
	// app.use(express.static(path.join(__dirname, './adm')));
	// app.use(compression());
	app.use(function (req, res, next) {
		console.log('Time:', Date.now());
		console.log(req.connection.remoteAddress + " -> " + req.url);
		next();
	});
	
	// app.set('views', __dirname + '/views')
	// app.set('view engine', 'jade')
	
	// app.get('/index1.html', function (req, res) {
		// res.render('adm', {});
	// });	

	app.get('/', function (req, res) {
		res.redirect('/index.html');
	})

    server.listen(glob_par.NODE_DIAGN_PORT, function () {
		console.log("Start: ", Date.now());
        console.log("HTTP Server listening on port " + glob_par.NODE_DIAGN_PORT);
    });
	
    io.on('connection', function (socket) {
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
    });

	/**
	 * Logowanie w Socket.io
	 * @method mylog
	 * @param {String} str
	 * @param {String} typ
	 */
	function mylog(str, typ) {
		// console.log(str);
		if (str) { 
			if (!typ) typ = 'log';
			io.emit(typ, (new Date()).toISOString() + ": " + str);
		}
	}

	/**
	 * Wystartowanie main.js (child)
	 * @method startApp
	 */
	function startApp() {
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
	}

	/**
	 * Restart main.js
	 * @method restartApp
	 * @param {} req
	 * @param {} res
	 */
	function restartApp(req, res) {
		mylog("restartApp()", 'log');
		if (child) {
			mylog("child.kill()", 'log');
			child.kill();
		}
		startApp();
	}
	
}());