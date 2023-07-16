var fs = require('fs');
var path = require('path');

var { expect } = require('chai');
var Parser = require('../src/Parser');

describe('Parser', function () {
  it('can parse header', function (done) {
    var filePath = path.resolve('test', 'fixtures', 'bayarea_zipcodes.dbf');
    var stream = fs.createReadStream(filePath);

    var hp = Parser(stream);
    hp.on('error', e => {
      return done(e);
    });
    hp.on('header', header => {
      expect(header).to.be.deep.equal(
        {
          "type": "\u0003",
          "dateUpdated": "2009-06-16",
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