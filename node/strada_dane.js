// strada_dane.js
(function () {
  'use strict';
  var stradaIntEnabled = false;
  var common = require("./common.js");

  /**
   * Description
   * @method DecodeStrada302
   * @param {Buffer} data
   * @return ThisExpression
   */
  function DecodeStrada302(data) {
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

  /**
   * Description
   * @method MySetInterval
   * @param {function} fun
   * @param {Number} interval
   */
  function MySetInterval(fun, interval) {
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
    if (stradaIntEnabled) {
      setTimeout(function () {
        this.interval = new MySetInterval(fun, interval);
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
  module.exports.startInterval = function (strada_SendFunction, socket, interval) {
    // console.log("StradaStartInterval");
    MySetInterval.start = 0;
    stradaIntEnabled = true;
    var temp = new MySetInterval(function () {
      // console.log("StradaStartInterval ex");
      strada_SendFunction(0x302, 0, function (dane) {
        if (dane.error) {
          dane = {error: "Brak połączenia z PLC: " + dane.error};
          // console.log("zerwane połączenie ze sterownikiem");
          console.log(dane);
        } else {
          dane = new DecodeStrada302(dane.dane);
          // strada_req_time = (dane.wDataControl === 1);
          if (dane.wDataControl === 1) {
            // console.log('Sterownik rząda daty 1');
            socket.emit('broadcast', 'strada_req_time');
          }
        }
        // dane302_json = JSON.stringify(dane);
        common.storeDane(dane);
        socket.emit('dane', dane);
      });
    }, interval || 200);
  };

  module.exports.stopInterval = function () {
    stradaIntEnabled = false;
  };
}());