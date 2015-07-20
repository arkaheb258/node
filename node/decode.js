/**
*  @file decode.js
*  @brief Funkcje dekodujące rozkazy Strada
*/
'use strict';
var common = require('./common.js');

/**
 * Description
 * @method encodeStrada202
 * @param {Object} data
 * @return outBuff
 */
function encodeStrada202(data) {
  var BlockRW = require('./blockrw.js');
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
function decodeStrada308(dane) {
  var out = [];
  var gpar = common.getGpar();
  var i = 0;
  if (!dane) {return null; }
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
    var off = common.summerTimeOffset(temp.czas);
    // var d = new Date(temp.czas);
    // var n = d.getTimezoneOffset();
    // d.setMonth(0);
    // n -= d.getTimezoneOffset();
    if (gpar) {
      if (gpar.rKonfCzasStrefa !== undefined) {
        temp.czas += (gpar.rKonfCzasStrefa - 12) * 3600000;
      }
      if (gpar.rKonfCzasLetni) {
        // temp.czas -= n * 60000;
        temp.czas -= off * 60000;
      }
    }
    out.push(temp);
  }
  return out;
}

/**
 * Description
 * @method wyluskajParametry
 * @param {} data
 * @return out
 */
function wyluskajParametry(js) {
  // console.log('wyluskajParametry');
  if (!js) { return null; }
  var out = [];
  if (js.DANE) {
    out = js;
    var i;
    for (i in js.DANE) {
      if (js.DANE.hasOwnProperty(i)) {
        var temp = js.DANE[i];
        switch (temp.NAZ) {
          // case 'sKonfTypKombajnu':
          // case 'sKonfNrKomisji':
          // case 'sKonfNazwaKopalni':
          // case 'sKonfNrSciany':
          // case 'sKonfWersjaProgramu':
          case 'rKonfWersjaJezykowa':
          case 'rKonfWersjaWyposazeniaElektr':
          case 'rKonfCzasLetni':
          case 'rKonfCzasStrefa':
          case 'rZapisTyp':
            out[temp.NAZ] = temp.WART;
            // console.log(temp.NAZ, temp.WART);
            break;
          case 'tZapisCzasZrzutu':
            out[temp.NAZ] = common.codesysTimeToMs(temp.WART.toString());
            break;
          default:
            break;
        }
      }
    }
  }
  return out;
}

/**
 * Description
 * @method decodeStrada307
 * @param {Buffer} buf dane ze strady
 * @param {Object} outPar
 * @return outPar
 */
