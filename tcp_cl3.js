// tcp_cl3.js - zarządzanie uruchomieniem programu i logowanie do pliku
(function () {
    "use strict";
	var http = require('http'),
		glob_par = require('./par.js'),
		common = require("./node/common.js"),
		mime = require("./node/node_modules/mime"),
		path = require("path"),
		cp = require("child_process"),
		fs = require("fs"),
		url = require("url"),
		spawn = cp.spawn,
		child,
		NTP_IP_i = 0,
		// get,
		// start_iter = 0,
		buf_str = "",
		log_str = "",
		err_str = "",
		last_dump = 0,
		last_dump_e = 0,
		last_dump_l = 0,
		updating = false,
		serverHttp;

	function mylog(str) {
		var d = new Date();
		console.log(str);
		if (glob_par.LOG_DIR) {
			if (str) { buf_str += d.getTime() + ": " + str; } // + "\n"; }
			if (d.getTime() - last_dump > 100 || buf_str.length > 100) {
				fs.appendFile(glob_par.LOG_DIR + '/tcp_cl3.err', buf_str, function () {
//					mylog((new Date()).getTime());
				});
				buf_str = "";
				last_dump = d.getTime();
			}
		}
	}

	function startApp() {
		mylog("startApp()");
		// mylog("startApp()");
		child = spawn('node', [glob_par.NODE_MAIN]);

		child.stdout.setEncoding('utf8');
		child.stdout.on('data', function (data) {
			var str = data.toString(),
				d = new Date();
			if (str) { log_str += d.getTime() + ": " + str; } // + "\n";
			if (d.getTime() - last_dump_l > 100 || log_str.length > 200) {
				fs.appendFile(glob_par.LOG_DIR + '/main.log', log_str, function () {
				});
				log_str = "";
				last_dump_l = d.getTime();
			}
		});

		child.stderr.setEncoding('utf8');
		child.stderr.on('data', function (data) {
			var str = data.toString(),
				d = new Date();
//			mylog(str);
			// fs.appendFile(glob_par.LOG_DIR + '/main.err', d.getTime() + ": " + str, function () {});
			if (str) { err_str += d.getTime() + ": " + str; } // + "\n";
			if (d.getTime() - last_dump_e > 100 || err_str.length > 200) {
				fs.appendFile(glob_par.LOG_DIR + '/main.err', err_str, function () {
				});
				err_str = "";
				last_dump_e = d.getTime();
			}
		});

		child.on('close', function (code) {
			mylog('child process exit code ' + code);
//			mylog('child process exit code ' + code);
			setTimeout(function () {
				child = null;
				restartApp();
			}, 500);
		});
	}

	function restartApp(req, res) {
		mylog("restartApp()");
		if (child) {
			mylog("child.kill()");
			child.kill();
		}
		startApp();
		if (res) { res.send('ok.'); }
	}

	startApp();

	if (process.platform === "linux") {
		if (glob_par.NTP_HWCLOCK) {
			// cp.exec("sudo hwclock -r -f /dev/rtc1", { timeout: 2000 }, function (error, stdout, stderr) {
			cp.exec("sudo hwclock -s -f /dev/rtc1", { timeout: 2000 }, function (error, stdout, stderr) {
				console.log({type: "hwclock", date: new Date(), error: error, err: stderr, out: stdout});
			});
		}
		cp.exec("chromium -kiosk -incognito http://127.0.0.1:8888/min/ &", 
		function (error, stdout, stderr) {
			console.log({type: "chromium", error: error, err: stderr, out: stdout});
		});
		cp.exec("sleep 10 && xdotool mousemove --sync 465 20 click 1 && sleep 1 && xdotool mousemove --sync 0 0 click 1", 
		function (error, stdout, stderr) {
			console.log({type: "click", error: error, err: stderr, out: stdout});
		});
		
		//pkill chromium
//		sleep 10 && xdotool mousemove --sync --repeat 2 --delay 500 465 20 click 1 &
//		sleep 1 && xdotool mousemove --sync 0 0 click 1 &
	}
	
	
	serverHttp = http.createServer(function (req, res) {
		var reqFile,
			callback,
			get,
			filePath,
			file,
			d,
			request;
		if ((req.url !== "/log") && (req.url !== "/err") && req.url.indexOf("/proxy_min/dane") !== 0 && req.url.indexOf("/proxy/dane") !== 0) {
			mylog(req.url);
		}
		reqFile = url.parse(req.url, true).pathname;
		get = url.parse(req.url, true).query;

		switch (reqFile) {
		case "/restart":
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			if (child) {
				child.kill();
			}
			if (glob_par.LOG_DIR) {
				try {
					fs.unlinkSync(glob_par.LOG_DIR + '/main.log', function (err) {if (err) { mylog(err); } });
	//				fs.unlinkSync(glob_par.LOG_DIR + '/main.err', function (err) {if (err) { mylog(err); } });
					fs.appendFile(glob_par.LOG_DIR + '/main.err', "\n\r" + new Date() + "\n\r", function (err) {if (err) { mylog(err); } });
				} catch (err) {
					if (err) {
						res.write(err.toString());
						res.end('Restart ERR');
						mylog("restart catch");
						// mylog("restart catch");
						mylog(err);
						// mylog(err);
					}
				} finally {
					res.end('Restart OK');
				}
			} else {
				res.end('Restart OK');
			}
			break;
		case "/log":
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			fs.readFile(glob_par.LOG_DIR + '/main.log', 'utf8', function (err, text) {
				if (err) {
					res.write(err.code);
				} else {
					res.write(text);
				}
				res.end();
			});
			break;
		case "/err":
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			fs.readFile(glob_par.LOG_DIR + '/main.err', 'utf8', function (err, text) {
				if (err) {
					res.write(err.code);
				} else {
					res.write(text);
				}
				res.end();
			});
			break;
		case "/err2":
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			fs.readFile(glob_par.LOG_DIR + '/tcp_cl3.err', 'utf8', function (err, text) {
				if (err) {
					res.write(err.code);
				} else {
					res.write(text);
				}
				res.end();
			});
			break;
		case "/set_time":
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			// set_time(dataa);
			d = new Date();
			res.write(d.toString());
			if (get.time) {
				d.setTime(get.time);
				common.set_time(d);
				// console.log(d);
				// res.write(d.toString());
			}
			res.end();
			break;
		case "/upload":
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			if (get.url) {
				mylog(get);
				if (!get.file) {
					get.file = "def.zip";
				}
				file = fs.createWriteStream(get.file);
				request = http.get(get.url, function (response) {
					response.pipe(file);
					res.end("Done");
				});
			}
			break;
		case "/exit":
			serverHttp.close(function () {
				res.writeHead(200, {"Content-Type": "text/plain" });
				res.write('exit OK');
				res.end();
				child.kill();
				process.exit(0);
			});
			// child.kill();
			// process.exit(0);
			break;
		case "/backup":
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			res.write("Backup start \n\r");
			cp.exec("filetool.sh -b", function (error, stdout, stderr) {
//				mylog("backup");
//				mylog("stdout: "+stdout);
				if (stderr) { mylog("stderr: " + stderr); }
				if (error) { mylog("error: " + error); }
//				res.write(stdout.toString());
				mylog("BACKUP " + stdout.toString());
				res.write("Backup DONE");
				res.end();
			});
			break;
		case "/reboot":
			cp.exec("sudo reboot", function (error, stdout, stderr) {
				res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
//				mylog("reboot");
				if (stderr) {
					if (stderr.indexOf("sudo: command not found") !== -1) {
						mylog("reboot bez sudo");
						cp.exec("reboot");
					} else { mylog("stderr: " + stderr); }
				}
				if (error) { mylog("error: " + error); }
				res.write("Rebooting ...");
				res.end();
			});
			break;
		case "/refresh":
			common.refresh_browser(res);
			break;
		case "/chrome":
			cp.exec("export DISPLAY=:0 && google-chrome http://127.0.0.1:8888/ -kiosk -incognito", function (error, stdout, stderr) {
				res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
//				mylog("reboot");
				if (stderr) { mylog("stderr: " + stderr); }
				if (error) { mylog("error: " + error); }
				res.write("...");
				res.end();
			});
			break;
		case "/time":
			common.getTime(function (data) {
				res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
				if (data.type) { res.write('type: ' + data.type.toString() + "\n"); }
				if (data.date) { res.write('date: ' + data.date.toString() + "\n"); }
				if (data.error) { res.write('error: ' + data.error.toString() + "\n"); }
				if (data.err) { res.write('err: ' + data.err.toString() + "\n"); }
				if (data.out) { res.write('out: ' + data.out.toString() + "\n"); }
				res.end();
				// console.log(data);
			});
			break;
		case "/zip":
			if (!get.file) {
				get.file = "dane";
			}
			cp.exec("tar -zcvf " + glob_par.ADM_WEB_DIR + "/" + get.file + ".tar.gz " + glob_par.LOGGER_DIR, function (error, stdout, stderr) {
				res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
				if (stderr) { mylog("stderr: " + stderr); }
				if (error) { mylog("error: " + error); }
				res.write(stdout.toString());
				res.write('<br/><a href="/' + get.file + '.tar.gz">Pobierz dane</a>');
//				res.write(get.file + ".tar.gz");
				res.end();
			});
			break;
		case "/update":
			if (!get.file) {
				get.file = "update";
			}
			cp.exec("tar -zxvf " + get.file + ".tar.gz", function (error, stdout, stderr) {
				res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
				if (stderr) { mylog("stderr: " + stderr); }
				if (error) { mylog("error: " + error); }
				res.write(stdout.toString());
				res.write("...");
				res.write(get.file + ".tar.gz");
				res.end();
			});
			break;
		default:
			if (req.url === '/') { req.url = '/index.html'; }
			filePath = glob_par.ADM_WEB_DIR + req.url;
			if (req.url.indexOf("/proxy") === 0) {
				// mylog("/proxy");
				// mylog(req.url);
				if (req.url.indexOf("/proxy_min") === 0) {
					req.url = req.url.substring(10);
					if (req.url === "/json/konfiguracja.json") {
						req.url = "/json/konfiguracja_min.json";
					}
				} else {
					req.url = req.url.substring(6);
					if (req.url === "/json/konfiguracja.json") {
						req.url = "/json/konfiguracja_proxy.json";
					}
				}
				// if (req.url === "/skrypty/wspolne/zmienneGlobalne.js") {
					// req.url = "/skrypty/wspolne/zmienneGlobalneProxy.js";
				// }
				if (req.url === '/') { req.url = '/index.html'; }
				http.get({ host: '127.0.0.1', port: glob_par.WEB_PORT, path: req.url }, function (res2) {
					// console.log(res2.headers);
					if (req.url === "/dane") {
						// res.writeHead(200, {"Content-Type" : "application/json"});
						res.writeHead(200, res2.headers);
					} else {
						res.writeHead(200, {"Content-Type" : mime.lookup(path.basename(req.url))});
					}
					res2.on('data', function (chunk) {
						res.write(chunk);
					});
					res2.on('end', function () {
						res.end();
					});
				}).on('error', function (e) {
					res.write(e.message);
					res.end();
				});
			} else {
				// if (reqFile === '/') {
					// filePath = glob_par.ADM_WEB_DIR + '/index.html';
				// }
				mylog(filePath);

				fs.exists(filePath, function (exists) {
					if (exists) {
						res.writeHead(200, {"Content-Type" : mime.lookup(path.basename(filePath))});
						var r_str = fs.createReadStream(filePath);
						res.on('unpipe', function (src) {
							console.error('something has stopped piping into the writer');
						});
						res.on('end', function () {
	//						mylog('Koniec write');
						});
						r_str.pipe(res, { end: false });
						r_str.on('end', function () {
							res.end();
	//						mylog('Koniec read');
						});
						r_str.on('error', function () {
							res.end();
							mylog('Error\n');
						});
	//					mylog("53: "+filePath);
					} else {
						res.writeHead(404, {"Content-Type": "text/plain" });
						res.write('Error 404: resource not found.');
						res.end();
					}
				});
			}
			break;
		}
	});

	serverHttp.on('error', function (er) {
		mylog('serverHttp error ' + glob_par.NODE_DIAGN_PORT);
		// mylog('serverHttp error ' + glob_par.NODE_DIAGN_PORT);
		mylog(er);
		// mylog(er);
	});

	serverHttp.listen(glob_par.NODE_DIAGN_PORT);

	if (process.platform === "linux") {
		setInterval(function () {
			// console.log("check update");
			fs.exists("/media/NODE_UPDATE/update.sh", function (exists) {
				if (exists) {
					if (!updating) {
						console.log("update start");
						updating = true;
						cp.exec('cp /media/NODE_UPDATE/update.sh ~/update.sh && chmod +x ~/update.sh && sudo ~/update.sh', function (error, stdout, stderr) {
							if (stderr) { console.log("stderr: " + stderr); }
							if (error) { console.log("error: " + error); }
							console.log("stdout: " + stdout);
							restartApp();
							common.refresh_browser(null);
							updating = false;
						});
					}
				}
			});
		}, 10000);
	}

	if (glob_par.LOG_DIR) {
        common.CreateDir(glob_par.LOG_DIR, function () {
			try {
				fs.unlinkSync(glob_par.LOG_DIR + '/main.log', function (err) {if (err) { mylog(err); } });
				fs.unlinkSync(glob_par.LOG_DIR + '/main.err', function (err) {if (err) { mylog(err); } });
				// fs.appendFile(glob_par.LOG_DIR + '/main.err', "\n\r" + new Date() + "\n\r", function (err) {if (err) { mylog(err); } });
				// fs.appendFile(glob_par.LOG_DIR + '/main.log', "\n\r" + new Date() + "\n\r", function (err) {if (err) { mylog(err); } });
			} catch (err) {
				if (err) {
					mylog("init catch");
					mylog(err);
				}
			// } finally {
				// startApp();
			}
		}, mylog);
	}

}());