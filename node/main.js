// main.js
(function () {
  'use strict';
  var argv = require('minimist')(process.argv.slice(2));
  var port = argv.port || 8888;
  var socket = require('socket.io-client')('http://127.0.0.1:' + port);
  var EverSocket = require('eversocket').EverSocket;
  var CONNECT_TIMEOUT_MS = (argv.interval || 200) * 5;

  var client = new EverSocket({
    reconnectWait: CONNECT_TIMEOUT_MS,  // wait after close event before reconnecting
    timeout: CONNECT_TIMEOUT_MS,    // set the idle timeout
    reconnectOnTimeout: true    // reconnect if the connection is idle
  });

  var Strada = require('./strada.js');
  var strada = new Strada(socket, client);
  require('./strada_rozk.js')(strada, socket);

  client.connect(20021, '192.168.3.30');
}());
