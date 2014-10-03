// strada_serv.js
(function () {
    "use strict";
	var net = require('net'),
		glob_par = require('../par.js'),
		strada = require("./strada.js"),
		server,
		dane302;	//usuniete w strada - do zastanowienia

	server = net.createServer(function (c) { //'connection' listener
		console.log('server connected');
		c.on('end', function () {
			console.log('server disconnected');
		});
		c.on('error', function () {
			console.log('server error');
		});
		c.on('data', function (dane) {
			var DstID = dane.readUInt32LE(0),
				SrcID = dane.readUInt32LE(4),
				Dir = dane.readUInt16LE(8),
				instrNo = dane.readUInt16LE(10),
				instrID = dane.readUInt16LE(12),
				DataLen = dane.readUInt16LE(14),
				temp_out_buff;

			dane = dane.slice(16);
			temp_out_buff = new Buffer(16);
			temp_out_buff.fill(0);
			temp_out_buff.writeUInt32LE(SrcID, 0);
			temp_out_buff.writeUInt32LE(DstID, 4);
			temp_out_buff.writeUInt16LE(instrNo, 10);
			temp_out_buff.writeUInt16LE(instrID, 12);
			if (instrNo !== 0x302) { console.log("external instrNo: " + instrNo); }
			switch (instrNo) {
			case 0x302:	//Odczytanie obszaru danych wizualizacyjnych kombajnu - wyslanie z bufora
				temp_out_buff = new Buffer.concat([temp_out_buff, dane302.RawHead, dane302.dane]);
				temp_out_buff.writeUInt16LE(dane302.Dir, 8);
				temp_out_buff.writeUInt16LE(temp_out_buff.length - 16, 14);
				c.write(temp_out_buff);
				break;
			default:
				strada.stradaEnqueue(0x0, [instrNo, dane], function (dane2) {
					temp_out_buff = new Buffer.concat([temp_out_buff, dane2.RawHead, new Buffer(dane2.dane)]);
					temp_out_buff.writeUInt16LE(dane2.Dir, 8);
					temp_out_buff.writeUInt16LE(temp_out_buff.length - 16, 14);
					c.write(temp_out_buff);
				});
				break;
			}
		});
	});

	function startStradaServer() {
		server.listen(glob_par.STRADA_PORT, function () { //'listening' listener
//			console.log('server bound');
		});
	}

    module.exports.startServer = startStradaServer;
}());
