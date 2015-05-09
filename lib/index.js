'use strict';
var commander = require('commander');
var pkg = require('../package.json');
var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');
var document = function (options, callback) {
  // hardcode the template to the one we are using.
  options.template = require.resolve('./resources/docco-template.jst');
  options.layout = (options.layout || 'parallel');
  options.output = (options.output || 'docs');
  // ### copy and rename source files for use and put it in temp dir
  var files = [];
  options.args.forEach(function (glob1) {
    files = files.concat(glob.sync(glob1));
  });
  var tempDir = require('os').tmpdir();
  // ### get the list of files to document in options
  options.args = files.map(function (file) {
    if (fs.statSync(file).isFile()) {
      // get rid of the un-necessary ./ if it is there
      var fileName = file.replace(/[\\\/]+/g, '!').replace(/^\.\!/, '') + path.extname(file);
      // re-add the extension so that same names with different extensions can be handled
      var destPath = path.join(tempDir, fileName);
      fs.copySync(file, destPath);
      return destPath;
    }
  });
  if (!options.args.length) {
    return console.log('no files to document!!! will not do anything.');
  }
  // ### run docco
  require('docco').document(options, callback);
  // ### copy resource files
  //
  // - copy template css file
  fs.copySync(
    require.resolve('./resources/docco-template.css'),
    path.join(options.output, 'docco-template.css')
  );
  // - copy jquery js file
  fs.copySync(
    require.resolve('jquery/dist/jquery.min.js'),
    path.join(options.output, 'jquery.min.js')
  );
  // - copy jstree distribution
  fs.copySync(
    path.dirname(require.resolve('jstree')),
    path.join(options.output, 'jstree')
  );
  // - copy tree builder js
  fs.copySync(
    require.resolve('./resources/tree-builder.js'),
    path.join(options.output, 'tree-builder.js')
  );
};

var run = function () {
  commander.
    version(pkg.version).
    usage('[options] glob-patterns').
    option('-L, --languages [file]', 'use a custom languages.json', function (path) {
      return JSON.parse(fs.readFileSync(path));
    }).
    //  option('-l, --layout [name]', 'choose a layout (parallel, linear or classic)', c.layout).
    option('-o, --output [path]', 'output to a given folder').
    option('-e, --extension [ext]', 'assume a file extension for all inputs').
    option('-c, --css [file]', 'use a custom css file').
    option('-m, --marked [file]', 'use custom marked options').
    parse(process.argv);
  if (commander.args.length) {
    document(commander);
  } else {
    return console.log(commander.helpInformation());
  }
};

module.exports = {
  document: document,
  run: run
};
