#!/usr/bin/env node
var os = require('os');

var program = require('commander');
var pkg = require('../package.json');
var Parser = require('../src/parser');

program
  .version(pkg.version)
  .usage('[options]')
  .option('-f, --format <format>', 'Output format', /^(csv)$/i, 'csv')
  .option('-d, --delimiter <delimiter>', 'Field delimiter', ',')
  .option('-q, --quote <quote>', 'Field value wrapper quote', '"')
  .option('-e, --encoding <encoding>', 'Source string encoding', 'utf8')
  .parse(process.argv);

var p = Parser(process.stdin, program.encoding);
var header = null;
p.on('header', h => {
  header = h;
  process.stdout.write(
    h.fields.map(f => f.name).map(n => `${program.quote}${n}${program.quote}`).join(program.delimiter),
    'utf8'
  );
  process.stdout.write(os.EOL);
});
p.on('record', r => {
  process.stdout.write(
    header.fields.map(f => r[f.name]).map(v => `${program.quote}${v}${program.quote}`).join(program.delimiter),
    'utf8'
  );
  process.stdout.write(os.EOL);
})