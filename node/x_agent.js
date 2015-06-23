var socket = require('socket.io-client')('http://127.0.0.1:8888');
var cp = require('child_process');

socket.on('connect', function () {console.log('connect'); });

socket.on('x_agent', function (msg) {
    console.log('x_agent: ' + msg);
	cp.exec(msg, function (error, stdout, stderr) {
		if (stderr) { console.log("stderr: " + stderr); }
		if (error) { console.log("error: " + error); }
		console.log(stdout);
	});
});

socket.on('disconnect', function () {
	console.log('disconnect');
	setTimeout(function () {
		socket.connect();
	}, 1000);
});

setTimeout(function () {
	cp.exec("sleep 100 && xdotool mousemove --sync 0 0 click 1",
		function (error, stdout, stderr) {
			console.log({type: "click", error: error, err: stderr, out: stdout});
		});
}, 1000);

/**
 * Description
 * @method refresh_browser
 * @param {} res
 */
function refresh_browser(res) {
//return;
	if (process.platform === "linux") {
		console.log('xdotool search --onlyvisible --name "chromium" windowactivate --sync key --delay 250 F5');
		cp.exec('xdotool search --onlyvisible --name "chromium" windowactivate --sync key --delay 250 F5', 
		function (error, stdout, stderr) {
			if (stderr) { console.log("stderr: " + stderr); }
			if (error) { console.log("error: " + error); }
			if (res) {
				res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
				res.write("refreshing ...");
				res.end();
			}
		});
	} else {
		if (res) {
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			res.end("Platforma nie obslugiwana");
		}
	}
}
