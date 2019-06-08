var fs = require('fs');
var path = require('path');

var { expect } = require('chai');
var HeaderParser = require('../src/HeaderParser');

describe('HeaderParser', function () {
  it('parses', function (done) {
    var filePath = path.resolve('test', 'fixtures', 'bayarea_zipcodes.dbf');
    var stream = fs.createReadStream(filePath);

    var hp = HeaderParser(stream);
    hp.on('error', e => {
      return done(e);
    });
    hp.parse(header => {
      expect(header).to.be.deep.equal(
        {
          "type": "\u0003",
          "dateUpdated": new Date("2009-06-15T22:00:00.000Z"),
          "numberOfRecords": 187,
          "start": 193,
          "recordLength": 74,
          "fields": [
            {
              "name": "ZIP",
              "type": "C",
              "displacement": 0,
              "length": 5,
              "decimalPlaces": 0
            },
            {
              "name": "PO_NAME",
              "type": "C",
              "displacement": 0,
              "length": 28,
              "decimalPlaces": 0
            },
            {
              "name": "STATE",
              "type": "C",
              "displacement": 0,
              "length": 2,
              "decimalPlaces": 0
            },
            {
              "name": "Area__",
              "type": "F",
              "displacement": 0,
              "length": 19,
              "decimalPlaces": 11
            },
            {
              "name": "Length__",
              "type": "F",
              "displacement": 0,
              "length": 19,
              "decimalPlaces": 11
            }
          ]
        }
      );
      return done();
    })
  })
});