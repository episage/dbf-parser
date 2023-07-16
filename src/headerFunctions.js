var iconv = require('iconv-lite');

function readType(buffer, encoding) {
  var type = iconv.decode(buffer, encoding);
  return type;
}

function readDateUpdated(buffer) {
  var date = parseDate(buffer);
  return date;
}

function readNumberOfRecords(buffer) {
  var numberOfRecords = convertBinaryToInteger(buffer);
  return numberOfRecords;
}

function readStart(buffer) {
  var start = convertBinaryToInteger(buffer);
  return start;
}

function readRecordLength(buffer) {
  var recordLength = convertBinaryToInteger(buffer);
  return recordLength;
}

function readField(buffer, encoding) {
  var field = parseFieldSubRecord(buffer, encoding);
  return field;
}



function parseDate(buffer) {
  var year = 1900 + convertBinaryToInteger(buffer.slice(0, 1));
  var month = (convertBinaryToInteger(buffer.slice(1, 2)));
  var day = convertBinaryToInteger(buffer.slice(2, 3));

  return `${year}-${padNumberWithZeros(month, 2)}-${padNumberWithZeros(day, 2)}`;
}

function parseFieldSubRecord(buffer, encoding) {
  var field = {
    name: iconv.decode(buffer.slice(0, 11), encoding).replace(/[\u0000]+$/, ''),
    type: iconv.decode(buffer.slice(11, 12), encoding),
    displacement: convertBinaryToInteger(buffer.slice(12, 16)),
    length: convertBinaryToInteger(buffer.slice(16, 17)),
    decimalPlaces: convertBinaryToInteger(buffer.slice(17, 18))
  };

  return field;
}

function convertBinaryToInteger(buffer) {
  return buffer.readIntLE(0, buffer.length);
}

function decodeType(byte) {
  // Valid dBASE for Windows table file, bits 0-2 indicate version number: 3 for dBASE Level 5, 4 for dBASE Level 7.
  // Bit 3 and bit 7 indicate presence of a dBASE IV or dBASE for Windows memo file; bits 4-6 indicate the presence of a dBASE IV SQL table; bit 7 indicates the presence of any .DBT memo file (either a dBASE III PLUS type or a dBASE IV or dBASE for Windows memo file).

  var isDbaseLevel5 = (byte & 0b00000011) >> 0 === 3;
  var isDbaseLevel7 = (byte & 0b00000011) >> 0 === 4;
  var isBaseIV = (byte & 0b00000100) >> 3 === 1;
  var isDbtMemoFilePresent = (byte & 0b01000000) >> 7 === 1;
  var isDBaseIVSqlTable = (byte & 0b00111000) >> 4 > 0;

  return {
    isDbaseLevel5,
    isDbaseLevel7,
    isBaseIV,
    isDbtMemoFilePresent,
    isDBaseIVSqlTable,
  }

}

module.exports = {
  readType,
  readDateUpdated,
  readNumberOfRecords,
  readStart,
  readRecordLength,
  readField,

  decodeType,
}

function padNumberWithZeros(number, length) {
  let str = number.toString();
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}
