$(function () {
  var treeData = {
    children: []
  };
  var thisNode, parentNode;
  var $tree = $('#jump_page');
  for (var i = 0, l = links.length; i < l; i++) {
    parentNode = thisNode = treeData;
    links[i].split('!').forEach(function (item, index, array) {
      if (index !== array.length - 1) {
        var thisNode = parentNode.children.filter(function (node) {
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
    });
  }

  $tree.empty().jstree({
    core: {
      data: treeData.children
    }
  });
  // bind events to open page
  $tree.on('changed.jstree', function (e, data) {
    if (data.node.icon === 'jstree-file') {
      window.location.href = data.node.id;
    }
  });
  // open the selected node parent
  var leafNode = window.location.href.split('/').pop();
  $tree.on('ready.jstree', function () {
    $tree.jstree('select_node', leafNode, true);
  });
});