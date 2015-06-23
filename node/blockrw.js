//BlockRW.js
"use strict";

/**
 * Konstruktor klasy
 * @method BlockRW
 * @param {} adr
 */
function BlockRW(adr) {
	if (adr) {
		this.adr = adr;
	} else {
		this.adr = 0;
	}
}

/**
 * Description
 * @method read
 * @param {} data
 * @param {} sign
 * @return temp
 */
BlockRW.prototype.read = function (data, sign) {
	var temp = [];
	var temp_Len = data.readUInt16LE(this.adr);
	this.adr += 2;
	if (temp_Len > data.length) {
		console.error("temp_Len " + temp_Len);
		console.error("data.length " + data.length);
	}
	for (var i = 0; i < temp_Len; i = i + 2) {
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
 * @method write
 * @param {} tempBlock
 * @param {} sign
 * @return temp_out_buff
 */
BlockRW.prototype.write = function (tempBlock, sign) {
	var temp_out_buff;
	var tempLen;

	tempLen = tempBlock.length;
	temp_out_buff = new Buffer(tempLen * 2 + 2);
	temp_out_buff.writeUInt16LE(tempLen * 2, 0);		//rozmiar bloku w bajtach !!! (zmiana 09-05-2014 po uzgodnieniu z Wieœkiem)
//		temp_out_buff.writeUInt16LE(tempLen, 0);
	for (var i = 0; i < tempLen; i += 1) {
		if (sign) {
			temp_out_buff.writeInt16LE(tempBlock[i], i * 2 + 2);
		} else {
			temp_out_buff.writeUInt16LE(tempBlock[i], i * 2 + 2);
		}
	}
	return temp_out_buff;
};

module.exports = BlockRW;
