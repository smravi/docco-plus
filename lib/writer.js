'use strict';
var path = require('path');
var fs = require('fs-extra');
var Promise = require('bluebird');
var fsPromise = {
    outputFile: Promise.promisify(fs.outputFile)
};
module.exports = function(oneFile, options, sections) {
    var destination = path.join(options.output, oneFile + '.html');
    console.log('writing...', destination);
    var sectionUlClass;
    if(sections.length !== 1) {
        sectionUlClass = '';
    } else if(!sections[0].docsHtml){
        sectionUlClass = 'codeOnly';

    } else if(!sections[0].codeHtml){
        sectionUlClass = 'docsOnly';

    }
    var html = options.template({
        options: options,
        sections: sections,
        srcPath: oneFile,
        path: path,
        destination: destination,
        sectionUlClass: sectionUlClass
    });
    return fsPromise.outputFile(destination, html);
};