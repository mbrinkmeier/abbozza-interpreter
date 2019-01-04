Abbozza.HathiForward = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.forward"));
        this.setTooltip('');
    },
    
    execute : function(entry) {
        var res = World.hathi.forward();
        if ( res == Hathi.BUMPED_TREE ) {
            entry.state = 1;
            entry.stateMsg = "hathi.bumped_tree";
        } else if ( res == Hathi.FELL_INTO_HOLE ) {
            entry.state = 2;
            entry.stateMsg = "hathi.fell_into_hole";            
        }
        entry.finished();
        return true;    
    }    
}


Abbozza.HathiTurn = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(new Blockly.FieldDropdown(
                [
                    [ _("hathi.turn_left"), "Left" ],
                    [ _("hathi.turn_right"), "Right" ]
                ]
            ),"DIRECTION");
        this.setTooltip('');
    },
    execute : function(entry) {
        var dir = this.getFieldValue("DIRECTION");
        if ( dir == "Left" ) {
            World.hathi.turnLeft();
        } else {
            World.hathi.turnRight();            
        }
        entry.finished();
        return true;    
    }    
}


Abbozza.HathiTurnRight = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.turn_right"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.hathi.turnRight();
        entry.finished();
        return true;    
    }    
}


Abbozza.HathiPickUp = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.pick_up"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.hathi.pickUpPeanut();
        entry.finished();
        return true;    
    }    
}


Abbozza.HathiDrop = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.drop"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.hathi.dropPeanut();
        entry.finished();
        return true;    
    }    
}



Abbozza.HathiIsEmpty = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.is_empty"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hathi.isForwardEmpty();
        entry.finished();
        return true;    
    }    
}

Abbozza.HathiMoved = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.moved"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hathi.steppedForward();
        entry.finished();
        return true;    
    }    
}



Abbozza.HathiIsOnPeanut = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.is_on_shamrock"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hathi.isOnPeanut();
        entry.finished();
        return true;    
    }    
}



Abbozza.HathiIsForward = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.is_forward"))
            .appendField(new Blockly.FieldDropdown(
                [
                    [ _("hathi.PEANUT"), "" + Hathi.PEANUT ],
                    [ _("hathi.ROCK"), "" + Hathi.ROCK ],
                    [ _("hathi.TREE"), "" + Hathi.TREE ],
                    [ _("hathi.HOLE"), "" + Hathi.HOLE ],
                    [ _("hathi.OASIS"), "" + Hathi.OASIS ]
                ]
            ),"TYPE");
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hathi.isForward(Number(this.getFieldValue("TYPE")));
        entry.finished();
        return true;    
    }    
}



Blockly.Blocks['hathi_forward'] = Abbozza.HathiForward;
Blockly.Blocks['hathi_turn'] = Abbozza.HathiTurn;
Blockly.Blocks['hathi_turn_right'] = Abbozza.HathiTurnRight;
Blockly.Blocks['hathi_pick_up'] = Abbozza.HathiPickUp;
Blockly.Blocks['hathi_drop'] = Abbozza.HathiDrop;
Blockly.Blocks['hathi_is_empty'] = Abbozza.HathiIsEmpty;
Blockly.Blocks['hathi_moved'] = Abbozza.HathiMoved;
Blockly.Blocks['hathi_is_on_peanut'] = Abbozza.HathiIsOnPeanut;
Blockly.Blocks['hathi_is_forward'] = Abbozza.HathiIsForward;


AbbozzaCode['hathi_forward'] = [ 'forward();',[]];
AbbozzaCode['hathi_turn'] = [ 'turn#();',["F_DIRECTION"]];
AbbozzaCode['hathi_turn_right'] = [ 'turnRight();',[]];
AbbozzaCode['hathi_pick_up'] = [ 'pickUpPeanut();',[]];
AbbozzaCode['hathi_drop'] = [ 'dropPeanut();',[]];
AbbozzaCode['hathi_is_empty'] = [ 'isForwardEmpty()',[]];
AbbozzaCode['hathi_moved'] = [ 'steppedForward()',[]];
AbbozzaCode['hathi_is_on_peanut'] = [ 'isOnPeanut()',[]];
AbbozzaCode['hathi_is_forward'] = [ 'isForward(#)',["F_TYPE"]];
