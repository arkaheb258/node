// webServer.js
(function () {
    "use strict";
    var express = require('express'),
		app = express(),
		server = require('http').Server(app),
        io = require('socket.io')(server),
		index_routes = require(__dirname + '/routes/index.js'),
		rozkaz_routes = require(__dirname + '/routes/rozkaz.js'),
		strada_routes = require(__dirname + '/routes/strada.js'),
		compression = require('compression'),
		port = process.env.PORT || 5000;        // set our port

	app.use(compression());
	app.use(function (req, res, next) {
		console.log(req.connection.remoteAddress + " -> " + req.url);
		next();
	});
	app.use('/', index_routes);

    server.listen(port, function () {
        console.log("HTTP Server listening on port " + port);
    });

    io.on('connection', function (socket) {
		socket.on('strada', function (msg) {
			console.log('strada: ' + msg);
		});
    });

	module.exports.emit = function(msg) {
		io.emit('dane', msg);
	};

/*****************************************************************************/

    var fs = require("fs"),
		url = require("url"),
		mime = require("mime"),
		http = require("http"),
		path = require("path"),
		exec = require('child_process').exec,
		glob_par = require('../par.js'),
		common = require("./common.js"),
		webServer_Pawel = require("./webServerPawel.js"),
		urlTable = {},
		cientsTable = {},
		serverHttp;


    serverHttp =  http.createServer(function (req, res) {
        var reqFile,
			callback,
			get,
			filePath;

		if (cientsTable[req.connection.remoteAddress] == undefined) {
			console.log("nowy klient: " + req.connection.remoteAddress + " pyta o stronę " + req.headers.host);
		}
		cientsTable[req.connection.remoteAddress] = (new Date()).getTime();

		reqFile = url.parse(req.url, true).pathname;
		if (reqFile.indexOf("/min/") === 0) {
			if (reqFile === "/min/json/konfiguracja.json") { req.url = reqFile = "/json/konfiguracja_min.json"; }
			else {
				req.url = req.url.substring(4);
				reqFile = reqFile.substring(4);
			}
		}
		// } else if (req.connection.remoteAddress !== "127.0.0.1") { //sprawdzenie kto pyta
		if (req.headers.host !== "127.0.0.1:" + glob_par.WEB_PORT) {	//sprawdzeni o co pyta
			// if (reqFile === "/skrypty/wspolne/zmienneGlobalne.js") { req.url = reqFile = "/skrypty/wspolne/zmienneGlobalneProxy.js"; }
			if (reqFile === "/json/konfiguracja.json") { req.url = reqFile = "/json/konfiguracja_proxy.json"; }
		}
		// if (reqFile !== "/dane") { console.log(reqFile); }

		res.connection.setNoDelay(true);		//Bardzo ważne - bez tego wpisy każdy plik ma opóźnienie ok 200ms
		if (urlTable[reqFile]) {
			get = url.parse(req.url, true).query;
			callback = null;
			if (get.jsoncallback) {
				callback = get.jsoncallback;
			}
            if (get.callback) {
                callback = get.callback;
            }
			// res.connection.setNoDelay(true);		//Bardzo ważne - bez tego wpisy każdy plik ma opóźnienie ok 200ms
            res.writeHead(200, {"Content-Type": "application/json"});
			urlTable[reqFile](callback, res, get, req);
        } else {
            if (reqFile === '/') {
                filePath = glob_par.WEB_DIR + '/index.html';
            } else {
                filePath = glob_par.WEB_DIR + req.url;
            }
// console.log(filePath);
            fs.exists(filePath, function (exists) {
                if (exists) {
                    res.writeHead(200, {"Content-Type" : mime.lookup(path.basename(filePath))});
					var r_str = fs.createReadStream(filePath);
//					res.on('unpipe', function (src) {
//						console.error('something has stopped piping into the writer');
//						console.error(src);
//					});
					res.on('end', function () {
//						console.log('Koniec write');
					});
					r_str.on('end', function () {
						res.end();
//						console.log('Koniec read');
					});
					r_str.on('error', function () {
						res.end();
						console.log('Error\n');
					});
                    r_str.pipe(res, { end: false });
//					console.log("53: "+filePath);
                } else {
                    res.writeHead(404, {"Content-Type": "text/plain" });
                    res.write('Error 404: resource not found.');
                    res.end();
                }
            });
        }
    });

	serverHttp.on('error', function (er) {
		console.log('serverHttp error');
		console.log('serverHttp error ' + glob_par.WEB_PORT);
		if (er.code === "EADDRINUSE") {
			http.get({ host: '127.0.0.1', port: glob_par.WEB_PORT, path: "/exit" }, function (res2) {
				console.log(res2);
				process.exit(1);
			});

		}
		console.log(er);
	});

	function StartServer() {
        serverHttp.listen(glob_par.WEB_PORT);
		webServer_Pawel.init({AddUrl : addUrl});
        console.log("HTTP Server listening on port " + glob_par.WEB_PORT);
		if (glob_par.WEB_REFRESH) {
			setInterval(function(){
				if (cientsTable["127.0.0.1"] == undefined || (new Date()).getTime() - cientsTable["127.0.0.1"] > glob_par.WEB_REFRESH) {
					console.log("refresh browser");
					common.refresh_browser(null);
				}
			}, 1000);
		}
	}

	addUrl("/exit", function (jsonp, res, get) {
		serverHttp.close(function () {
			res.writeHead(200, {"Content-Type": "text/plain" });
			res.write('exit OK');
			res.end();
			process.exit(0);
		});
	});

	function addUrl(name, callback) {
		urlTable[name] = callback;
	}
	
    module.exports.StartServer = StartServer;
    module.exports.AddUrl = addUrl;
}());
