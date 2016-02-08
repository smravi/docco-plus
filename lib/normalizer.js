'use strict';
var Promise = require('bluebird');
var glob = require('glob');
var fs = require('fs-extra');
var _ = require('underscore');
var fsPromise = {
    readFile: Promise.promisify(fs.readFile)
};

module.exports = function(options) {

    // set the template
    options.template = (options.template || require.resolve('./resources/docco-template.jst'));
    fsPromise.readFile(options.template, 'utf8');
    options.template = _.template(fs.readFileSync(options.template).toString());

    // default the output dir
    options.output = (options.output || 'docs');

    // defaulting languages
    options.languages = options.languages ? fs.readJsonSync(options.languages) : require('./resources/languages.json');

    Object.keys(options.languages).forEach(function(lang) {
        if (options.languages[lang].inlineComment) {
            options.languages[lang].inlineCommentMatcher = new RegExp('^\\s*' + options.languages[lang].inlineComment);
        } else {
            options.languages[lang].inlineCommentMatcher = new RegExp('^');
        }
    });

    // defaulting the marked options
    options.marked = options.marked || {
            smartypants: true
        };

    // expand the list of files to document
    return Promise.all(options.args.map(function(glob1) {
        return Promise.promisify(glob)(glob1);
    })).spread(function() {
        options.files = Array.prototype.concat.apply([], Array.prototype.slice.call(arguments));
        if (!options.files.length) {
            throw new Error('no files to document!!! will not do anything.');
        }
        return options;
    });
};
