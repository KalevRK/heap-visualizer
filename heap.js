// Heap visualization
// Authors: Katrina Uychaco && Kalev Roomann-Kurrik
// Last Modified: Tuesday July 7, 2015

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

// Accepts an input array and returns a single element array with an object element
// representing the hierarchical structure of the heap
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

// Array to represent input data
var input = [5,7,1,10,0,12];

var heap = new Heap();

input.forEach(function(value) {
  heap.insert(value);
  console.log(heap.viewStorage());
});

console.log('heap.viewStorage:', heap.viewStorage());
var treeData = arrayToHierarchy(heap.viewStorage());

console.log('heap.removeMax():', heap.removeMax());
console.log('heap.viewStorage:', heap.viewStorage());
console.log('heap.removeMax():', heap.removeMax());
console.log('heap.viewStorage:', heap.viewStorage());

// D3 code for tree visualization
var margin = {top: 20, right: 120, bottom: 20, left: 120},
  width = 960 - margin.right - margin.left,
  height = 500 - margin.top - margin.bottom;

var i = 0;

var tree = d3.layout.tree()
  .size([height, width]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.x, d.y]; });

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var root = treeData[0];

update(root);

setTimeout(function() {
  console.log('Updating tree');
  treeData = arrayToHierarchy(heap.viewStorage());
  console.log('treeData:', treeData);
  update(treeData[0]);
}, 2000);

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
      return 'translate(' + d.x + ',' + d.y + ')'; });

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
