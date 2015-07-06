// main.js
(function () {
  'use strict';
  var argv = require('minimist')(process.argv.slice(2));
  var port = argv.port || 8888;
  var socket = require('socket.io-client')('http://127.0.0.1:' + port);
  var EverSocket = require('eversocket').EverSocket;

  var client = new EverSocket({
    reconnectWait: 1000,  // wait after close event before reconnecting
    timeout: 1000,    // set the idle timeout
    reconnectOnTimeout: false    // reconnect if the connection is idle
  });

  var Strada = require('./strada.js');
  var strada = new Strada(socket, client);
  require('./stradaRozk.js')(strada, socket);
  if (argv.interval !== undefined) { strada.interval = argv.interval; }
  client.connect(20021, '192.168.3.30');
}());
