var commander = require('commander');
var pkg = require('../../package.json');
var defaults = {
  layout: 'parallel',
  output: 'docs',
  template: null,
  css: null,
  extension: null,
  languages: {},
  marked: null
};
module.exports = {
  run: function () {
    var c = defaults;

    commander.
      version(pkg.version).
      usage('[options] files').
      option('-L, --languages [file]', 'use a custom languages.json', function (path) {
        return JSON.parse(fs.readFileSync(path));
      }).
      //  option('-l, --layout [name]', 'choose a layout (parallel, linear or classic)', c.layout).
      option('-o, --output [path]', 'output to a given folder', c.output).
      option('-c, --css [file]', 'use a custom css file', c.css).
      option('-e, --extension [ext]', 'assume a file extension for all inputs', c.extension).
      option('-m, --marked [file]', 'use custom marked options', c.marked);

    console.log(commander);
    // run docco
    require('docco').document(commander);
  }
};
