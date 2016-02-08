'use strict';
var marked = require('marked');
var path = require('path');
var highlightjs = require('highlight.js');
module.exports = function(filePath, options, sections) {
    var markedOptions = options.marked;
    var language = options.languages[path.extname(filePath)] || {
            name: path.extname(filePath).replace(/^\./, '')
        };
    marked.setOptions(markedOptions);
    marked.setOptions({
        highlight: function(code, lang) {
            lang = (lang || language.name);
            if (highlightjs.getLanguage(lang)) {
                return highlightjs.highlight(lang, code).value;
            } else {
                console.warn('docco: couldn\'t highlight code block with unknown language "' + lang + '" in ' + code);
                return code;
            }
        }
    });
    var results = [];
    for (var i = 0, len = sections.length; i < len; i = i + 1) {
        var section = sections[i];
        if (section.codeText.trim()) {
            section.codeHtml = '<div class="highlight"><pre>' +
                highlightjs.highlight(
                    language.name,
                    section.codeText
                ).value.replace(
                    /\s+$/,
                    ''
                ) +
                '</pre></div>';
        }
        if (section.docsText.trim()) {
            section.docsHtml = marked(section.docsText);
        }
        results.push(section);
    }
    return results;
};
