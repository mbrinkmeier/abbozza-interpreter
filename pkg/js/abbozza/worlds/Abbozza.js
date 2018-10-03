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
    but = document.getElementById("tools");
    but.setAttribute("title", _("gui.tools_button"));
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