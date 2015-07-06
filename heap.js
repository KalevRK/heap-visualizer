// Heap visualization
// Authors: Katrina Uychaco && Kalev Roomann-Kurrik
// Last Modified: Monday July 6, 2015

// TODO: array to represent input data

// TODO: create Heap constructor

// TODO: insertion method on prototype

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

