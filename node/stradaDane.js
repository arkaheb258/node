// stradaDane.js
'use strict';
var common = require('./common.js');
var decode = require('./decode.js');

module.exports = function(Strada, socket) {
  var errorInterval = null;

  //funkcja emitujaca blad danych w celu podtrzymania polaczenia z wizualizacja
  function daneErrIntervalFun(self){ 
    // var self = this;
    if (!self.PLCConnected && self.socket) { 
      var dane = common.getDane();
      if (dane) {
        // console.log('dane.error');
        console.log(dane.error);
        self.socket.emit('dane', dane); 
      } else {
        self.socket.emit('dane', {error: 'Brak połączenia z PLC'});
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
  function MySetInterval(strada, fun) {
    //problem z this przy use strict gdy brak new przy wywołaniu
    if (!this.start) {
      this.start = new Date().getTime();
      this.start -= this.start % strada.interval;  //zaokrglenie czasu startu
      this.nextAt = this.start;
    }
    this.nextAt += strada.interval;
    var delay =  this.nextAt - new Date().getTime();
  //    console.log('delay = '+delay + 'ms');
    if (strada.PLCConnected) {
      setTimeout(function () {
        this.interval = new MySetInterval(strada, fun);
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
    // console.log('StradaStartInterval');
    var self = this;
    MySetInterval.start = 0;
    if (errorInterval) { clearInterval(errorInterval); }
    var intEnable = (self.interval !== 0);
    if (!intEnable) {
      console.log('Emitowanie danych wyłączone');
      self.interval = 200;
    }
    if (self.interval < 50) {
      console.log('Błędny strada interval -> ustawiono 200ms');
      self.interval = 200;
    }
    console.log('Strada startInterval:', self.interval);
    var temp = new MySetInterval(self, function () {
      // console.log('StradaStartInterval ex');
      self.stradaEnqueue(0x302, 0, function (dane) {
        if (dane.error) {
          // dane = {error: 'Utracono połączenie z PLC: ' + dane.error};
          // console.log('zerwane połączenie ze sterownikiem');
          console.log(dane);
        } else {
          dane = new decode.DecodeStrada302(dane.dane);
          if (!dane) {console.log('DecodeStrada302 null'); return;}
          // strada_req_time = (dane.wDataControl === 1);
          if (dane.wDataControl === 1) {
            // console.log('Sterownik rząda daty 1');
            self.socket.emit('io_emit', ['strada_req_time']);
          }
        }
        common.storeDane(dane);
        if (intEnable) {
          self.socket.emit('dane', dane);
        } 
        // else {console.log('d');}
      });
    });
  };

  
  Strada.prototype.stopInterval = function () {
    var self = this;
    // console.log('Stop interval');
    //gdy brak polaczenia wysyla tresc bledu co 1s
    if (errorInterval) { clearInterval(errorInterval); }
    errorInterval = setInterval(function(){daneErrIntervalFun(self)}, 1000);
  };
  
  return Strada;
};
