/**
 *  @file blockrw.js
 *  @brief Odczyt i zapis do bloków danych Strada
 */
'use strict';

/**
 * @class Odczyt i zapis do buforów w formacie Strada
 * @constructor
 * @param {Number=} adr Adres początkowy bloku
 */
function BlockRW(adr) {
  if (adr) {
    this.adr = adr;
  } else {
    this.adr = 0;
  }
}

/**
 * @memberof! BlockRW#
 * @param {Buffer} tempBlock Bufor z danymi
 * @param {Boolean} sign Zmienna ze znakiem (UInt)
 * @return temp
 */
BlockRW.prototype.read = function (data, sign) {
  var temp = [];
  if (data.length < this.adr + 2) {
    console.error("can't read data.length ", data.length, this.adr);
    return temp;
  }
  var temp_Len = data.readUInt16LE(this.adr);
  if (temp_Len > data.length) {
    console.error("temp_Len:", temp_Len, "data.length:", data.length, "this.adr:", this.adr);
    return temp;
  }
  this.adr += 2;
  var i;
  for (i = 0; i < temp_Len; i = i + 2) {
    if (sign) {
      temp.push(data.readInt16LE(i + this.adr));
    } else {
      temp.push(data.readUInt16LE(i + this.adr));
    }
  }
  this.adr += temp_Len;
  return temp;
};

/**
 * Description
 * @method write Zapis
 * @memberof! BlockRW#
 * @param {Buffer} tempBlock Bufor z danymi
 * @param {Boolean} sign Zmienna ze znakiem (UInt)
 * @return tempOutBuff
 */
BlockRW.prototype.write = function (tempBlock, sign) {
  var tempOutBuff;
  var tempLen;

  tempLen = tempBlock.length;
  tempOutBuff = new Buffer(tempLen * 2 + 2);
  //rozmiar bloku w bajtach 
  // !!! (zmiana 09-05-2014 po uzgodnieniu z Wieśkiem)
  //tempOutBuff.writeUInt16LE(tempLen, 0);
  tempOutBuff.writeUInt16LE(tempLen * 2, 0);
  var i;
  for (i = 0; i < tempLen; i += 1) {
    if (sign) {
      tempOutBuff.writeInt16LE(tempBlock[i], i * 2 + 2);
    } else {
      tempOutBuff.writeUInt16LE(tempBlock[i], i * 2 + 2);
    }
  }
  return tempOutBuff;
};

module.exports = BlockRW;
