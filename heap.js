// Heap visualization
// Authors: Katrina Uychaco && Kalev Roomann-Kurrik
// Last Modified: Monday July 6, 2015

'use strict';

// TODO: create Heap constructor
var Heap = function() {
  this.storage = [];
};

Heap.prototype.viewStorage = function() {
  return this.storage;
};

// TODO: insertion method on prototype
Heap.prototype.insert = function(value) {
  // push to storage array
  this.storage.push(value);

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

    return recurse(parentInd);
  };
  return recurse(this.storage.length-1);
};

// TODO: array to represent input data
var input = [5,7,1,10,0,12];

var heap = new Heap();

input.forEach(function(value) {
  heap.insert(value);
  console.log(heap.viewStorage());
});



// TODO: function to transform heap array into a nested d3 data structure
// Accepts an input array and returns an object representing the hierarchical structure of the heap
function arrayToHierarchy(arr) {
  
  // recursively build out the hierarchical structure of the heap
  function addChildren(node, index) {
    // check that first child index is valid
    var firstChild = 2*index + 1;

    if (firstChild < arr.length) {
      // add child node to current node's children array
      node.children.push({
        value: arr[firstChild],
        children: []
      });

      // recursively call addChildren on latest child
      addChildren(node.children[0], firstChild);
    }

    // check that second child index is valid
    var secondChild = 2*index + 2;

    if (secondChild < arr.length) {
      // add child node to current node's children array
      node.children.push({
        value: arr[secondChild],
        children: []
      });

      // recursively call addChildren on latest child
      addChildren(node.children[1], secondChild);
    }
  }
  // hierarchical structure of heap
  var nodeData = [];

  // add root node of heap to nodeData
  nodeData.push({
    value: arr[0],
    children: []
  });

  // start recursive call by passing in top level node object
  addChildren(nodeData[0], 0);

  return nodeData;
}

// TODO: write d3 code for tree visualization

var margin = {top: 20, right: 120, bottom: 20, left: 120},
  width = 960 - margin.right - margin.left,
  height = 500 - margin.top - margin.bottom;

var i = 0;

var tree = d3.layout.tree()
  .size([height, width]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var root = treeData[0];

update(root);

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
    links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Declare the nodes…
  var node = svg.selectAll('g.node')
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {
      return 'translate(' + d.y + ',' + d.x + ')'; });

  nodeEnter.append('circle')
    .attr('r', function(d) { return d.value; })
    .style('stroke', function(d) { return d.type; })
    .style('fill', function(d) { return d.level; });

  nodeEnter.append('text')
    .attr('x', function(d) {
      return d.children || d._children ?
      (d.value + 4) * -1 : d.value + 4 })
    .attr('dy', '.35em')
    .attr('text-anchor', function(d) {
      return d.children || d._children ? 'end' : 'start'; })
    .text(function(d) { return d.value; })
    .style('fill-opacity', 1);

  // Declare the links…
  var link = svg.selectAll('path.link')
    .data(links, function(d) { return d.target.id; });

  // Enter the links.
  link.enter().insert('path', 'g')
    .attr('class', 'link')
      .style('stroke', function(d) { return d.target.level; })
    .attr('d', diagonal);

}
