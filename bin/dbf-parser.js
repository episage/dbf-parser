#!/usr/bin/env node
var os = require('os');

var program = require('commander');
var pkg = require('../package.json');
var Parser = require('../src/Parser');

program
  .version(pkg.version)
  .usage('[options]')
  .option('-d, --delimiter <delimiter>', 'Field delimiter', ',')
  .option('-q, --quote <quote>', 'Field value wrapper quote', '"')
  .option('-e, --encoding <encoding>', 'Source string encoding', 'utf8')
  .parse(process.argv);

var options = program.opts();
var p = Parser(process.stdin, options.encoding);
var header = null;
p.on('header', h => {
  header = h;
  process.stdout.write(
    h.fields.map(f => f.name).map(n => `${options.quote}${n}${options.quote}`).join(options.delimiter),
    'utf8'
  );
  process.stdout.write(os.EOL);
});
p.on('record', r => {
  process.stdout.write(
    header.fields.map(f => r[f.name]).map(v => `${options.quote}${v}${options.quote}`).join(options.delimiter),
    'utf8'
  );
  process.stdout.write(os.EOL);
})