// webServer.js
(function () {
    "use strict";
    var express = require('express'),
		path = require("path"),
    	app = express(),
        http2 = require('http').Server(app),
		common = require("./common.js"),
		parametry = require("./parametry.js"),
		glob_par = require('../par.js'),
        io = require('socket.io')(http2);

	if (!glob_par.WER_NODE) {
		glob_par.WER_NODE = "1.?.?";
	}

	// gzip/deflate outgoing responses
	var compression = require('compression')
	app.use(compression());

	app.use(function(req, res, next) {
		console.log(req.connection.remoteAddress + " -> " + req.url);
		res.connection.setNoDelay(true);		//Bardzo ważne - bez tego wpisy każdy plik ma opóźnienie ok 200ms
		next();
	})

	function odsw_par_i_podstaw_wer_jezyk(fileName, fileType, edit_fun, callback){
		parametry.odswierzParametry(function (temp) {
			if (!temp || (typeof temp === 'string')) {
//				console.log("TCP - Brak połączenia z PLC");
				callback("Brak połączenia z PLC (" + fileName + fileType + ")");
			} else {
				console.log(typeof temp);
				var file_to_read = common.wer_jezykowa(temp, fileName, fileType);
				console.log('file_to_read');
				if (file_to_read) {
					fs.readFile(file_to_read, 'utf8', function (err, text) {
						if (err) {
							callback(fileName + fileType + " error");
						} else {
							if (edit_fun) {
								callback(edit_fun(text, temp));
							} else {
								callback(text);
							}
						}
					});
				} else {
					callback("Błąd odczytu parametrow (" + fileName + fileType + ")");
				}
			}
		});
	
	}

    app.get('/json/parametry.json', function (req, res) {
		odsw_par_i_podstaw_wer_jezyk("parametry", ".json", common.czytajPlikParametrowWiz, function(text){
			res.jsonp(text);
		});
    });

    app.get('/json/sygnaly.json', function (req, res) {
		odsw_par_i_podstaw_wer_jezyk("sygnaly", ".json", common.czytajPlikSygnalow, function(text){
			res.jsonp(text);
		});
    });

    app.get('/json/komunikaty.json', function (req, res) {
		odsw_par_i_podstaw_wer_jezyk("komunikaty", ".json", null, function(text){
			res.jsonp(JSON.parse(text));
		});
    });

    app.get('/json/konfiguracja.json', function (req, res) {
		odsw_par_i_podstaw_wer_jezyk("konfiguracja", ".json", null, function(text){
			if (text !== null) {
	//			text = text.replace(new RegExp('"czyNaviRamkaPLC":true', 'g'), '"czyNaviRamkaPLC":false');
				text = text.replace(new RegExp('"verSerwer":"0.0.0"', 'g'), '"verSerwer":"' + glob_par.WER_NODE + '"');
				text = text.replace(new RegExp('"WER_NODE":"0.0.0"', 'g'), '"WER_NODE":"' + glob_par.WER_NODE + '"');
			} else {
				text = "text null";
			}
			res.jsonp(JSON.parse(text));
		});
    });

    app.get('/', function (req, res) {
//        res.sendFile(__dirname + '/../www/index.html');
        res.sendFile(path.resolve('../www/index.html'));
    });

	app.use(express.static('../www'));


    io.on('connection', function (socket) {
        console.log('a user connected');

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });

    http2.listen(5000, function () {
        console.log('listening on *:5000');
    });

    setInterval(function(){ 
        io.sockets.emit('data', {
                'topic':'data',
                'payload':(new Date()).toLocaleTimeString()
            }
        );
    }, 100);

    setInterval(function(){ 
        var d = (new Date());
//        console.log(d.getTime());
        io.sockets.emit('dane', {"TimeStamp_s":Math.round(d.getTime()/1000),"TimeStamp_ms":d.getTime()%(1000*60*60*24),"TimeStamp_js":d.getTime(),"komisja":"01H900","wDataControl":0,"wData":[0,0,0,0,0,0],"Analog":[0,0,0,0,0,0,0,2500,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,12,0,0,0,0,0,0,0,1355,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4160],"Bit":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,8192,0,0,0,0,0,0,0,14,0,2,0,26624,0,0,0],"Mesg":[18755,5202,21589,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32768,256,0,0,0,0,0,0,0,18432,1121,36929,1168,0,0,928,0,0,21,0,0,0],"MesgType":[768,710,0,32768,39034,43024,2439,31361,4248,34728,265,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9792,49186,20752,1284,5104,417,32768,258,57344,1055,0,0,0,0],"MesgStatus":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"BlockUsr":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"BlockSrvc":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"BlockAdv":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]});
    }, 100);


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

	function addUrl(name, callback) {
		urlTable[name] = callback;
	}

	addUrl("/exit", function (jsonp, res, get) {
		serverHttp.close(function () {
			res.writeHead(200, {"Content-Type": "text/plain" });
			res.write('exit OK');
			res.end();
			process.exit(0);
		});
	});

    module.exports.StartServer = StartServer;
    module.exports.AddUrl = addUrl;
}());
