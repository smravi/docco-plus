$(function() {
    var jsTreeData = JSON.parse($('#jsTreeJSON').text().trim());
    var $tree = $('nav.navigationTree').jstree({
        core: {
            data: jsTreeData,
            themes: {
                name: 'default-dark'
            },
            plugins: [
                'search'
            ]
        }
    });
    // bind events to open page
    $tree.on('changed.jstree', function(e, data) {
        if (!data.node) {
            return;
        }
        if (data.node.icon === 'jstree-file') {
            window.location.href = data.node.a_attr.href;
        } else {
            $tree.jstree('open_node', data.node, true);
        }
    });

    // open the selected node parent
    var leafNode = window.location.href.split('/').pop();
    $tree.on('ready.jstree', function() {
        $tree.jstree('select_node', leafNode, true);
    });

    $('.navigatorToggle').on('click', function() {
        var nav = $('nav.navigationTree');
        if (nav.hasClass('minimized')) {
            nav.removeClass('minimized');
        } else {
            nav.addClass('minimized');
        }
    });
});
