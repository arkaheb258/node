// stradaDane.js
'use strict';
var common = require("./common.js");

module.exports = function(Strada, socket) {
  var errorInterval = null;

  /**
   * Description
   * @method DecodeStrada302
   * @param {Buffer} data
   * @return ThisExpression
   */
  Strada.prototype.DecodeStrada302 = function(data) {
    if (data.length < 20) { return "ERROR"; }
    var BlockRW = require("./blockrw.js");
    var br = new BlockRW();
    var TimeStamp = br.read(data);
    this.TimeStamp_s = (TimeStamp[1] << 16) + TimeStamp[0];
    this.TimeStamp_ms = (TimeStamp[3] << 16) + TimeStamp[2];
    this.TimeStamp_js = (this.TimeStamp_s * 1000 + this.TimeStamp_ms % 1000);

    //konwersja UTC -> czas lokalny
    var d = new Date(this.TimeStamp_js);
    var n = d.getTimezoneOffset();
    d.setMonth(0);
    n -= d.getTimezoneOffset();
    var gpar = common.getGpar();
    if (gpar) {
      if (gpar.rKonfCzasStrefa !== undefined) {
        this.TimeStamp_js += (gpar.rKonfCzasStrefa - 12) * 3600000;
      }
      if (gpar.rKonfCzasLetni) { this.TimeStamp_js -= n * 60000; }
      if (gpar.sKonfNrKomisji) { this.komisja = gpar.sKonfNrKomisji; }
    }
    var SpecData = br.read(data);
    this.wDataControl = SpecData[0];
    this.wData = SpecData;
    br = new BlockRW(24);
    this.Analog = br.read(data, true);
    this.Bit = br.read(data);
    this.Mesg = br.read(data);
    this.MesgType = br.read(data);
    this.MesgStatus = br.read(data);
    this.BlockUsr = br.read(data);
    this.BlockSrvc = br.read(data);
    this.BlockAdv = br.read(data);
    return this;
  }

  //funkcja emitujaca blad danych w celu podtrzymania polaczenia z wizualizacja
  function daneErrIntervalFun(self){ 
    // var self = this;
    if (!self.PLCConnected && self.socket) { 
      var dane = common.getDane();
      if (dane) {
        console.log(dane.error);
        self.socket.emit('dane', dane); 
      } else {
        self.socket.emit('dane', {error: "Brak połączenia z PLC"});
        // console.log('dane.error');
      }
    }
  }
  
  /**
   * Description
   * @method MySetInterval
   * @param {function} fun
   * @param {Number} interval
   */
  function MySetInterval(self, fun, interval) {
    //problem z this przy use strict gdy brak new przy wywołaniu
    if (typeof interval !== 'number') {
      interval = parseInt(interval, 10);
    }
    if (!this.start) {
      this.start = new Date().getTime();
      this.start -= this.start % interval;  //zaokrglenie czasu startu
      this.nextAt = this.start;
    }
    this.nextAt += interval;
    var delay =  this.nextAt - new Date().getTime();
  //    console.log("delay = "+delay + "ms");
    if (self.PLCConnected) {
      setTimeout(function () {
        this.interval = new MySetInterval(self, fun, interval);
      }, delay);
    } else {
      this.start = 0;
      this.nextAt = 0;
    }
    fun();
  }

  /**
   * Description
   * @method startInterval
   * @param {function} callback
   */
  Strada.prototype.startInterval = function () {
    // console.log("StradaStartInterval");
    var self = this;
    MySetInterval.start = 0;
    if (errorInterval) { clearInterval(errorInterval); }
    // stradaIntEnabled = true;
    var temp = new MySetInterval(self, function () {
      // console.log("StradaStartInterval ex");
      self.stradaEnqueue(0x302, 0, function (dane) {
        if (dane.error) {
          dane = {error: "Utracono połączenie z PLC: " + dane.error};
          // console.log("zerwane połączenie ze sterownikiem");
          console.log(dane);
        } else {
          dane = new self.DecodeStrada302(dane.dane);
          // strada_req_time = (dane.wDataControl === 1);
          if (dane.wDataControl === 1) {
            // console.log('Sterownik rząda daty 1');
            self.socket.emit('io_emit', ['strada_req_time']);
          }
        }
        common.storeDane(dane);
        self.socket.emit('dane', dane);
      });
    }, self.interval);
  };

  
  Strada.prototype.stopInterval = function () {
    var self = this;
    // console.log('Stop interval');
    this.clearQueue(true);
    // stradaIntEnabled = false;
  //gdy brak polaczenia wysyla tresc bledu co 1s
    if (errorInterval) { clearInterval(errorInterval); }
    errorInterval = setInterval(function(){daneErrIntervalFun(self)}, 1000);
  };
  
  return Strada;
};
