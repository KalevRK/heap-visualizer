// Heap visualization
// Authors: Katrina Uychaco && Kalev Roomann-Kurrik
// Last Modified: Thursday July 9, 2015

'use strict';

// Create Heap constructor
var Heap = function() {
  this.storage = [];
};

Heap.prototype.viewStorage = function() {
  return this.storage;
};

// heap insertion method on prototype
Heap.prototype.insert = function(value) {
  // push to storage array
  this.storage.push(value);

  // update visualization based on added node
  insertNode(value);

  var that = this;

  // recursive function to handle swaps, input index
  var recurse = function(index) {

    // get parent index
    var parentInd = Math.ceil(index/2-1);
    // BC: value < parent or parent is null
    if (parentInd < 0 || that.storage[index] < that.storage[parentInd]) {
      return 'value added to index '+index;
    }
    // RC: swap with parent and make recursive call
    that.storage[index] = that.storage[index] ^ that.storage[parentInd];
    that.storage[parentInd] = that.storage[index] ^ that.storage[parentInd];
    that.storage[index] = that.storage[index] ^ that.storage[parentInd];

    // update visualization based on swapped nodes
    swapNodes(index, parentInd);

    setTimeout(function(){
      return recurse(parentInd);
    }, 1000);
  };
  setTimeout(function() {
    return recurse(that.storage.length-1);
  }, 1000);
};

// heap remove max method on prototype
// Remove the max value from a heap, reorder the heap, and return the max value
Heap.prototype.removeMax = function() {
  // check if heap is currently empty
  if (this.storage.length === 0) {
    // if nothing to remove then return null
    return null;
  } else if (this.storage.length === 1) {
    // if heap only has one element in it then pop off the lone element in the storage array and return it
    return this.storage.pop();
  }
  // handle all other cases where heap has more than one node
  // preserve the max value in order to return it
  var maxValue = this.storage[0];
  // replace the root node with the last node of the heap and remove the last node
  this.storage[0] = this.storage.pop();

  // preserve context for inner recursive helper function
  var that = this;

  // recursive function to restore the heap property of the heap
  var reheapify = function(index) {
    // set index of max value to current node's index
    var maxIndex = index;

    // check first child node's value against current node
    if ((2*index + 1 < that.storage.length) && (that.storage[2*index + 1] > that.storage[index])) {
      // if greater then set index of max value to first child node's index
      maxIndex = 2*index + 1;
    }
    // check second child node's value against current max node
    if ((2*index + 2 < that.storage.length) && (that.storage[2*index + 2] > that.storage[maxIndex])) {
      // if greater then set index of max value to second child node's index
      maxIndex = 2*index + 2;
    }
    // if the index of the max value is not equal to the index of the current node
    // then swap the nodes and reheapify at the new index of the current node
    if (maxIndex !== index) {
      // swap node values
      that.storage[index] = that.storage[index] ^ that.storage[maxIndex];
      that.storage[maxIndex] = that.storage[index] ^ that.storage[maxIndex];
      that.storage[index] = that.storage[index] ^ that.storage[maxIndex];
      
      // reheapify at new index of current node
      reheapify(maxIndex);
    }
  };

  // recursively move the swapped node down the heap until it's greater than both of its children
  reheapify(0);

  // return the removed max value from the heap
  return maxValue;
};


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

var node = svg.selectAll(".node"),
    link = svg.selectAll(".link");

var duration = 750;

// Array to represent input data
var input = [5,7,1,10,4];

var heap = new Heap();

// insert new values into the heap on a regular interval for testing
setInterval(function() {
  if (input.length > 0) {
    heap.insert(input.shift());
  }
}, 3000);

// Update the array of nodes for the d3 tree layout based on adding nodes during Heap methods
function insertNode(value) {
  
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
  // root = nodes[0];
  node = node.data(tree.nodes(root), function(d) { return d.id; });
  link = link.data(tree.links(nodes), function(d) { return d.source.id + "-" + d.target.id; });

  var nodeEnter = node.enter().append('g')
      .attr('class', 'node');

  // Add entering nodes in the parent’s old position.
  nodeEnter.append("circle")
      .attr("class", "node")
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

  t.selectAll(".node circle")
      .attr("cx", function(d) { return d.px = d.x; })
      .attr("cy", function(d) { return d.py = d.y; });

  t.selectAll(".node text")
      .attr("x", function(d) { return d.px = d.x; })
      .attr("y", function(d) { return d.py = d.y; });
}

// Update the array of nodes for the d3 tree layout based on swapping during Heap methods
function swapNodes(index, parentInd) {

  // update nodes array
  // find nodes at index and parentInd
  var current = nodes[index];
  var parent = nodes[parentInd];

  // swap the x,y coordinates between node at index and node at parentInd
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

  // swap the depth between node at index and node at parentInd
  current.depth = current.depth ^ parent.depth;
  parent.depth = current.depth ^ parent.depth;
  current.depth = current.depth ^ parent.depth;

  // Reassign children
  // store non-index node child of parent (if it has one)
  parent.children = parent.children || [];
  var parentOrphan = parent.children.filter(function(child) {
    return child.id !== current.id;
  });
  // store current children for assigning correct parent
  var currentOrphans = current.children || [];
  // assign parentInd node the children of index node
  parent.children = current.children;
  // assign parentInd node and its child (that isn't the index node) as the child of index node
  current.children = [parent].concat(parentOrphan);
  // for grandParent's children, overwrite parent with current
  parent.parent.children = parent.parent.children || [];
  parent.parent.children.forEach(function(child, i, children) {
    if (child.id === parent.id) {
      children[i] = current;
    }
  });

  // Reassign parents
  // assign parent of parentInd node as parent of index node
  current.parent = parent.parent === parent ? current : parent.parent;
  // assign index node as the parent of parentInd node
  parent.parent = current;
  // assign parent of parentOrphan node as index node
  parentOrphan.forEach(function(child) {
    child.parent = current;
  });
  // assign parent of currentOrphans as parent node
  currentOrphans.forEach(function(child) {
    child.parent = parent;
  });

  // swap actual nodes in nodes array
  var temp = nodes[index];
  nodes[index] = nodes[parentInd];
  nodes[parentInd] = temp;

  // update root if one of the swapped nodes was at index zero of the nodes array
  if (index === 0 || parentInd === 0) {
    root = nodes[0];
    root.parent = root;
    root.px = root.x;
    root.py = root.y;
  }

  // animate the swapping of the nodes
  animateSwap();
}

// Perform animation of swapping of nodes and re-establishing links between swapped nodes
function animateSwap() {
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

  t.selectAll(".node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

  t.selectAll(".node text")
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });
}
