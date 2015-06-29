// can_monitor.js
(function () {
    "use strict";
	var client,
		num = 0,
		net = require('net');

	function get_data(dane) {
		var str = dane.toString(),
			len = str.length;
		str = str.substring(0, len - 2);
		console.log(str);
	}

	function can(onConnect) {
		client = new net.Socket();
		// client.setTimeout(2000, function() { console.log("timeout")});
		client.on('data', get_data);
		client.on('connect', function () {
			console.log("on Connect 0");
			onConnect();
		});
		client.on('error', function (err) {
			console.log(num + ": Strada ErRoR: " + err.code);
		});
		client.on('close', function () {
			console.log('client.on(close)');
		});
		client.connect(7234, "192.168.3.90");
	}

	function send(text) {
		console.log(num + ": " + text);
		text = "[" + num + "] " + text + "\n\r";
		num += 1;
		client.write(text);
	}

	function read(adr, index, subindex) {
		send(adr + " r " + index + " " + subindex + " u32");
	}

	function log(on) {
		send("_port_set logging " + on);
	}

	can(function () {
		// send("info version");
		// read(4, 0x1018, 0);
		log(1);
		// send("4 r 0x1018 2 u32");
	});

    module.exports.can = can;
    module.exports.send = send;
}());
