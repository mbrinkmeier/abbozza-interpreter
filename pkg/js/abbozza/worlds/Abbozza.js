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


/**
 * The list of exceptions
 * @type Array
 */
Abbozza.exceptions = [];

/**
 * This operation initializes the gui of abbozza worlds.
 * @returns {undefined}
 */
Abbozza.initWorlds = function () {
    Abbozza.worldId = worldId;

    Abbozza.init('worlds', true, 'http://inf-didaktik.rz.uos.de/abbozza/calliope/help');

    ToolboxMgr.rebuild();

    Abbozza.splitter = new Splitter(document.getElementById('splitter'), "");
    AbbozzaInterpreter.init();
    AbbozzaInterpreter.setSpeed(75);
    var tabs = new TabPane(document.getElementById('tabs'));
    var infoPane = tabs.addPane(_("gui.information"), document.getElementById("worldinfo"));
    var debugPane;
    if (Configuration.getParameter("option.debug") == "true") {
        debugPane = tabs.addPane(_("gui.debug"), document.getElementById("debug"));
        Abbozza.initDebugger(debugPane);
    } else {
        debugPane = document.getElementById("debug");
        debugPane.style.display = "none";
    }
    var sourcePane;
    if (Configuration.getParameter("option.source") == "true") {
        sourcePane = tabs.addPane(_("gui.source"), document.getElementById("source"));
    } else {
        sourcePane = document.getElementById("source");
        sourcePane.style.display = "none";
    }
    var callsPane;
    if (Configuration.getParameter("option.calls") == "true") {
        callsPane = tabs.addPane(_("gui.calls"), document.getElementById("calls"));
        Abbozza.initCallView(callsPane);
    } else {
        callsPane = document.getElementById("calls");
        callsPane.style.display = "none";
    }

    Abbozza.sourceEditor = CodeMirror.fromTextArea(document.getElementById("sourceeditor"), {
        mode: "javascript",
        lineNumbers: true,
        styleSelectedText: true
    });
    Abbozza.sourceEditor.setSize(null, "100%");
    tabs.openTab(infoPane);
    World._init(document.getElementById(".topleft"));

}


/**
 * Check if the world has to be changed for the loaded sketch
 * 
 * @type Abbozza.loadSketch
 */
Abbozza.loadSketch = function () {
// Check if sketch was modified, ask if it should be saved
    if (this.modified && !this.askForSave()) {
        return;
    }

// Store current sketch
    if ((document.location.search != null) && (document.location.search != "")) {
        Abbozza.storeSketch(document.location.search.substring(1));
    }

    var xml = document.createElement("abbozza");
    Abbozza.openOverlay(_("msg.load_sketch"));
    var sketch = Connection.getXML("/abbozza/load",
            function (sketch, xhttp) {
                var location = xhttp.getResponseHeader("Content-Location");
                var tags = sketch.getElementsByTagName("system");
                if (tags.length > 0) {
                    var tag = tags[0];
                    var world = tag.getAttribute("world");
                    if (world != Abbozza.worldId) {
                        Abbozza.worldId = world;
                        Abbozza.setContentLocation(location);
                        Abbozza.clearStoredSketch(location);
                        Abbozza.reloadForced = true;
                        document.location.reload();
                        return;
                    }
                }
                Abbozza.setContentLocation(location);
                Abbozza.closeOverlay();
                Abbozza.clearSketch();
                Abbozza.setSketch(sketch);
            },
            function (response) {
                Abbozza.closeOverlay();
            }
    );
};

Abbozza.worldFromDom = function (worldXml) {
    if (World.fromDom) {
        World.fromDom(worldXml);
    }
}


Abbozza.worldToDom = function () {
    if (World.toDom) {
        return World.toDom();
    }
    return null;
}


Abbozza.getContentBase = function () {
    return "/abbozza/world/" + Abbozza.worldId + "/";
};
Abbozza.getFeaturePath = function () {
    return "/abbozza/features/" + Abbozza.worldId + "/";
}


