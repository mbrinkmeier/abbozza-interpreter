/* 
 * Copyright 2018 Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>.
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

// A static object containing page hooks
var Page = {};

//  static object containing task hooks
var Task = {};

// A static object managing the contetns of the current task
TaskContent = {
    pages       : new Array(),  // The array of all <page>-elements
    wrapperDiv  : null,         // The div wrapping the contents
    pageDiv     : null,         // The div displaying the current page
    contentDiv  : null,          // A hidden div containing the pages
    taskScript  : null,
    pageScript  : null,
    currentPage : 0,
    editing     : false,
    listeners   : [],
    ckeditor    : null
};


TaskContent.init = function() {
    this.wrapperDiv = document.createElementNS(Blockly.HTML_NS, 'div');
    this.wrapperDiv.className = "taskOverlayPage";
    this.wrapperDiv.innerHTML = '';
    this.wrapperDiv.style.display = "block";

    this.pageDiv = document.createElementNS(Blockly.HTML_NS, 'div');
    this.pageDiv.className = "taskOverlayEditorWrapper";
    this.wrapperDiv.appendChild(this.pageDiv);
    
    this.contentDiv = document.createElementNS(Blockly.HTML_NS, 'pages');
    this.contentDiv.className = "taskOverlayContent";
    this.contentDiv.style.display = "none";
    
    this.editing = false;
    
};


TaskContent.getWrapperDiv = function() {
    if ( this.wrapperDiv == null ) {
        TaskContent.init();
    }
    
    return this.wrapperDiv;
};

TaskContent.getPageDiv = function() {
    if ( this.pageDiv == null ) {
        TaskContent.init();
    }
    
    return this.pageDiv;
};

/**
 * Set the content of the TaskWindow. It is given as an HTML-string (not a
 * DOM). Setting flag to true resets the displayed page number to 0.
 * 
 * @param {type} html The HTML string
 * @param {type} reset If true, the displayed page is reset to page number 0
 */

TaskContent.setContent = function(html, reset) {
    // Trigger the onHide hooks of the current page and task
    if ( Page.onHide != null ) {
        Page.onHide();
        Page.onHide = null;
    }        

    // Throw away old content
    if ( Task.onHide != null ) {
        Task.onHide();
        Task.onHide = null;
    }        

    // Create new dom
    var dom = document.createElementNS(Blockly.HTML_NS, 'pages');
    dom.innerHTML = html;

    // Reset the Task hooks
    Task = {};
    Task.initialized = false;
    this.taskScript = null;

    // Reset the pages array
    this.pages = new Array();
    if (reset) this.currentPage = 0;

    // Find the first TASKSCRIPT element
    scripts = dom.getElementsByTagName("TASKSCRIPT");
    if ( scripts[0] ) {
        this.taskScript = scripts[0].textContent;
    }

    // Retreive all pages from dom
    var list = dom.getElementsByTagName('page');
    if ( list.length == 0 ) {
        // If no page is found, everything is one page
        this.pages.push(dom);
    } else {
      for ( var i = 0; i < list.length; i++ ) {
          this.pages.push(list[i]);
      }
    }
    
    // If no pages were found, use the whole content as page.
    if (this.pages.length == 0) {
        var parent = this.contentDiv.getElementsByTagName('pages');
        if ( !parent ) parent = dom;
        // If no page is given, the whole thing is the page
        var page = document.createElementNS(Blockly.HTML_NS, "page");
        this.pages = new Array();
        this.pages.push(page);
    }
        
    // Now TaskWindow.pages_ contains the doms of the single pages
   
    // Go to the current page
    if ( (this.currentPage_ < this.pages.length) && !reset) {
        TaskWindow.setPage_(this.currentPage,false);
    } else {
        TaskWindow.setPage_(0,false);
    }

    this.notifyUpdateListeners(); 
}


/**
 * Increase zoom by 0.1
 */
TaskContent.zoomIn = function() {
    var zoom = parseFloat(TaskContent.pageDiv.style.zoom);
    if ( isNaN(zoom) ) zoom = 1.0;
    zoom = zoom + 0.1;
    TaskContent.pageDiv.style.zoom = zoom;
};

/**
 * Decrease zoom by 0.1
 */
TaskContent.zoomOut = function() {
    var zoom = parseFloat(TaskContent.pageDiv.style.zoom);
    if ( isNaN(zoom) ) zoom = 1.0;
    zoom = zoom - 0.1;
    TaskContent.pageDiv.style.zoom = zoom;    
};


TaskContent.addUpdateListener = function(listener,func) {
    this.listeners.push([listener,func]);
};


TaskContent.notifyUpdateListeners = function() {
    for ( var i = 0; i < this.listeners.length ; i++) {
        this.listeners[i][1].call(this.listeners[i][0]);
    }
};

TaskContent.getPageScript = function() {
    return this.pageScript;
}

TaskContent.setPageScript = function(script) {
    this.pageScript = script;
}