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
            entry.state = 0;
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
        if ( World.hathi.pickUpBanana() == Hathi.NO_BANANA ) {
            entry.state = 2;
            entry.stateMsg = "hathi.no_banana";            
        };
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
        if ( World.hathi.dropBanana() != 0 ) {
            entry.state = 2;
            entry.stateMsg = "hathi.no_banana_drop";            
        }
        entry.finished();
        return true;    
    }    
}


Abbozza.HathiGetBananas = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.get_bananas"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hathi.getBananas();
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



Abbozza.HathiIsOnBanana = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.is_on_banana"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hathi.isOnBanana();
        entry.finished();
        return true;    
    }    
}

Abbozza.HathiIsOnBasket = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.is_on_basket"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hathi.isOnBasket();
        entry.finished();
        return true;    
    }    
}


Abbozza.HathiGetBananasOnField = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.get_bananas_on_field"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hathi.getBananasOnField();
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
                    [ _("hathi.BANANA"), "" + Hathi.BANANA ],
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

Abbozza.HathiSay = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HATHI"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("TEXT")
            .setCheck("STRING")
            .appendField(new Blockly.FieldImage("img/hathi_right.png",16,16))
            .appendField(_("hathi.say"));
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase ) {
            case 0 : 
              AbbozzaInterpreter.callInput(this,"TEXT","STRING");
              entry.phase = 1;                
              break;
          case 1 : 
              World.hathi.say(entry.callResult);
              entry.finished();
              break;
        }
        return true;    
    }    
}


Blockly.Blocks['hathi_forward'] = Abbozza.HathiForward;
Blockly.Blocks['hathi_turn'] = Abbozza.HathiTurn;
Blockly.Blocks['hathi_turn_right'] = Abbozza.HathiTurnRight;
Blockly.Blocks['hathi_pick_up'] = Abbozza.HathiPickUp;
Blockly.Blocks['hathi_drop'] = Abbozza.HathiDrop;
Blockly.Blocks['hathi_get_bananas'] = Abbozza.HathiGetBananas;
Blockly.Blocks['hathi_get_bananas_on_field'] = Abbozza.HathiGetBananasOnField;
Blockly.Blocks['hathi_is_empty'] = Abbozza.HathiIsEmpty;
Blockly.Blocks['hathi_moved'] = Abbozza.HathiMoved;
Blockly.Blocks['hathi_is_on_banana'] = Abbozza.HathiIsOnBanana;
Blockly.Blocks['hathi_is_on_basket'] = Abbozza.HathiIsOnBasket;
Blockly.Blocks['hathi_is_forward'] = Abbozza.HathiIsForward;
Blockly.Blocks['hathi_say'] = Abbozza.HathiSay;


AbbozzaCode['hathi_forward'] = [ 'forward();',[]];
AbbozzaCode['hathi_turn'] = [ 'turn#();',["F_DIRECTION"]];
AbbozzaCode['hathi_pick_up'] = [ 'pickUpBanana();',[]];
AbbozzaCode['hathi_drop'] = [ 'dropBanana();',[]];
AbbozzaCode['hathi_get_bananas'] = [ 'getBananas()',[]];
AbbozzaCode['hathi_get_bananas_on_field'] = [ 'getBananasOnField()',[]];
AbbozzaCode['hathi_is_empty'] = [ 'isForwardEmpty()',[]];
AbbozzaCode['hathi_moved'] = [ 'steppedForward()',[]];
AbbozzaCode['hathi_is_on_banana'] = [ 'isOnBanana()',[]];
AbbozzaCode['hathi_is_on_basket'] = [ 'isOnBasket()',[]];
AbbozzaCode['hathi_is_forward'] = [ 'isForward(#)',["F_TYPE"]];
AbbozzaCode['hathi_say'] = [ 'say(#)',["V_TEXT"]];
