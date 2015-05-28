var socket = require('socket.io-client')('http://127.0.0.1:8888'),
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
