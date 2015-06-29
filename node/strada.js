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

/**
 * Description
 * @method encodeStrada202
 * @param {Object} data
 * @return outBuff
 */
Strada.prototype.encodeStrada202 = function(data) {
  var BlockRW = require("./blockrw.js");
  var outBuff;
  var bw;
  if (!data.BlockUsr) {
    console.log('Brak BlockUsr');
    data.BlockUsr = [];
  }
  if (!data.BlockSrvc) {
    console.log('Brak BlockSrvc');
    data.BlockSrvc = [];
  }
  if (!data.BlockAdv) {
    console.log('Brak BlockAdv');
    data.BlockAdv = [];
  }
  bw = new BlockRW();
  outBuff = bw.write(data.BlockUsr, false);
  outBuff = Buffer.concat([outBuff, bw.write(data.BlockSrvc, false)]);
  outBuff = Buffer.concat([outBuff, bw.write(data.BlockAdv, false)]);

  if (outBuff.length % 4) {
    outBuff = Buffer.concat([outBuff, new Buffer([0, 0])]);
  }
  return outBuff;
}

/**
 * Description
 * @method decodeStrada308
 * @param {Buffer} dane
 * @return out
 */
Strada.prototype.decodeStrada308 = function(dane) {
  var out = [];
  var gpar = common.getGpar();
  var i = 0;
  while (i < dane.length) {
    var temp = {};
    temp.nr = dane.readUInt16LE(i) & 0x7FFF;
    if (dane.readUInt16LE(i) > 0x8000) {
      temp.typ = 'Ostrzeżenie';
    } else {
      temp.typ = 'Alarm';
    }
    i += 2;
    temp.czas = dane.readUInt32LE(i) * 1000;
    i += 4;
    if (temp.czas === 0 && temp.nr === 0) {
      break;
    }
    var d = new Date(temp.czas);
    var n = d.getTimezoneOffset();
    d.setMonth(0);
    n -= d.getTimezoneOffset();
    if (gpar) {
      if (gpar.rKonfCzasStrefa !== undefined) {
        temp.czas += (gpar.rKonfCzasStrefa - 12) * 3600000;
      }
      if (gpar.rKonfCzasLetni) {
        temp.czas -= n * 60000;
      }
    }
    out.push(temp);
  }
  return out;
}


module.exports = Strada;
