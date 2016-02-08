'use strict';
var path = require('path');
var fs = require('fs-extra');
var Promise = require('bluebird');
var fsPromise = {
    outputFile: Promise.promisify(fs.outputFile)
};
module.exports = function(oneFile, options, sections) {
    var destination = path.join(options.output, oneFile + '.html');
    var html = options.template({
        options: options,
        sections: sections,
        srcPath: oneFile,
        destination: destination
    });
    console.log(html);
    return fsPromise.outputFile(destination, html);
};