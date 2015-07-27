/* 
* @Author: kuychaco
* @Date:   2015-07-12 12:34:43
* @Last Modified by:   kuychaco
* @Last Modified time: 2015-07-12 12:53:22
*/

'use strict';

// D3 code for tree visualization
var width = 960,
    height = 800;

var tree = d3.layout.tree()
    .size([width - 100, height - 100]);

var root = {},
    nodes = tree(root);

root.parent = root;
root.px = root.x;
root.py = root.y;

var diagonal = d3.svg.diagonal();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(10,30)");

var initialNode = svg.selectAll(".node"),
    node = initialNode,
    link = svg.selectAll(".link");

var duration = 0.75*stepDelay;


// Restore to initial state
var restoreInitial = function() {
  // Reset root and nodes to initial state
  root = {};
  nodes = tree(root);
  root.parent = root;
  root.px = root.x;
  root.py = root.y;

  // Remove node from DOM
  animateSwap();

  // Reset node to initial state
  node = initialNode;
};


// Update the array of nodes for the d3 tree layout based on adding nodes during Heap methods
var insertNode = function(value) {
  
  if (nodes[0].value === undefined) {
    // If first value is added to heap, modify root node
    nodes[0].value = value;
    nodes[0].id = 0;
  } else {
    // Add a new node to its parent in the heap.
    var n = {id: nodes.length, value: value},
        p = nodes[Math.ceil((nodes.length-2)/2)];
    if (p.children) p.children.push(n); else p.children = [n];
    nodes.push(n);
  }

  // Recompute the layout and data join.
  node = node.data(tree.nodes(root), function(d) { return d.id; });
  link = link.data(tree.links(nodes), function(d) { return d.source.id + "-" + d.target.id; });

  var nodeEnter = node.enter().append('g')
      .attr('class', 'node');

  // Add entering nodes in the parent’s old position.
  nodeEnter.append("circle")
      .attr("r", 20)
      .attr("cx", function(d) { return d.parent.px; })
      .attr("cy", function(d) { return d.parent.py; });

  // Add text to entering nodes
  nodeEnter.append('text')
      .attr("x", function(d) { return d.parent.px; })
      .attr("y", function(d) { return d.parent.py; })
      .attr('text-anchor', function(d) {
        return d.children || d._children ? 'end' : 'start'; })
      .text(function(d) { return d.value; })
      .style('fill-opacity', 1);

  // Add entering links in the parent’s old position.
  link.enter().insert("path", ".node")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: d.source.px, y: d.source.py};
        return diagonal({source: o, target: o});
      });

  // Transition nodes and links to their new positions.
  var t = svg.transition()
      .duration(duration);

  t.selectAll(".link")
      .attr("d", diagonal);

  t.selectAll("circle")
      .attr("cx", function(d) { return d.px = d.x; })
      .attr("cy", function(d) { return d.py = d.y; });

  t.selectAll("text")
      .attr("x", function(d) { return d.px = d.x; })
      .attr("y", function(d) { return d.py = d.y; });
};


