/**
 * @license
 * abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview This class is the internal "Task Window".
 * 
 * Its contents can be edited in the GUI. It displays HTML and can execute
 * JavaScript. It provides two perspectives on the content. The content 
 * perspective displays the content as rendered HTML and allows navigation 
 * through a series of pages. The editor perspective allows the editing of the
 * HTML code, including the definition of multiple pages by <page>-tags.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 * 
 * NOT SYSTEM SPECIFIC
 */

TaskWindow.init = function() {
    TaskWindow.frame = new Frame("Aufgabe",null);
    TaskWindow.frame.setPosition(0,"50%");
    TaskWindow.frame.setSize("50%","50%");
    TaskWindow.show();
  
    var content = TaskWindow.frame.content;

    TaskWindow.page_wrapper_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.page_wrapper_.className = "taskFrameWrapper";
    TaskWindow.page_wrapper_.innerHTML = '';
    TaskWindow.page_wrapper_.style.display = "block";
    content.appendChild(TaskWindow.page_wrapper_);
    
    // This div contains the current page and the editor
    TaskWindow.page_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.page_.className = "taskOverlayEditorWrapper";
    TaskWindow.page_wrapper_.appendChild(TaskWindow.page_);


    TaskWindow.nav_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.nav_.className = "taskFrameNav";
    TaskWindow.nav_.value = '';

    TaskWindow.nav_prevSketch = document.createElement("SPAN");
    TaskWindow.nav_prevSketch.innerHTML = "<img src='img/nav/prevsketch.png'/>";
    TaskWindow.nav_prevSketch.onclick = TaskWindow.prevSketch_;
    TaskWindow.nav_prevSketch.className = "taskFrameNavButton";
    TaskWindow.nav_prevSketch.title = _("gui.task_tooltip_prevsketch");
    TaskWindow.nav_.appendChild(TaskWindow.nav_prevSketch);        
    
    TaskWindow.nav_prev = document.createElementNS(Blockly.HTML_NS,'span');
    TaskWindow.nav_prev.innerHTML = "<img src='img/nav/prev.png'/>";
    TaskWindow.nav_prev.className = "taskFrameNavButton";
    TaskWindow.nav_prev.onclick = TaskWindow.prevPage_;
    TaskWindow.nav_prev.title = _("gui.task_tooltip_prev");
    TaskWindow.nav_.appendChild(TaskWindow.nav_prev);
    
    TaskWindow.nav_.pageno_ = document.createElementNS(Blockly.HTML_NS, 'SPAN');
    TaskWindow.nav_.appendChild(TaskWindow.nav_.pageno_);
    TaskWindow.nav_.pageno_.className = "taskFrameNAvButton";
    TaskWindow.nav_.appendChild(TaskWindow.nav_.pageno_);
    // TaskWindow.nav_.style.display = "none";
    content.appendChild(TaskWindow.nav_);

    TaskWindow.nav_next = document.createElementNS(Blockly.HTML_NS,'span');
    TaskWindow.nav_next.innerHTML = "<img src='img/nav/next.png'/>";
    TaskWindow.nav_next.className = "taskFrameNavButton";
    TaskWindow.nav_next.onclick = TaskWindow.nextPage_;
    TaskWindow.nav_next.title = _("gui.task_tooltip_next");
    TaskWindow.nav_.appendChild(TaskWindow.nav_next);
 
    TaskWindow.nav_nextSketch = document.createElement("SPAN");
    TaskWindow.nav_nextSketch.innerHTML = "<img src='img/nav/nextsketch.png'/>";
    TaskWindow.nav_nextSketch.onclick = TaskWindow.nextSketch_;
    TaskWindow.nav_nextSketch.className = "taskFrameNavButton";
    TaskWindow.nav_nextSketch.title = _("gui.task_tooltip_nextsketch");
    TaskWindow.nav_.appendChild(TaskWindow.nav_nextSketch);        

};

TaskWindow.show = function() {
    TaskWindow.frame.show();
};

TaskWindow.hide = function() {
    TaskWindow.frame.hide();
};

TaskWindow.isVisible = function() {
    return (TaskWindow.frame.div.style.display == "block");
};

TaskWindow.setSize = function(width, height) {
    TaskWindow.frame.setSize(width,height);
}

TaskWindow.getWidth = function() {
    return TaskWindow.frame.div.offsetWidth;
}

TaskWindow.getHeight = function() {
    return TaskWindow.frame.div.offsetHeight;
}


TaskWindow.setEditable  = function(editable) {};
TaskWindow.updateNav_ = function() {};