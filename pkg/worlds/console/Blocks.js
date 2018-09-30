Abbozza.ConsolePrint = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.CONSOLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("TEXT")
            .appendField(_("console.print"))
            .setCheck(["STRING","NUMBER","DECIMAL","BOOLEAN"]);
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"TEXT");
            entry.phase = 1;
        } else {
            World.mycon.print(entry.callResult);
            entry.finished();
        }        
        return true;    
    }    
}


Abbozza.ConsolePrintln = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.CONSOLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("TEXT")
            .appendField(_("console.println"))
            .setCheck(["STRING","NUMBER","DECIMAL","BOOLEAN"]);
        this.setTooltip('');
    },
    execute : function(entry) {
        if ( entry.phase == 0 ) {
            AbbozzaInterpreter.callInput(this,"TEXT");
            entry.phase = 1;
        } else {
            World.mycon.println(entry.callResult);
            entry.finished();
        }        
        return true;    
    }    
}

Abbozza.ConsoleClear = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.CONSOLE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendDummyInput()
            .appendField(_("console.clear"));
        this.setTooltip('');
    },
    execute : function(entry) {
        World.mycon.clear();
        entry.finished();
        return true;    
    }    
}


Abbozza.ConsoleReadKey = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.CONSOLE"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "STRING");
        this.appendDummyInput()
            .appendField(_("console.readkey"));
        this.setTooltip('');
    },
    execute : function(entry) {
        var ent = entry;
        if ( entry.phase == 0 ) { 
            World.mycon.readkey( function(text) {
                ent.returnValue = text;
                ent.finished();
            } );
            entry.phase = 1;
        }
        return true;    
    }    
}

Abbozza.ConsoleReadLine = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.CONSOLE"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "STRING");
        this.appendDummyInput()
            .appendField(_("console.readline"));
        this.setTooltip('');
    },
    execute : function(entry) {
        var ent = entry;
        if ( entry.phase == 0 ) { 
            World.mycon.readline( function(text) {
                ent.returnValue = text;
                ent.finished();
            } );
            entry.phase = 1;
        }
        return true;    
    }    
}


Blockly.Blocks['console_clear'] = Abbozza.ConsoleClear;
Blockly.Blocks['console_print'] = Abbozza.ConsolePrint;
Blockly.Blocks['console_println'] = Abbozza.ConsolePrintln;
Blockly.Blocks['console_readkey'] = Abbozza.ConsoleReadKey;
Blockly.Blocks['console_readline'] = Abbozza.ConsoleReadLine;

