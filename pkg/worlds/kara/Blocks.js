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
        World.kara.forward();
        entry.finished();
        return true;    
    }    
}
Blockly.Blocks['kara_forward'] = Abbozza.KaraForward;


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
Blockly.Blocks['kara_turn_left'] = Abbozza.KaraTurnLeft;


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
Blockly.Blocks['kara_turn_right'] = Abbozza.KaraTurnRight;


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
Blockly.Blocks['kara_pick_up'] = Abbozza.KaraPickUp;


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
Blockly.Blocks['kara_drop'] = Abbozza.KaraDrop;



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
Blockly.Blocks['kara_is_empty'] = Abbozza.KaraIsEmpty;



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
Blockly.Blocks['kara_is_on_shamrock'] = Abbozza.KaraIsOnShamrock;



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
Blockly.Blocks['kara_is_forward'] = Abbozza.KaraIsForward;