Abbozza.getWorldIdFromPath = function (path) {
    var prefix = "/abbozza/world/";
    var start = path.indexOf(prefix);
    if (start >= 0) {
        var start = start + prefix.length;
        var end = path.indexOf("/", start);
        return path.substring(start + 1, end);
    } else {
        // Default context is console
        return "console";
    }
};
Abbozza.initButtons = function () {
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
Blockly.BlockSvg.prototype.addSystemContextMenuItems = function (menuOptions) {
    var block = this;
    var breakpointOption = {
        text: _("gui.toggle_breakpoint"),
        enabled: true,
        callback: function () {
            if (block.isBreakpoint && (block.isBreakpoint == true)) {
                block.isBreakpoint = false;
            } else {
                block.isBreakpoint = true;
            }
            block.updateBreakpointMark();
        }
    };
    menuOptions.push(breakpointOption);
};

Abbozza.waitingForAnimation = false;
/**
 * Create the system tag for sainbg
 * 
 * @param {type} workspace
 * @returns {Abbozza.workspaceToDom.xml}
 */
Abbozza.getSystemTag = function () {
    var tag = document.createElement("system");
    tag.textContent = Abbozza.systemPrefix;
    tag.setAttribute("world", Abbozza.worldId);
    return tag;
}

/**
 * Adds an exception to the list of exceptions
 * 
 * @param {type} code A numerical code describing the type of exception
 * @param {type} msg A textual message to be shown to the user.
 */
Abbozza.throwException = function(code,msg) {
    Abbozza.exceptions.push([code,msg]);
} 

/**
 * 
 * @returns {undefined}
 */

Abbozza.generateSource = function () {
    Abbozza.openOverlay(_("msg.generate_sketch"));
    var code = this.Generator.workspaceToCode();
    Abbozza.sourceEditor.setValue(code);
    if (!ErrorMgr.hasErrors()) {
        Abbozza.appendOverlayText(_("msg.code_generated"));
    }
    Abbozza.closeOverlay();
    AbbozzaInterpreter.sourceState = AbbozzaInterpreter.SOURCE_STOPPED;
}


Abbozza.waitForAnimation = function (anim, callback) {
    Abbozza.waitingForAnimation = true;
    anim.onfinish = function () {
        Abbozza.waitingForAnimation = false;
        if (callback)
            callback.call(this);
    }
}



Abbozza.loadSource = function () {
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


Abbozza.saveSource = function () {
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

/**
 * Initialize the call View
 * @param {type} callPane
 * @returns {undefined}
 */
Abbozza.initCallView = function (callPane) {
    Abbozza.callCount = 0;
    var view = document.getElementById("callView");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // svg.setAttribute("width","100%");
    // svg.setAttribute("height","100%");
    svg.setAttribute("transform", "scale(1 -1)");
    view.appendChild(svg);
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0,0");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "black");
    svg.appendChild(path);
    // Register event handlers
    document.addEventListener("abz_start", function (event) {
        Abbozza.callCount = 0;
        Abbozza.lastCallStep = 0;
        path.setAttribute("d", "M 0,0");
    });
    document.addEventListener("abz_step", function (event) {
        if (AbbozzaInterpreter.threads[0] == null)
            return;
        var list = AbbozzaInterpreter.threads[0].callList;
        if (Abbozza.callCount != list.length) {
            for (var i = Abbozza.callCount; i < list.length; i++) {
                var d = path.getAttribute("d");
                var step = list[i][0];
                console.log(list[i]);
                var dx = step - Abbozza.lastCallStep;
                if (list[i][1] != null) {
                    d = d + " l " + dx + ",0 l 0,10 ";
                } else {
                    d = d + " l " + dx + ",0 l 0,-10 ";
                }
                path.setAttribute("d", d);
                svg.setAttribute("width", path.getBBox().width);
                svg.setAttribute("height", path.getBBox().height);
                Abbozza.lastCallStep = list[i][0];
            }

            Abbozza.callCount = list.length;
            // callPane.textContent = AbbozzaInterpreter.threads[0].callList;
        }
    });
    document.addEventListener("abz_stop", function (event) { });
    document.addEventListener("abz_error", function (event) { });
}


/**
 * Initialize debug Panel
 * 
 * @param {type} debugPane The pane into which the debug panel should be injected
 * @returns {undefined}
 */
Abbozza.initDebugger = function (debugPane) {
    document.getElementById("stepLabel").textContent = _("gui.executed_steps") + " ";
    document.getElementById("blockLabel").textContent = _("gui.executed_blocks") + " ";
    // Register event handlers
    document.addEventListener("abz_start", function (event) {
        Abbozza.updateDebugger(debugPane);
    });
    document.addEventListener("abz_step", function (event) {
        Abbozza.updateDebugger(debugPane);
    });
    document.addEventListener("abz_stop", function (event) {
        Abbozza.updateDebugger(debugPane);
    });
    document.addEventListener("abz_error", function (event) {
        Abbozza.updateDebugger(debugPane);
    });
}

/**
 * Update the debug panel
 * 
 * @param {type} debugPane
 * @returns {undefined}
 */
Abbozza.updateDebugger = function (debugPane) {
    document.getElementById("stepCounter").textContent = AbbozzaInterpreter.executedSteps;
    document.getElementById("blockCounter").textContent = AbbozzaInterpreter.executedBlocks;
    if (!Abbozza.debugViews)
        return;
    for (var i = 0; i < Abbozza.debugViews.length; i++) {
        var view = Abbozza.debugViews[i];
        var name = view.nameField.value;
        var value = view.valueField;
        var symbol = AbbozzaInterpreter.getSymbol(name);
        value.textContent = String(symbol);
    }
}


/**
 * Add a watch to the debugger.
 * 
 * @returns {undefined}
 */
Abbozza.addDebugView = function () {
    if (!Abbozza.debugViews) {
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
    this.nameField.setAttribute("type", "text");
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
    this.button.onclick = function (event) {
        parent.removeChild(child);
        // TODO
    }
    this.view.appendChild(this.button);
}
