Abbozza.TurtleClear = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("turtle.clear"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.turtle.clear();
        entry.nonBlocking = true;
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_clear'] = Abbozza.TurtleClear;

Abbozza.TurtleReset = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("turtle.reset"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.turtle.reset();
        entry.nonBlocking = true;
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_reset'] = Abbozza.TurtleReset;


Abbozza.TurtleForward = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("VALUE")
            .appendField(_("turtle.forward"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"VALUE","NUMBER");
            entry.phase = 1;
        } else {
            World.turtle.forward(entry.callResult);
            entry.nonBlocking = true;
            entry.finished();
        }        
        return true;    
    }    
}

Blockly.Blocks['turtle_forward'] = Abbozza.TurtleForward;

Abbozza.TurtleBackward = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("VALUE")
            .appendField(_("turtle.backward"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"VALUE","NUMBER");
            entry.phase = 1;
        } else {
            World.turtle.backward(entry.callResult);
            entry.nonBlocking = true;
            entry.finished();
        }        
        return true;    
    }    
}

Blockly.Blocks['turtle_backward'] = Abbozza.TurtleBackward;


Abbozza.TurtleTurnLeft = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("VALUE")
            .appendField(_("turtle.left"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"VALUE","NUMBER");
            entry.phase = 1;
        } else {
            World.turtle.turnLeft(entry.callResult);
            entry.nonBlocking = true;
            entry.finished();
        }        
        return true;    
    }    
}

Blockly.Blocks['turtle_turn'] = Abbozza.TurtleTurnLeft;
Blockly.Blocks['turtle_turn_left'] = Abbozza.TurtleTurnLeft;


Abbozza.TurtleTurnRight = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("VALUE")
            .appendField(_("turtle.right"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"VALUE","NUMBER");
            entry.phase = 1;
        } else {
            World.turtle.turnRight(entry.callResult);
            entry.nonBlocking = true;
            entry.finished();
        }        
        return true;    
    }    
}

Blockly.Blocks['turtle_turn_right'] = Abbozza.TurtleTurnRight;


Abbozza.TurtleSetDirection = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("VALUE")
            .appendField(_("turtle.set_dir"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"VALUE","NUMBER");
            entry.phase = 1;
        } else {
            World.turtle.setDirection(entry.callResult);
            entry.nonBlocking = true;
            entry.finished();
        }        
        return true;    
    }    
}

Blockly.Blocks['turtle_set_direction'] = Abbozza.TurtleSetDirection;


Abbozza.TurtleSetWidth = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("VALUE")
            .appendField(_("turtle.set_width"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"VALUE","NUMBER");
            entry.phase = 1;
        } else {
            World.turtle.setWidth(entry.callResult);
            entry.finished();
        }        
        return true;    
    }    
}

Blockly.Blocks['turtle_set_width'] = Abbozza.TurtleSetWidth;


Abbozza.TurtleSetColor = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("turtle.set_color"))
            .appendField(new Blockly.FieldColour("#000000"), "COLOR");
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            var col = this.getFieldValue("COLOR");
            World.turtle.setColor(col);
            entry.nonBlocking = true;
            entry.finished();
        }        
        return true;    
    }    
}

Blockly.Blocks['turtle_set_color'] = Abbozza.TurtleSetColor;


Abbozza.TurtleSetRGBColor = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("turtle.set_color"));
        this.appendValueInput("RED")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(_("turtle.red"))
            .setCheck("NUMBER");
        this.appendValueInput("GREEN")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(_("turtle.green"))
            .setCheck("NUMBER");
        this.appendValueInput("BLUE")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(_("turtle.blue"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase ) {
            case 0 :
                AbbozzaInterpreter.callInput(this,"RED","NUMBER");
                entry.phase = 1;
                break;
            case 1 :
                entry.red = entry.callResult;
                AbbozzaInterpreter.callInput(this,"GREEN","NUMBER");
                entry.phase = 2;
                break;
            case 2 :
                entry.green = entry.callResult;
                AbbozzaInterpreter.callInput(this,"BLUE","NUMBER");
                entry.phase = 3;
                break;
            case 3 :
                World.turtle.setRGBColor(entry.red , entry.green , entry.callResult);
                entry.nonBlocking = true;
                entry.finished();
                break;
                
        }
        return true;
    }    
}

