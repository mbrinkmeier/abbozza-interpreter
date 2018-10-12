Abbozza.KaraForward = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.forward"));
        this.setTooltip('');
    },
    
    execute : function(entry) {
        var res = World.kara.forward();
        if ( res != 0 ) {
            entry.state = 1;
            entry.stateMsg = "kara.bumped_stone";
        } else 
        entry.finished();
        return true;    
    }    
}


Abbozza.KaraTurnLeft = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.turn_left"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.kara.turnLeft();
        entry.finished();
        return true;    
    }    
}


Abbozza.KaraTurnRight = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.turn_right"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.kara.turnRight();
        entry.finished();
        return true;    
    }    
}


Abbozza.KaraPickUp = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.pick_up"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.kara.pickUpShamrock();
        entry.finished();
        return true;    
    }    
}


Abbozza.KaraDrop = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.drop"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.kara.dropShamrock();
        entry.finished();
        return true;    
    }    
}



Abbozza.KaraIsEmpty = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.is_empty"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.kara.isForwardEmpty();
        entry.finished();
        return true;    
    }    
}

Abbozza.KaraMoved = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.moved"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.kara.steppedForward();
        entry.finished();
        return true;    
    }    
}



Abbozza.KaraIsOnShamrock = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.is_on_shamrock"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.kara.isOnShamrock();
        entry.finished();
        return true;    
    }    
}



Abbozza.KaraIsForward = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.KARA"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "BOOLEAN");
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("kara.png",16,16))
            .appendField(_("kara.is_forward"))
            .appendField(new Blockly.FieldDropdown(
                [
                    [ _("kara.MUSHROOM"), "" + Kara.MUSHROOM ],
                    [ _("kara.ROCK"), "" + Kara.ROCK ],
                    [ _("kara.TREE"), "" + Kara.TREE ]
                ]
            ),"TYPE");
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.kara.isForward(Number(this.getFieldValue("TYPE")));
        entry.finished();
        return true;    
    }    
}



Blockly.Blocks['kara_forward'] = Abbozza.KaraForward;
Blockly.Blocks['kara_turn_left'] = Abbozza.KaraTurnLeft;
Blockly.Blocks['kara_turn_right'] = Abbozza.KaraTurnRight;
Blockly.Blocks['kara_pick_up'] = Abbozza.KaraPickUp;
Blockly.Blocks['kara_drop'] = Abbozza.KaraDrop;
Blockly.Blocks['kara_is_empty'] = Abbozza.KaraIsEmpty;
Blockly.Blocks['kara_moved'] = Abbozza.KaraMoved;
Blockly.Blocks['kara_is_on_shamrock'] = Abbozza.KaraIsOnShamrock;
Blockly.Blocks['kara_is_forward'] = Abbozza.KaraIsForward;


AbbozzaCode['kara_forward'] = [ 'forward();',[]];
AbbozzaCode['kara_turn_left'] = [ 'turnLeft();',[]];
AbbozzaCode['kara_turn_right'] = [ 'turnRight();',[]];
AbbozzaCode['kara_pick_up'] = [ 'pickUpShamrock();',[]];
AbbozzaCode['kara_drop'] = [ 'dropShamrock();',[]];
AbbozzaCode['kara_is_empty'] = [ 'isForwardEmpty()',[]];
AbbozzaCode['kara_moved'] = [ 'steppedForward()',[]];
AbbozzaCode['kara_is_on_shamrock'] = [ 'isOnShamrock()',[]];
AbbozzaCode['kara_is_forward'] = [ 'isForward(#)',["F_TYPE"]];
