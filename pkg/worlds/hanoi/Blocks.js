Abbozza.HanoiMove = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HANOI"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("FROM")
            .appendField(__("hanoi.move",0))
            .setCheck(["NUMBER"]);
        this.appendValueInput("TO")
            .appendField(__("hanoi.move",1))
            .setCheck(["NUMBER"]);
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase ) {
            case 0:
                AbbozzaInterpreter.callInput(this,"FROM");
                entry.phase = 1;
                break;
            case 1:
                entry.from = entry.callResult;
                AbbozzaInterpreter.callInput(this,"TO");
                entry.phase = 2;
                break;
            case 2:
                entry.phase = 3;
                if (!World.hanoi.moveDisc(entry.from,entry.callResult)) {
                    return false;
                }
                break;
            case 3:
                if ( !Abbozza.waitingForAnimation ) {
                    entry.finished();
                }
                break;
        }
        return true;
    }
}

Blockly.Blocks['hanoi_move'] = Abbozza.HanoiMove;
AbbozzaCode['hanoi_move'] = [ 'moveDisc(#,#);',["V_FROM","V_TO"]];


Abbozza.HanoiReset = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HANOI"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("DISCS")
            .appendField(_("hanoi.reset"))
            .setCheck(["NUMBER"]);
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase ) {
            case 0:
                AbbozzaInterpreter.callInput(this,"DISCS");
                entry.phase = 1;
                break;
            case 1:
                World.hanoi.reset(entry.callResult);
                entry.nonBlocking = true;
                entry.finished();
                break;
            default:
                return false;
        }
        return true;
    }
}

Blockly.Blocks['hanoi_reset'] = Abbozza.HanoiReset;
AbbozzaCode['hanoi_reset'] = ['reset(#);',["V_DISCS"]];



Abbozza.HanoiNumberOfDiscs = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HANOI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(_("hanoi.number_of_discs"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.hanoi.getNumberOfDiscs();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['hanoi_number_of_discs'] = Abbozza.HanoiNumberOfDiscs;
AbbozzaCode['hanoi_number_of_discs'] = ['getNumberOfDiscs()',[]];



Abbozza.HanoiGetSize = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.HANOI"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendValueInput("POS")
            .appendField(_("hanoi.get_size"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase) {
            case 0:
                AbbozzaInterpreter.callInput(this,"POS");
                entry.phase = 1;
                break;
            case 1:
                entry.returnValue = World.hanoi.getSize(entry.callResult);
                entry.finished();
                return true;
                break;
            default:
                return false;
        }
    }    
}

Blockly.Blocks['hanoi_get_size'] = Abbozza.HanoiGetSize;
AbbozzaCode['hanoi_get_size'] = ['getSize(#)',["V_POS"]];