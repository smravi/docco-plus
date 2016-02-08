'use strict';
var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var parser = require('./parser');
var formatter = require('./formatter');
var writer = require('./writer');
var normalizer = require('./normalizer');
var fsPromise = {
    ensureDir: Promise.promisify(fs.ensureDir),
    stat: Promise.promisify(fs.stat),
    copy: Promise.promisify(fs.copy),
    readFile: Promise.promisify(fs.readFile)
};

// ### copy resource files
var copyAssets = function(options) {
    var promises = [];
    options.resources = {
        css: [],
        js: []
    };

    // create the resources directory
    return fsPromise.ensureDir(path.join(options.output, 'resources')).then(function() {
        var destPath;
        // - copy template css file
        destPath = path.resolve(options.output, 'resources/docco-template.css');
        promises.push(fsPromise.copy(
            require.resolve('./resources/docco-template.css'),
            destPath
        ));
        options.resources.css.push(destPath);

        // - copy jquery js file
        destPath = path.resolve(options.output, 'resources/jquery.min.js');
        promises.push(fsPromise.copy(
            require.resolve('jquery/dist/jquery.min.js'),
            destPath
        ));
        options.resources.js.push(destPath);

        // - copy jstree distribution
        destPath = path.resolve(options.output, 'resources/jstree');
        promises.push(fsPromise.copy(
            path.dirname(require.resolve('jstree')),
            destPath
        ));
        options.resources.js.push(path.resolve(destPath, 'jstree.min.js'));
        options.resources.css.push(path.resolve(destPath, 'themes/default-dark/style.min.css'));

        // - copy highlightjs style
        destPath = path.resolve(options.output, 'resources', options.highlightStyle + '.css');
        promises.push(fsPromise.copy(
            require.resolve('highlight.js/styles/' + options.highlightStyle + '.css'),
            destPath
        ));
        options.resources.css.push(destPath);

        // - copy markdown style
        destPath = path.resolve(options.output, 'resources/markdown-themes/' + options.theme + '.css');
        promises.push(fsPromise.copy(
            require.resolve('./resources/markdown-themes/' + options.theme + '.css'),
            destPath
        ));
        options.resources.css.push(destPath);

        // -copy config.css
        if (options.css) {
            destPath = path.resolve(options.output, 'resoures', 'custom.css');
            promises.push(fsPromise.copy(
                options.css,
                destPath
            ));
            options.resources.css.push(destPath);
        }
        return Promise.all(promises).spread(function() {
            return options;
        });
    });
};

// ### document the source files
var document = function(options) {
    return Promise.all(
        options.files.map(function(oneFile) {
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
        // copy assets
        copyAssets
    ).then(
        // generate the documentation
        document
    ).then(
        // call the callback with success
        callback.bind({}, null)
    ).catch(
        // in case of exception call the callback with failure
        callback.bind({})
    );
};