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

Abbozza.sourceState = 0; 


Abbozza.generateSource = function() {
    Abbozza.openOverlay(_("msg.generate_sketch"));
    var code = this.Generator.workspaceToCode();
    Abbozza.sourceEditor.setValue(code);
    if (!ErrorMgr.hasErrors()) {
        Abbozza.appendOverlayText(_("msg.code_generated"));
    }
    Abbozza.closeOverlay();
}

Abbozza.runSource = function() {
    if ( (Abbozza.sourceState == Abbozza.SOURCE_STOPPED) || (Abbozza.sourceState == Abbozza.SOURCE_ABORTED) ) {      
        var code = Abbozza.sourceEditor.getValue();
        Abbozza.sourceInterpreter = new Interpreter(code,World._initSourceInterpreter);
    }
    Abbozza.sourceState = Abbozza.SOURCE_RUNNING;
    window.setTimeout(Abbozza.doSourceStep,0);    
}

Abbozza.stepSource = function() {
    if ( (Abbozza.sourceState == Abbozza.SOURCE_STOPPED) || (Abbozza.sourceState == Abbozza.SOURCE_ABORTED) ) {      
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
    try {
        var state = Abbozza.sourceInterpreter.stateStack[Abbozza.sourceInterpreter.stateStack.length - 1];
        var spos = Abbozza.sourceEditor.getDoc().posFromIndex(state.node.start);
        var epos = Abbozza.sourceEditor.getDoc().posFromIndex(state.node.end);
        if ( Abbozza.lastMark ) Abbozza.lastMark.clear();
        Abbozza.lastMark = Abbozza.sourceEditor.getDoc().markText(spos,epos, { className: "sourceMarker" });
        var stepped = Abbozza.sourceInterpreter.step();
        if ( stepped && (Abbozza.sourceState == Abbozza.SOURCE_RUNNING) ) {
            window.setTimeout(Abbozza.doSourceStep,0);          
        } else {
            if (!stepped) {
                Abbozza.sourceState = Abbozza.SOURCE_STOPPED;
                alert("Finished");
            }
        }
    } catch (e) {
        console.log(e);
        console.log(Abbozza.sourceInterpreter);
    }
}