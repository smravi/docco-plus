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
          return node.label === item;
        })[0];
        if (!thisNode) {
          parentNode.children.push((thisNode = {
            label: item,
            id: array.slice(0, index + 1).join('!'),
            children: []
          }));
        }
        parentNode = thisNode;
      } else {
        parentNode.children.push({
          label: item,
          id: hrefs[i],
          href: hrefs[i]
        });
      }
    });
  }

  $tree.empty().tree({
    data: treeData.children,
    openedIcon: '-',
    closedIcon: '+'
  });
  // bind 'tree.click' event
  $tree.bind(
    'tree.click',
    function (event) {
      // The clicked node is 'event.node'
      var node = event.node;
      if (node.href) {
        window.location = node.href;
      }
    }
  );
  // open the selected node parent
  var leafNode = window.location.href.split('/').pop();
  // FIXME - is there a better way?
  var path = leafNode.split('!');
  path.pop();
  var treeNodeId = path.join('!');
  $tree.tree('openNode', $tree.tree('getNodeById', treeNodeId));
  // select the current node
  $tree.tree('selectNode', $tree.tree('getNodeById', leafNode));
});