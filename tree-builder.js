/* jshint browser: true */
/* globals $, links, hrefs*/
$(function() {
    'use strict';
    var treeData = {
        children: []
    };
    var thisNode, parentNode;
    var $tree = $('#jump_page');
    var makeTree = function(item, index, array) {
        if (index !== array.length - 1) {
            var thisNode = parentNode.children.filter(function(node) {
                return node.text === item;
            })[0];
            if (!thisNode) {
                parentNode.children.push((thisNode = {
                    text: item,
                    id: array.slice(0, index + 1).join('!'),
                    children: []
                }));
            }
            parentNode = thisNode;
        } else {
            parentNode.children.push({
                text: item,
                icon: 'jstree-file',
                id: hrefs[i]
            });
        }
    };
    for (var i = 0, l = links.length; i < l; i = i + 1) {
        parentNode = thisNode = treeData;
        links[i].split('/').forEach(makeTree);
    }

    $tree.empty().jstree({
        core: {
            data: treeData.children,
            themes: {
                name: 'default-dark'
            }
        }
    });
    // bind events to open page
    $tree.on('changed.jstree', function(e, data) {
        if (data.node.icon === 'jstree-file') {
            window.location.href = data.node.id;
        } else {
            $tree.jstree('open_node', data.node, true);
        }
    });
    // open the selected node parent
    var leafNode = window.location.href.split('/').pop();
    $tree.on('ready.jstree', function() {
        $tree.jstree('select_node', leafNode, true);
    });
});