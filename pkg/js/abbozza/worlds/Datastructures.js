/* 
 * Copyright 2018 mbrin.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This class implements a generic stack.
 * 
 * @returns {Stack}
 */
function Stack() {
    this.elements = [];
}

Stack.prototype.isEmpty = function() {
    return ( this.elements.length == 0 );
}

Stack.prototype.push = function(value) {
    this.elements.push(value);
}

Stack.prototype.top = function() {
    if ( this.elements.length > 0 ) {
        return this.elements[this.elements.length-1];
    } else {
       Abbozza.throwException(1,_("err.stack_is_empty"));
       return null;
    }
}

Stack.prototype.pop = function() {
    if ( this.elements.length > 0 ) {
        return this.elements.pop();
    } else {
       Abbozza.throwException(1,_("err.stack_is_empty"));
       return null;
    }
}


/**
 * This class implements a generic queue
 * 
 * @returns {Queue}
 */
function Queue() {
    this.elements = [];
}

Queue.prototype.isEmpty = function() {
    return ( this.elements.length == 0 );
}

Queue.prototype.enqueue = function(value) {
    this.elements.push(value);
}

Queue.prototype.head = function() {
    if ( this.elements.length > 0 ) {
        return this.elements[0];
    } else {
       Abbozza.throwException(1,_("err.queue_is_empty"));
       return null;
    }
}

Queue.prototype.dequeue = function() {
    if ( this.elements.length > 0 ) {
        var val = this.elements[0];
        this.elements.splice(0,1);
        return val;
    } else {
       Abbozza.throwException(1,_("err.queue_is_empty"));
       return null;
    }
}


/**
 * This class implements a generic list, or moee precisely a dynamic array.
 * 
 * @returns {List}
 */
function List() {
    this.elements = [];
}

List.prototype.isEmpty = function() {
    return ( length.elements == 0 );
}


List.prototype.getItem = function(index) {
    if (( index < 0 ) || ( index >= this.elements.length )) {
        Abbozza.throwException(1,_("err.list_invalid_index"));
        return null;
    } else {
        return this.elements[index];
    }
}

List.prototype.append = function(value) {
   this.elements.push(value);
}

List.prototype.insertAt = function(index,value) {
    if (( index < 0 ) || ( index > this.elements.length )) {
        Abbozza.throwException(1,_("err.list_invalid_index"));
    } else {
        this.elements.splice(index,0,value);
    }
}

List.prototype.setItem = function(index,value) {
    if (( index < 0 ) || ( index >= this.elements.length )) {
        Abbozza.throwException(1,_("err.list_invalid_index"));
    } else {
        this.elements[index] = value;
    }
}

List.prototype.delete = function(index) {
    if (( index < 0 ) || ( index >= this.elements.length )) {
        Abbozza.throwException(1,_("err.list_invalid_index"));
    } else {
        this.elements.splice(index,1);
    }
}

List.prototype.getLength = function() {
    return this.elements.length;
}


/**
 * This class implements generic binary tree node
 * 
 * @param {type} value
 * @returns {BinTree}
 */
BinTree = function(value) {
    this.data = value;
    this.leftChild = null;
    this.rightChild = null;
    this.parent = null;
}

BinTree.prototype.getData = function() {
    return this.data;
}

BinTree.prototype.setData = function(value) {
    this.data = value;
}


BinTree.prototype.getLeftChild = function() {
    return this.leftChild;
}

BinTree.prototype.getRightChild = function() {
    return this.rightChild;
}

BinTree.prototype.getParent = function() {
    return this.parent;
}

BinTree.prototype.setLeftChild = function(binTree) {
    this.leftChild = binTree;
    binTree.parent = this;
}

BinTree.prototype.setRightChild = function(binTree) {
    this.rightChild = binTree;
    binTree.parent = this;
}

BinTree.prototype.deleteLeftChild = function () {
    if (this.leftChild) this.leftChild.parent = null;
    this.leftChild = null;
}

BinTree.prototype.deleteRightChild = function () {
    if (this.rightChild) this.rightChild.parent = null;
    this.rightChild = null;
}

BinTree.prototype.hasLeftChild = function () {
    return (this.leftChild != null);
}

BinTree.prototype.hasRightChild = function () {
    return (this.rightChild != null);
}

BinTree.prototype.hasParent = function () {
    return (this.parent != null);
}

BinTree.prototype.isLeaf = function() {
    return ( this.leftChild == null ) && (this.rightChild == null );
}