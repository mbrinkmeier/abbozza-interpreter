/* 
 * Copyright 2019 Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>.
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
 * This static class provides a queue for messages received and send to the
 * USB Web Socket of the monitor.
 */

ABZWebSocket = {
    socket: null,
    queue : ""
};


ABZWebSocket.open = function(url) {
    console.log("Opening " + url);
    this.socket = new WebSocket(url);
    
    this.socket.onopen = this.onopen;
    this.socket.onclose = this.onclose;
    this.socket.onerror = this.onerror;
    this.socket.onmessage = this.onmessage;
}

/**
 * If the cnnection is opened, the queue is emptied
 */
ABZWebSocket.onopen = function() {
    // Reset the queue
    console.log("Opening");
    ABZWebSocket.queue = "";
}

ABZWebSocket.onclose = function() {
    // Reset the queue
    console.log("Closing");
    ABZWebSocket.queue = "";
}

/**
 * Print the error to the console.
 * @param {type} err
 * @returns {undefined}
 */
ABZWebSocket.onerror = function(err) {
    console.log("[ABZWebSocket] " + err.data);
}

/**
 * If a message is received, add it to the queue.
 * @param {type} msg
 * @returns {undefined}
 */
ABZWebSocket.onmessage = function(msg) {
    // Enqueue msg.data
    ABZWebSocket.queue = ABZWebSocket.queue + msg.data;
    if ( ABZWebSocket.queue.length > 2048 ) {
        ABZWebSocket.queue = ABZWebSocket.queue.substring(ABZWebSocket.queue.length - 2048);
    }
}

/**
 * Send a message to the socket.
 * @param {type} msg
 * @returns {undefined}
 */
ABZWebSocket.send = function(msg) {
    if ( ABZWebSocket.socket ) ABZWebSocket.socket.send(msg);
}

ABZWebSocket.sendln = function(msg) {
    ABZWebSocket.send(msg + "\n");
}
   
ABZWebSocket.sendByte = function(byte) {
    ABZWebSocket.send(String.fromCharCode(byte));
}

/**
 * Check if queue contains data.
 * @returns {boolean} True if there are bytes in the queue.
 */
ABZWebSocket.isAvailable = function() {
    return ABZWebSocket.queue.length > 0;
}

/**
 * Returns the number of available bytes.
 * @returns {int} The number of bytes stored in the queue.
 */
ABZWebSocket.availableBytes = function() {
    return ABZWebSocket.queue.length;
}

/**
 * Returns the first byte in the queue, or -1 is the queue is empty.
 * @returns {int} The first byte in the queue
 */
ABZWebSocket.getByte = function() {
    var result = -1;
    if ( ABZWebSocket.queue.length > 0 ) {
        result = ABZWebSocket.queue.charCodeAt(0);
        ABZWebSocket.queue = ABZWebSocket.queue.substr(1);
    }
    return result;
}

/**
 * Returns the whole queue.
 * @returns {String} The whle queue as a string.
 */
ABZWebSocket.getAll = function() {
    var result = ABZWebSocket.queue;
    ABZWebSocket.queue = "";
    return result;
}

/**
 * Return the first line (ie. substring ended by a newline) from the queue.
 * Returns null if  the queue contains no newline
 * @returns {String} The first line contained in the queue.
 */
ABZWebSocket.getLine = function() {
    var result = null;
    var idx = ABZWebSocket.queue.indexOf("\n"); 
    if ( idx != -1 ) {
        result = ABZWebSocket.queue.slice(0,idx);
        ABZWebSocket.queue = ABZWebSocket.queue.substr(idx+1);
    }
    return result;
}

ABZWebSocket.resetBuffer = function() {
    ABZWebSocket.queue = "";
}