var socket = require('socket.io-client')('http://127.0.0.1:8889'),
	cp = require('child_process');

socket.on('connect', function(){console.log('connect');});

socket.on('x_agent', function(msg){
    console.log('x_agent: ' + msg);
	cp.exec(msg, function (error, stdout, stderr) {
		if (stderr) { console.log("stderr: " + stderr); }
		if (error) { console.log("error: " + error); }
		console.log(stdout);
	});
});

socket.on('disconnect', function(){
	console.log('disconnect')
	setTimeout(function(){ 
		socket.connect();
	}, 1000);
});

setTimeout(function(){ 
	cp.exec("sleep 100 && xdotool mousemove --sync 0 0 click 1", 
	function (error, stdout, stderr) {
		console.log({type: "click", error: error, err: stderr, out: stdout});
	});
}, 1000);
