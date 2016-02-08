'use strict';
var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var parser = require('./parser');
var formatter = require('./formatter');
var writer = require('./writer');
var normalizer = require('./normalizer');
var fsPromise = {
    stat: Promise.promisify(fs.stat),
    copy: Promise.promisify(fs.copy),
    readFile: Promise.promisify(fs.readFile)
};

// ### copy resource files
var copyAssets = function(options) {
    var promises = [];
    // - copy template css file
    promises.push(fsPromise.copy(
        require.resolve('./resources/docco-template.css'),
        path.join(options.output, 'docco-template.css')
    ));
    // - copy jquery js file
    promises.push(fsPromise.copy(
        require.resolve('jquery/dist/jquery.min.js'),
        path.join(options.output, 'jquery.min.js')
    ));
    // - copy jstree distribution
    promises.push(fsPromise.copy(
        path.dirname(require.resolve('jstree')),
        path.join(options.output, 'jstree')
    ));
    // - copy tree builder js
    promises.push(fsPromise.copy(
        require.resolve('./resources/tree-builder.js'),
        path.join(options.output, 'tree-builder.js')
    ));
    // -copy config.css
    if (options.css) {
        promises.push(fsPromise.copy(
            options.css,
            path.join(options.output, 'custom.css')
        ));
    }
    return Promise.all(promises).spread();

};

// ### document the source files
var document = function(options) {
    return Promise.all(
        options.files.map(function(oneFile) {
            var extension = path.extname(oneFile);
            if (!options.languages[extension]) {
                console.warn('not supported: ', oneFile);
                return Promise.resolve(true);
            }

            return fsPromise.readFile(oneFile, 'utf8').then(
                parser.bind(null, oneFile, options)
            ).then(
                formatter.bind(null, oneFile, options)
            ).then(
                writer.bind(null, oneFile, options)
            );
        })
    ).spread(function() {
        return options;
    });
};

module.exports = function(options, callback) {
    callback = callback || function() {
            return;
        };
    // normalize the options options
    return normalizer(options).then(
        // generate the documentation
        document
    ).then(
        // copy assets
        copyAssets
    ).then(
        // call the callback with success
        callback.bind({}, null)
    ).catch(
        // in case of exception call the callback with failure
        callback.bind({})
    );
};