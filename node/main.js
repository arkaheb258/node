/**
 *  @file main.js
 *  @brief Brief
 */
(function() {
  'use strict';
  var argv = require('minimist')(process.argv.slice(2));
  argv.port = argv.port || 8888;
  if (argv.cache) { require('cache-require-paths'); }
  var socket = require('socket.io-client')('http://127.0.0.1:' + argv.port);
  var EverSocket = require('eversocket').EverSocket;
  var Strada = require('./strada.js');

  var client = new EverSocket({
    reconnectWait: 1000,      // Wait after close event before reconnecting
    timeout: 1000,            // Set the idle timeout
    reconnectOnTimeout: true  // Reconnect if the connection is idle
  });

  var strada = new Strada(socket, client);
  require('./stradaRozk.js')(strada, socket);
  if (argv.interval !== undefined) { strada.setInterval(argv.interval); }
  client.connect(20021, '192.168.3.30');
}());