function decodeStrada307(buf, outPar) {
  // console.log('decodeStrada307');
  var len, ptr = 0, temp, tempStr;
  if (typeof outPar === 'string') { outPar = JSON.parse(outPar); }
  if (outPar && outPar.DANE) {
    len = outPar.DANE.length;
  } else {
    return null;
  }
  var i;
  //jeżeli zmiana komisji, typu, itd. to przerwać i zwrócić null
  for (i = 0; i < 5; i += 1) {
    tempStr = outPar.DANE[i];
    // console.log(tempStr);
    if (typeof buf === 'object' && buf.error !== undefined) {
      console.log('Błąd decodeStrada307 ' + i);
      console.log(buf);
      return null;
    }
    temp = common.readStringTo0(buf, i * 32, 32);
    // console.log(temp);
    if (temp !== tempStr.WART) {
      console.log('![', i, '] ', tempStr.NAZ, ' zmiana z ', tempStr.WART, ' na ', temp);
      return null;
    }
  }

  //jeżeli błąd w rozmiarze czasu lub różna długość parametrów to przerwać i zwrócić null
  ptr = 5 * 32;
  for (i = 5; i < len; i += 1) {
    tempStr = outPar.DANE[i];
    if (buf.length < ptr + tempStr.ROZM * 2) {
      console.log('błąd ilości parametrów (za mało) ' + i);
      return null;
    }
//    console.log(tempStr);
    if (tempStr.NAZ[0] === 's') {
      temp = common.readStringTo0(buf, ptr, tempStr.ROZM * 2);
    } else if (tempStr.NAZ[0] === 't') {
      if (tempStr.ROZM !== 2) {
        tempStr.ROZM = 2;
        console.log('[', i, '] ', tempStr.NAZ, ' - błąd rozmiaru TIME');
      }
      temp = buf.readInt32LE(ptr) / 1000;
    } else {
      if (tempStr.ROZM === 1) {
        temp = buf.readInt16LE(ptr);
      } else {
        temp = buf.readInt32LE(ptr);
      }
      if (tempStr.PREC) { temp /= Math.pow(10, tempStr.PREC); }
    }
    if (tempStr.NAZ[0] === 't' && (typeof tempStr.WART === 'string') && tempStr.WART[0] === 'T') {
      // console.log('[', i, '] ', tempStr.NAZ, ' porownanie ', tempStr.WART, ' z ', temp);
      tempStr.WART = common.codesysTimeToMs(tempStr.WART);
      outPar.DANE[i].WART = temp;
    }
    if (temp !== tempStr.WART) {
      console.log('[', i, '] ', tempStr.NAZ, ' zmiana z ', tempStr.WART, ' na ', temp);
      outPar.DANE[i].WART = temp;
    }
    ptr += parseFloat(tempStr.ROZM) * 2;
  }
  if (ptr !== buf.length) {
    console.log('błąd ilości parametrów ', ptr, ' != ', buf.length);
    return null;
  }

  outPar.sKonfTypKombajnu = common.readStringTo0(buf, 0, 32);
  outPar.sKonfNrKomisji = common.readStringTo0(buf, 32, 32);
  outPar.sKonfNazwaKopalni = common.readStringTo0(buf, 64, 32);
  outPar.sKonfNrSciany = common.readStringTo0(buf, 96, 32);
  outPar.sKonfWersjaProgramu = common.readStringTo0(buf, 128, 32);
  return wyluskajParametry(outPar);
}

/**
 * Description
 * @method DecodeStrada302
 * @param {Buffer} data
 * @return ThisExpression
 */
function DecodeStrada302(data) {
  // console.log('DecodeStrada302', typeof data);
  // console.log(data);
  if (typeof data === 'string') {
    console.log('DecodeStrada302', data);
    return null;
  }
  if (!data || data.length < 20) { console.log('DecodeStrada302 error'); return 'ERROR'; }
  var BlockRW = require('./blockrw.js');
  var br = new BlockRW();
  var TimeStamp = br.read(data);
  this.TimeStamp_s = (TimeStamp[1] << 16) + TimeStamp[0];
  this.TimeStamp_ms = (TimeStamp[3] << 16) + TimeStamp[2];
  this.TimeStamp_js = (this.TimeStamp_s * 1000 + this.TimeStamp_ms % 1000);

  //konwersja UTC -> czas lokalny
  var off = common.summerTimeOffset(this.TimeStamp_js);
  // var d = new Date(this.TimeStamp_js);
  // var n = d.getTimezoneOffset();
  // d.setMonth(0);
  // n -= d.getTimezoneOffset();
  var gpar = common.getGpar();
  if (gpar) {
    if (gpar.rKonfCzasStrefa !== undefined) {
      this.TimeStamp_js += (gpar.rKonfCzasStrefa - 12) * 3600000;
    }
    // if (gpar.rKonfCzasLetni) { this.TimeStamp_js -= n * 60000; }
    if (gpar.rKonfCzasLetni) { this.TimeStamp_js -= off * 60000; }
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

module.exports.decodeStrada307 = decodeStrada307;
module.exports.decodeStrada308 = decodeStrada308;
module.exports.encodeStrada202 = encodeStrada202;
module.exports.DecodeStrada302 = DecodeStrada302;
