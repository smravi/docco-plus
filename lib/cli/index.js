var commander = require('commander');
var pkg = require('../../package.json');
var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');
module.exports = {
  run: function () {
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
    // hardcode the template to the one we are using.
    commander.template = require.resolve('../resources/docco-template.jst');
    commander.layout = (commander.layout || 'parallel');
    commander.output = (commander.output || 'docs');
    if (commander.args.length) {
      // ### copy and rename source files for use and put it in temp dir
      var files = [];
      commander.args.forEach(function (glob1) {
        files = files.concat(glob.sync(glob1));
      });
      var tempDir = require('os').tmpdir();
      // ### get the list of files to document in commander
      commander.args = files.map(function (file) {
        if (fs.statSync(file).isFile()) {
          // get rid of the un-necessary ./if it is there
          var destPath = path.join(tempDir, file.replace(/[\\\/]+/g, '!').replace(/^\.\!/, ''));
          fs.copySync(file, destPath);
          return destPath;
        }
      });
      if (!commander.args.length) {
        return console.log('no files to document!!! will not do anything.')
      }
      ;
      // ### run docco
      require('docco').document(commander);
      // ### copy resource files
      //
      // - copy template css file
      fs.copySync(
        require.resolve('../resources/docco-template.css'),
        path.join(commander.output, 'docco-template.css')
      );
      // - copy jquery js file
      fs.copySync(
        require.resolve('jquery/dist/jquery.min.js'),
        path.join(commander.output, 'jquery.min.js')
      );
      // - copy jqtree js file
      fs.copySync(
        require.resolve('jqtree/tree.jquery.js'),
        path.join(commander.output, 'tree.jquery.js')
      );
      // - copy jqtree css file
      fs.copySync(
        require.resolve('jqtree/jqtree.css'),
        path.join(commander.output, 'jqtree.css')
      );
      // - copy tree builder js
      fs.copySync(
        require.resolve('../resources/tree-builder.js'),
        path.join(commander.output, 'tree-builder.js')
      );
    } else {
      return console.log(commander.helpInformation());
    }
  }
};
