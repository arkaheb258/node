// strada.js
'use strict';
var common = require('./common.js');
var debug = false;

function Strada(socket, client) {
  var self = this;
  this.client = client;
  this.socket = socket;
  this.interval = 200;
  this.parFilename = 'default.json';
  this.PLCConnected = false;
  this.tempKonf = {dane: new Buffer(0), DataLen: 0};
  require('./stradaPar.js')(Strada, socket);
  require('./stradaDane.js')(Strada, socket);
  require('./stradaConn.js')(Strada, socket);

  client
    .on('data', function(dane) {
      self.getData(dane);
    })
    .on('connect', function () {
      console.log('Strada Polaczono ....');
      self.PLCConnected = true;
      self.odswierzParametry();
      self.startInterval();
    })
    .on('error', function (err) {
      console.log('Strada ErRoR: ' + err.code);
      socket.emit('dane', {error: 'Strada client ErRoR: ' + err.code });
      self.PLCConnected = false;
      self.stopInterval();
    })
    .on('close', function () {
      // console.log('client close');
      client.destroy();
      socket.emit('dane', {error: 'Strada Connection closed'});
      self.PLCConnected = false;
      self.stopInterval();
    });
  
  self.stopInterval();
  socket.on('get_gpar', function (msg) {
    console.log(' on get_gpar');

    // jezeli freshPar -> wyslij
    // if (!force && freshPar > 0) {
      // socket.emit('gpar', gpar);
      // return;
    // }
    //do zmiany (przemyslenia)
    // freshPar = 1;
    
    //dodac callback z zapisem(store + emit)
    // console.log('odswierzParametry ', force, ' ', freshPar);
    // parametry.
    if (self.PLCConnected)
      self.odswierzParametry(msg);
  });
};

module.exports = Strada;
