/**
 * @license
 * abbozza!
 *
 * Copyright 2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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

Abbozza.worldFromDom = function(worldXml) {
    if (World.fromDom) {
        World.fromDom(worldXml);
    }
}


Abbozza.worldToDom = function() {
    if (World.toDom) {
        return World.toDom();
    }
    return null;
}


Abbozza.getFeaturePath = function() {
    return "/abbozza/features/" + Abbozza.worldId + "/";
}


Abbozza.getWorldIdFromPath = function(path) {
    var prefix = "/abbozza/world/";
    var start = path.indexOf(prefix);
    if ( start >= 0 ) {
        var start = start + prefix.length;
        var end = path.indexOf("/",start);
        return path.substring(start+1,end);
    } else {
        // Default context is consol
        return "console";
    }
};

Abbozza.initButtons = function() {
    // Set the buttons toolstips
    var but = document.getElementById("step");
    but.setAttribute("title", _("gui.generate_button"));
    but = document.getElementById("run");
    but.setAttribute("title", _("gui.upload_button"));
    but = document.getElementById("stop");
    but.setAttribute("title", _("gui.upload_button"));
    but = document.getElementById("new");
    but.setAttribute("title", _("gui.new_button"));
    but = document.getElementById("load");
    but.setAttribute("title", _("gui.load_button"));
    but = document.getElementById("save");
    but.setAttribute("title", _("gui.save_button"));
    but = document.getElementById("config");
    but.setAttribute("title", _("gui.config_button"));
    but = document.getElementById("info");
    but.setAttribute("title", _("gui.info_button"));
};


Abbozza.getContentBase = function() {
  return "/abbozza/world/" + Abbozza.worldId + "/";  
};


Blockly.BlockSvg.prototype.addSystemContextMenuItems = function(menuOptions) {
    var block = this;
    var breakpointOption = {
        text: _("gui.toggle_breakpoint"),
        enabled: true,
        callback: function () {
            if (block.isBreakpoint && (block.isBreakpoint == true) ) {
                block.isBreakpoint = false;
            } else {
                block.isBreakpoint = true;
            }
            block.updateBreakpointMark();
        }
    };
    menuOptions.push(breakpointOption);
};



Abbozza.sourceInterpreter = null;
Abbozza.SOURCE_STOPPED = 0;
Abbozza.SOURCE_PAUSED = 1;
Abbozza.SOURCE_RUNNING = 2;
Abbozza.SOURCE_ABORTED = 3;
Abbozza.SOURCE_ABORTED_BY_ERROR = 4;

Abbozza.sourceState = 0; 
Abbozza.waitingForAnimation = false;


Abbozza.generateSource = function() {
    Abbozza.openOverlay(_("msg.generate_sketch"));
    var code = this.Generator.workspaceToCode();
    Abbozza.sourceEditor.setValue(code);
    if (!ErrorMgr.hasErrors()) {
        Abbozza.appendOverlayText(_("msg.code_generated"));
    }
    Abbozza.closeOverlay();
    Abbozza.sourceState = Abbozza.SOURCE_STOPPED;
}

Abbozza.runSource = function() {
    if ( (Abbozza.sourceState == Abbozza.SOURCE_STOPPED) 
         || (Abbozza.sourceState >= Abbozza.SOURCE_ABORTED) ) {      
        var code = Abbozza.sourceEditor.getValue();
        Abbozza.sourceInterpreter = new Interpreter(code,World._initSourceInterpreter);
        Abbozza.sourceState == Abbozza.SOURCE_STOPPED;
    }
    Abbozza.sourceState = Abbozza.SOURCE_RUNNING;
    window.setTimeout(Abbozza.doSourceStep,0);    
}

Abbozza.stepSource = function() {
    if ( (Abbozza.sourceState == Abbozza.SOURCE_STOPPED) 
            || (Abbozza.sourceState >= Abbozza.SOURCE_ABORTED) ) {      
        var code = Abbozza.sourceEditor.getValue();
        Abbozza.sourceInterpreter = new Interpreter(code,World._initSourceInterpreter);
    }
    Abbozza.sourceState = Abbozza.SOURCE_PAUSED;
    window.setTimeout(Abbozza.doSourceStep,0);
}

Abbozza.stopSource = function() {
    Abbozza.sourceState = Abbozza.SOURCE_STOPPED;
}


Abbozza.doSourceStep = function() {
    if ( !Abbozza.waitingForAnimation ) {
        Abbozza.executeSourceStep();
        if ( Abbozza.sourceState == Abbozza.SOURCE_RUNNING )
            window.setTimeout(Abbozza.doSourceStep, AbbozzaInterpreter.delay );
    } else {
        window.setTimeout(Abbozza.doSourceStep,0);        
    }
}


Abbozza.executeSourceStep = function() {
    if ( Abbozza.sourceState == Abbozza.SOURCE_STOPPED ) {
        World._onStart();
        var code = Abbozza.sourceEditor.getValue();
        Abbozza.sourceInterpreter = new Interpreter(code,World._initSourceInterpreter);        
    }
    
    try {
        var state = Abbozza.sourceInterpreter.stateStack[Abbozza.sourceInterpreter.stateStack.length - 1];
        var spos = Abbozza.sourceEditor.getDoc().posFromIndex(state.node.start);
        var epos = Abbozza.sourceEditor.getDoc().posFromIndex(state.node.end);
        if ( Abbozza.lastMark ) Abbozza.lastMark.clear();
        Abbozza.lastMark = Abbozza.sourceEditor.getDoc().markText(spos,epos, { className: "sourceMarker" });
        var stepped = Abbozza.sourceInterpreter.step();
        World._onStep();
        
        if (!stepped) {
            Abbozza.sourceState = Abbozza.SOURCE_ABORTED;
            if ( Abbozza.lastMark ) Abbozza.lastMark.clear();            
            Abbozza.openOverlay(_("gui.finished"));
            Abbozza.overlayWaitForClose();
        }
    } catch (e) {
        Abbozza.sourceState = Abbozza.SOURCE_ABORTED_BY_ERROR;
        if ( Abbozza.lastMark ) {
            Abbozza.lastMark.clear();
            Abbozza.lastMark = Abbozza.sourceEditor.getDoc().markText(spos,epos, { className: "sourceErrorMarker" });
        }
        Abbozza.openOverlay(_("gui.aborted_by_error"));
        Abbozza.appendOverlayText("\n");
        Abbozza.appendOverlayText(e);
        Abbozza.overlayWaitForClose();

    }
}


Abbozza.waitForAnimation = function(anim,callback) {
    Abbozza.waitingForAnimation = true;
    anim.onfinish = function() {
        Abbozza.waitingForAnimation = false;
        if (callback) callback.call(this);
    }
}



Abbozza.loadSource = function() {
    Abbozza.openOverlay(_("msg.load_source"));
    var sketch = Connection.getText("/abbozza/loadsource",
            function (code, xhttp) {
                Abbozza.closeOverlay();
                Abbozza.sourceEditor.setValue(code);
            },
            function (response) {
                Abbozza.closeOverlay();
            }
    );
}


Abbozza.saveSource = function() {
    var source = Abbozza.sourceEditor.getValue();
    Abbozza.openOverlay(_("msg.save_source"));
    Connection.sendText("/abbozza/savesource", source,
            function (response, xhttp) {
                Abbozza.closeOverlay();
            },
            function (response, xhttp) {
                Abbozza.closeOverlay();
            }
    );
}




Abbozza.initDebugger = function(debugPane) {
    document.getElementById("stepLabel").textContent = _("gui.executed_steps") + " ";
    document.getElementById("blockLabel").textContent = _("gui.executed_blocks") + " ";
    
    // Register event handlers
    document.addEventListener("abz_start", function(event) { Abbozza.updateDebugger(debugPane); });
    document.addEventListener("abz_step", function(event) { Abbozza.updateDebugger(debugPane); });
    document.addEventListener("abz_stop", function(event) { Abbozza.updateDebugger(debugPane); });
    document.addEventListener("abz_error", function(event) { Abbozza.updateDebugger(debugPane); });    
}


Abbozza.updateDebugger = function(debugPane) {
    document.getElementById("stepCounter").textContent = AbbozzaInterpreter.executedSteps;
    document.getElementById("blockCounter").textContent = AbbozzaInterpreter.executedBlocks;
    
    if ( !Abbozza.debugViews ) return;
    
    for ( var i = 0; i < Abbozza.debugViews.length; i++ ) {
        var view = Abbozza.debugViews[i];
        var name = view.nameField.value;
        var value = view.valueField;
        var symbol = AbbozzaInterpreter.getSymbol(name);
        value.textContent = String(symbol);
    }
}



Abbozza.addDebugView = function() {
    if ( !Abbozza.debugViews ) {
        Abbozza.debugViews = [];
    }
    var view = new DebugView();
    var views = document.getElementById("debugViews");
    views.appendChild(view.view);
    Abbozza.debugViews.push(view);
}



function DebugView() {
    this.view = document.createElement("div");
    this.view.className = "debugView";
    
    this.nameField = document.createElement("input");
    this.nameField.setAttribute("type","text");
    this.nameField.className = "debugViewName";
    this.nameField.placeholder = "<Name>";
    this.view.appendChild(this.nameField);
    
    this.valueField = document.createElement("span");
    this.valueField.className = "debugViewValue";
    this.view.appendChild(this.valueField);
    
    this.button = document.createElement("span");
    this.button.className = "debugViewButton";
    this.button.textContent = "-";
    var parent = document.getElementById("debugViews");
    var child = this.view;
    this.button.onclick = function(event) {
        parent.removeChild(child);
        // TODO
    }
    this.view.appendChild(this.button);
}
