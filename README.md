DBF Parser
==========

This is an event-based dBase file parser for very efficiently reading data from `*.dbf` files.

 - ES5
 - uses `iconv-lite` to support multiple encodings
 - uses Node streams
 - accepts `stdin`
 - can be used as standalone app to convert `.dbf` to `.csv`

To get started, simply install the module using npm:

```bash
$ npm install @episage/dbf-parser
```

and then `require` it:

```js
var DbfParser = require('dbf-parser');
```

## Parser

This is the main interface for reading data from dBase files.

### new Parser(readableStream, encoding)

* stream `readableStream` - stream from `process.stdin` or `fs.createReadStream` or other
* string `encoding` - the character encoding to use (default = `utf-8`, uses `iconv-lite` under the hood)

Creates a new Parser and attaches it to the specified filename.

    var fs = require('fs');
    var DbfParser = require('dbf-parser');
    var parser = new DbfParser(fs.createReadStream('/path/to/my/dbase/file.dbf'));

### parser.on(event, listener)

* event `String` - The event name to listen for (see below for details)
* listener `Function` - The callback to bind to the event

### Event: 'header'

* header `Header` The header object as parsed from the dBase file

This event is emitted once the header has been parsed from the dBase file

### Event: 'record'

* record `Object` An object representing the record that has been found

The record object will have a key for each field within the record, named after the field. It is trimmed (leading and trailing) of any blank characters (dBase files use \x20 for padding).

In addition to the fields, the object contains two special keys:

* @sequenceNumber `Number` indicates the order in which it was extracted
* @deleted `Boolean` whether this record has been deleted or not

This object may look like:
```json
{
    "@sequenceNumber": 123,
    "@deleted": false,
    "firstName": "John",
    "lastName": "Smith"
}
```

## Usage

The following code example illustrates a very simple usage for this module:

```js
var fs = require('fs');
var DbfParser = require('dbf-parser');
var parser = new DbfParser(fs.createReadStream('/path/to/my/dbase/file.dbf'));

parser.on('header', (h) => {
    console.log('dBase file header has been parsed');
    console.log(h);
});

parser.on('record', (record) => {
    console.log('Name: ' + record.firstName + ' ' + record.lastName); // Name: John Smith
});
```

# Command-Line Interface (CLI)

The parser also supports a command-line interface (CLI) for converting DBF files to CSV. You can invoke it as follows:

```bash
$ dbf-parser < /path/to/file.dbf
```

This will write the converted rows to `stdout`.

```bash
$ dbf-parser < /path/to/file.dbf > file.csv
```

For more help information on using the command line options, use the integrated help:

```bash
$ dbf-parser --help
```

# Tests

Tests are written in Mocha using Chai BDD for the expectations. Data on San Francisco zip codes was used as a reference test file - downloaded from [SF OpenData](https://data.sfgov.org/) and included in the `./test/fixtures/bayarea_zipcodes.dbf` file within the repository.

# Credits

Some of the texts and inspiration for the rewrite were taken from https://github.com/abstractvector/node-dbf
