// Heap visualization
// Authors: Katrina Uychaco && Kalev Roomann-Kurrik
// Last Modified: Thursday July 9, 2015

'use strict';

// Set animation delay time
var stepDelay = 300;
var setDelay = function() {
  stepDelay = parseInt(document.getElementById('delayTime').value);
  document.getElementById('delayTime').value = '';
  duration = 0.75*stepDelay;
}

// Create Heap constructor
var Heap = function() {
  this.storage = [];
};

// Heap insertion method on prototype
Heap.prototype.insert = function(value) {

  // Grab value from form if not provided
  if (value === undefined) {
    value = parseInt(document.getElementById('inputVal').value);
    document.getElementById('inputVal').value = '';
  }

  // Push to storage array
  this.storage.push(value);

  // Update visualization based on added node
  insertNode(value);

  var that = this;

  // Recursive function to handle swaps, input index
  var reheapify = function(index) {

    // Get parent index
    var parentInd = Math.ceil(index/2-1);
    // Base Case : value < parent or parent is null
    if (parentInd < 0 || that.storage[index] <= that.storage[parentInd]) {
      return 'value added to index '+index;
    }
    // Recursive Case: swap with parent and make recursive call
    that.storage[index] = that.storage[index] ^ that.storage[parentInd];
    that.storage[parentInd] = that.storage[index] ^ that.storage[parentInd];
    that.storage[index] = that.storage[index] ^ that.storage[parentInd];

    // Update visualization based on swapped nodes
    swapNodes(index, parentInd);

    setTimeout(function(){
      return reheapify(parentInd);
    }, stepDelay);
  };
  setTimeout(function() {
    return reheapify(that.storage.length-1);
  }, stepDelay);
};

// Heap remove max method on prototype
// Remove the max value from a heap, reorder the heap, and return the max value
Heap.prototype.removeMax = function() {
  // Check if heap is currently empty
  if (this.storage.length === 0) {
    // If nothing to remove then return null
    return null;
  } else if (this.storage.length === 1) {
    // If heap only has one element in it then pop off the lone element in the storage array and return it
    var removed = this.storage.pop();

    // Reset inital state
    restoreInitial();

    return removed;
  }

  // Handle all other cases where heap has more than one node
  // Preserve the max value in order to return it
  var maxValue = this.storage[0];
  // Replace the root node with the last node of the heap and remove the last node
  this.storage[0] = this.storage.pop();

  swapRoot();

  // Preserve context for inner recursive helper function
  var that = this;

  // Recursive function to restore the heap property of the heap
  var reheapify = function(index) {
    // Set index of max value to current node's index
    var maxIndex = index;

    // Check first child node's value against current node
    if ((2*index + 1 < that.storage.length) && (that.storage[2*index + 1] > that.storage[index])) {
      // If greater then set index of max value to first child node's index
      maxIndex = 2*index + 1;
    }
    // Check second child node's value against current max node
    if ((2*index + 2 < that.storage.length) && (that.storage[2*index + 2] > that.storage[maxIndex])) {
      // If greater then set index of max value to second child node's index
      maxIndex = 2*index + 2;
    }
    // If the index of the max value is not equal to the index of the current node
    // Then swap the nodes and reheapify at the new index of the current node
    if (maxIndex !== index) {
      // Swap node values
      that.storage[index] = that.storage[index] ^ that.storage[maxIndex];
      that.storage[maxIndex] = that.storage[index] ^ that.storage[maxIndex];
      that.storage[index] = that.storage[index] ^ that.storage[maxIndex];

      swapNodes(maxIndex, index);

      // Reheapify at new index of current node
      setTimeout(function() {
        reheapify(maxIndex);
      }, stepDelay);
    }
  };

  // Recursively move the swapped node down the heap until it's greater than both of its children
  setTimeout(function() {
    reheapify(0);
  }, stepDelay);

  // Return the removed max value from the heap
  return maxValue;
};

// Instantiate heap
var heap = new Heap();