Blockly.Blocks['turtle_set_rgb_color'] = Abbozza.TurtleSetRGBColor;



Abbozza.TurtlePenUp = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("turtle.penup"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.turtle.penUp();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_penup'] = Abbozza.TurtlePenUp;


Abbozza.TurtlePenDown = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("turtle.pendown"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.turtle.penDown();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_pendown'] = Abbozza.TurtlePenDown;



Abbozza.TurtleHide = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("turtle.hide"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.turtle.hide();
        entry.nonBlocking = true;
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_hide'] = Abbozza.TurtleHide;


Abbozza.TurtleShow = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("turtle.show"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.turtle.show();
        entry.nonBlocking = true;
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_show'] = Abbozza.TurtleShow;



Abbozza.TurtleGetX = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(_("turtle.getx"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.turtle.getX();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_getx'] = Abbozza.TurtleGetX;


Abbozza.TurtleGetY = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(_("turtle.gety"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.turtle.getY();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_gety'] = Abbozza.TurtleGetY;



Abbozza.TurtleGetDir = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(_("turtle.get_dir"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.turtle.getDirection();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_get_dir'] = Abbozza.TurtleGetDir;



Abbozza.TurtleGetRed = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(_("turtle.get_red"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.turtle.getPixelRed();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_get_red'] = Abbozza.TurtleGetRed;


Abbozza.TurtleGetGreen = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(_("turtle.get_green"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.turtle.getPixelGreen();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_get_green'] = Abbozza.TurtleGetGreen;



Abbozza.TurtleGetBlue = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TURTLE"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(_("turtle.get_blue"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.turtle.getPixelBlue();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['turtle_get_blue'] = Abbozza.TurtleGetBlue;

AbbozzaCode['turtle_clear'] = [ 'clear();',[]];
AbbozzaCode['turtle_reset'] = [ 'reset();',[]];
AbbozzaCode['turtle_forward'] = [ 'forward(#);',["V_VALUE"]];
AbbozzaCode['turtle_backward'] = [ 'backward(#);',["V_VALUE"]];
AbbozzaCode['turtle_turn'] = [ 'turnLeft(#);',["V_VALUE"]];
AbbozzaCode['turtle_turn_left'] = [ 'turnLeft(#);',["V_VALUE"]];
AbbozzaCode['turtle_turn_right'] = [ 'turnRight(#);',["V_VALUE"]];
AbbozzaCode['turtle_set_direction'] = [ 'setDirection(#);',["V_VALUE"]];
AbbozzaCode['turtle_set_width'] = [ 'setWidth(#);',["V_VALUE"]];
AbbozzaCode['turtle_set_color'] = [ 'setRGBColor(#);',[function (generator) {
        var color = generator.fieldToCode(this,"COLOR");
        
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        var red = parseInt(result[1],16);
        var green = parseInt(result[2],16);
        var blue = parseInt(result[3],16);
        
        var code = "";
        var code = "";
        code = red + "," + green + "," + blue;
        
        return code;
    }]];
AbbozzaCode['turtle_set_rgb_color'] = [ 'setRGBColor(#,#,#);',["V_RED","V_GREEN","V_BLUE"]];
AbbozzaCode['turtle_penup'] = [ 'penUp();',[]];
AbbozzaCode['turtle_pendown'] = [ 'penDown();',[]];
AbbozzaCode['turtle_hide'] = [ 'hide();',[]];
AbbozzaCode['turtle_show'] = [ 'show();',[]];
AbbozzaCode['turtle_getx'] = [ 'getX()',[]];
AbbozzaCode['turtle_gety'] = [ 'getY()',[]];
AbbozzaCode['turtle_get_dir'] = [ 'getDir()',[]];
AbbozzaCode['turtle_get_red'] = [ 'getPixelRed()',[]];
AbbozzaCode['turtle_get_green'] = [ 'getPixelGreen()',[]];
AbbozzaCode['turtle_get_blue'] = [ 'getPixelBlue()',[]];

