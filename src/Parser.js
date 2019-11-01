var EventEmitter = require('events');
var headerFunctions = require('./headerFunctions');
var recordFunctions = require('./recordFunctions');

var STATE = {
    READING_HEADER_TYPE: Symbol(),
    READING_HEADER_DATE_UPDATED: Symbol(),
    READING_HEADER_NUMBER_OF_RECORDS: Symbol(),
    READING_HEADER_START: Symbol(),
    READING_HEADER_RECORD_LENGTH: Symbol(),
    READING_HEADER_UNUSED: Symbol(),
    READING_HEADER_FIELD: Symbol(),
    READING_HEADER_FIELD_DESCRIPTOR_ARRAY_TERMINATOR: Symbol(),
    READING_RECORD: Symbol(),
}

function Parser(readableStream, encoding = 'utf8') {
    var ee = new EventEmitter();
    var state = STATE.READING_HEADER_TYPE;
    var header = {
        type: null,
        dateUpdated: null,
        numberOfRecords: null,
        start: null,
        recordLength: null,
        fields: [],
    }
    var headerFieldsParsingState = {
        count: null,
        index: 0,
    }
    var sequenceNumber = 0;

    readableStream.on('readable', function () {
        let data;
        do {
            switch (state) {
                case STATE.READING_HEADER_TYPE:
                    if (data = readableStream.read(1)) {
                        header.type = headerFunctions.readType(data, encoding);
                        state = STATE.READING_HEADER_DATE_UPDATED;
                    }
                    break;
                case STATE.READING_HEADER_DATE_UPDATED:
                    if (data = readableStream.read(3)) {
                        header.dateUpdated = headerFunctions.readDateUpdated(data);
                        state = STATE.READING_HEADER_NUMBER_OF_RECORDS;
                    }
                    break;
                case STATE.READING_HEADER_NUMBER_OF_RECORDS:
                    if (data = readableStream.read(4)) {
                        header.numberOfRecords = headerFunctions.readNumberOfRecords(data);
                        state = STATE.READING_HEADER_START;
                    }
                    break;
                case STATE.READING_HEADER_START:
                    if (data = readableStream.read(2)) {
                        header.start = headerFunctions.readStart(data);
                        headerFieldsParsingState.count = (header.start - 1) / 32 - 1;
                        state = STATE.READING_HEADER_RECORD_LENGTH;
                    }
                    break;
                case STATE.READING_HEADER_RECORD_LENGTH:
                    if (data = readableStream.read(2)) {
                        header.recordLength = headerFunctions.readRecordLength(data);
                        state = STATE.READING_HEADER_UNUSED;
                    }
                    break;
                case STATE.READING_HEADER_UNUSED:
                    if (data = readableStream.read(32 - 2 - 2 - 4 - 3 - 1)) {
                        state = STATE.READING_HEADER_FIELD;
                    }
                    break;
                case STATE.READING_HEADER_FIELD:
                    if (data = readableStream.read(32)) {
                        var field = headerFunctions.readField(data, encoding);
                        header.fields.push(field);
                        headerFieldsParsingState.index++;
                        if (headerFieldsParsingState.index >= headerFieldsParsingState.count) {
                            state = STATE.READING_HEADER_FIELD_DESCRIPTOR_ARRAY_TERMINATOR;
                        }
                    }
                    break;
                case STATE.READING_HEADER_FIELD_DESCRIPTOR_ARRAY_TERMINATOR:
                    if (data = readableStream.read(1)) {
                        state = STATE.READING_RECORD;
                        ee.emit('header', header);
                    }
                    break;
                case STATE.READING_RECORD:
                    if (data = readableStream.read(header.recordLength)) {
                        if (data.length === 1 && data[0] === 0x1A) {
                            // end of file
                            break;
                        }

                        var record = recordFunctions.readRecord(sequenceNumber, data, header.fields, encoding);
                        ee.emit('record', record);
                        sequenceNumber++;
                    }
                    break;
            }
        } while (data);
    });

    readableStream.on('end', function () {
        ee.emit('end');
    })

    return {
        state,
        header,
        headerFieldsParsingState,
        on: ee.on.bind(ee),
        off: ee.off.bind(ee),
    }
}

module.exports = Parser;