// Update the array of nodes for the d3 tree layout based on swapping during Heap methods
var swapNodes = function(index, parentInd) {

  // Update nodes array
  // Find nodes at index and parentInd
  var current = nodes[index];
  var parent = nodes[parentInd];

  // Swap the x,y coordinates between node at index and node at parentInd
  current.x = current.x ^ parent.x;
  parent.x = current.x ^ parent.x;
  current.x = current.x ^ parent.x;

  current.px = current.px ^ parent.px;
  parent.px = current.px ^ parent.px;
  current.px = current.px ^ parent.px;

  current.y = current.y ^ parent.y;
  parent.y = current.y ^ parent.y;
  current.y = current.y ^ parent.y;

  current.py = current.py ^ parent.py;
  parent.py = current.py ^ parent.py;
  current.py = current.py ^ parent.py;

  // Swap the depth between node at index and node at parentInd
  current.depth = current.depth ^ parent.depth;
  parent.depth = current.depth ^ parent.depth;
  current.depth = current.depth ^ parent.depth;

  // Reassign children
  // Store non-index node child of parent (if it has one)
  parent.children = parent.children || [];

  // Track index of orphan node
  var orphanIndex;

  var parentOrphan = parent.children.filter(function(child, index) {
    if (child.id !== current.id) orphanIndex = index;
    return child.id !== current.id;
  });
  // Store current children for assigning correct parent
  var currentOrphans = current.children || [];
  // Assign parentInd node the children of index node
  parent.children = current.children;
  // Keep track of order of current children nodes
  // and assign parentOrphan to correct position in children array
  current.children = [parent];

  // Assign parentInd node and its child (that isn't the index node) as the child of index node
  if (orphanIndex !== undefined) {
    current.children.splice(orphanIndex,0,parentOrphan[0]);
  }
  // For grandParent's children, overwrite parent with current
  parent.parent.children = parent.parent.children || [];
  parent.parent.children.forEach(function(child, i, children) {
    if (child.id === parent.id) {
      children[i] = current;
    }
  });

  // Reassign parents
  // Assign parent of parentInd node as parent of index node
  current.parent = parent.parent === parent ? current : parent.parent;
  // Assign index node as the parent of parentInd node
  parent.parent = current;
  // Assign parent of parentOrphan node as index node
  parentOrphan.forEach(function(child) {
    child.parent = current;
  });
  // Assign parent of currentOrphans as parent node
  currentOrphans.forEach(function(child) {
    child.parent = parent;
  });


  // Swap actual nodes in nodes array
  var temp = nodes[index];
  nodes[index] = nodes[parentInd];
  nodes[parentInd] = temp;

  // Update root if one of the swapped nodes was at index zero of the nodes array
  if (index === 0 || parentInd === 0) {
    root = nodes[0];
    root.parent = root;
    root.px = root.x;
    root.py = root.y;
  }

  // Animate the swapping of the nodes
  animateSwap();
};


// For removeMax move last node to root
var swapRoot = function() {
  // Take last node and make root (put in nodes[0])
  var newRoot = nodes.pop();
  var oldRoot = nodes[0];
  nodes[0] = newRoot;
  root = newRoot;
  // Update x,y,px,py,depth
  newRoot.x = oldRoot.x;
  newRoot.y = oldRoot.y;
  newRoot.px = oldRoot.px;
  newRoot.py = oldRoot.xpy
  newRoot.depth = oldRoot.depth;
  // Update parents and children for new root
  oldRoot.children.forEach(function(child) {
    child.parent = newRoot;
  });
  newRoot.children = oldRoot.children;
  newRoot.parent.children = newRoot.parent.children.filter(function(child) {
    return child.id !== newRoot.id;
  });
  newRoot.parent = newRoot;
  newRoot.px = newRoot.x;
  newRoot.py = newRoot.y;
  
  // Animate
  animateSwap();
};

// Perform animation of swapping of nodes and re-establishing links between swapped nodes
var animateSwap = function() {

  // remove exit nodes
  node = node.data(tree.nodes(root), function(d) { return d.id; });
  node.exit().remove();

  // Recompute links between nodes post swapping
  link = link.data(tree.links(nodes), function(d) { return d.source.id + "-" + d.target.id; });
  
  // Add entering links
  link.enter().insert("path", ".node")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: d.source.px, y: d.source.py};
        return diagonal({source: o, target: o});
      });
  
  // Remove exit links
  link.exit().remove();

  // Transition nodes and links to new positions
  var t = svg.transition()
      .duration(duration);

  t.selectAll(".link")
      .attr("d", diagonal);

  t.selectAll("circle")
      .attr("cx", function(d) { return d.px = d.x; })
      .attr("cy", function(d) { return d.py = d.y; });

  t.selectAll("text")
      .attr("x", function(d) { return d.px = d.x; })
      .attr("y", function(d) { return d.py = d.y; });
};