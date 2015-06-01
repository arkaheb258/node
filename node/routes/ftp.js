// routes/ftp.js
(function () {
    "use strict";
	var express = require('express'),
		router = express.Router(),
		ftp = require("ftp"),
		glob_par = require('../par.js'),
		url = require("url"),
		last_res = null;

	router.get('*', function(req, res) {
		console.log(req.url);
		if(!c.connected){
			// c.end();
			c.destroy();
			c.connect({"host" : glob_par.PLC_IP, "user" : "admin", "password" : "admin", "connTimeout" : 2000, "pasvTimeout" : 2000});
		}
		last_res = res;
		c.get(req.url, function (err, stream) {
			if (err) {
				console.log("FTP get error");
				console.log(err);
				c.destroy();
				res.status(404);
				res.end();
				last_res = null;
				// res.render('error', { error: "Brak wymaganych parametrów." });
				return;
			}
			c.on('readable', function (dane) {
				var chunk;
				while (null !== (chunk = c.read())) {
					console.log('got %d bytes of data', chunk.length);
				}
			});
			var string = "";
			stream.on('data', function (response) {
				string += response;
				// console.log(response);
			});
			stream.once('close', function () {
				console.log("FTP pobrano " + req.url);
				res.send(string);
				// c.destroy();
				c.end();
				last_res = null;
			});
		});
	});

	var c = new ftp();
	c.on('ready', function () {
		console.log("FTP ready");
	});
	c.on('timeout', function () {
		console.log("FTP timeout");
	});
	c.on('error', function () {
		if (last_res){
			last_res.status(404);
			last_res.end();
		}
		console.log("FTP error");
	});
	// c.connect({"host" : "192.168.3.30", "user" : "admin", "password" : "admin", "connTimeout" : 2000, "pasvTimeout" : 2000});
	
	module.exports = router;
}());