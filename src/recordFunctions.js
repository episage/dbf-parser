var iconv = require('iconv-lite');

function readRecord(sequenceNumber, buffer, fields, encoding) {
  const record = {
    '@sequenceNumber': sequenceNumber,
    '@deleted': isRecordDeleted(buffer[0]),
  };

  let loc = 1;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    record[field.name] = readField(field, buffer.slice(loc, loc + field.length), encoding);
    loc += field.length;
  }

  return record;
}

function isRecordDeleted(byte) {
  if (byte === 0x20) {
    return false;
  }
  if (byte === 0x2A) {
    return true;
  }

  throw new Error('dont know if deleted');
}

function readField(field, buffer, encoding) {
  let value = (iconv.decode(buffer, encoding)).trim();

  if (field.type === 'C') { // Character
    value = value;
  } else if (field.type === 'F') { // Floating Point
    value = (value === +value) && (value === (value | 0)) ? parseInt(value, 10) : parseFloat(value, 10);
  } else if (field.type == 'L') { // Logical
    if (['Y', 'y', 'T', 't'].includes(value)) {
      value = true;
    } else if (['N', 'n', 'F', 'f'].includes(value)) {
      value = false;
    } else {
      value = null;
    }
  } else if (field.type === 'M') { // Memo
    value = value;
  } else if (field.type === 'N') { // Numeric
    value = value === +value && value === (value | 0) ? parseInt(value) : parseFloat(value, 10);
  }

  return value;
}

module.exports = {
  readRecord,
}