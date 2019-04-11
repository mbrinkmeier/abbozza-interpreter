Abbozza.ArrayReset = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.ARRAY"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");            
        this.appendValueInput("SIZE")
            .appendField(__("array.reset",0))
            .appendField(new Blockly.FieldDropdown([
                [_("array.random"),"RANDOM"],
                [_("array.ascending"),"ASC"],
                [_("array.descending"),"DESC"]
            ]),"ORDER")
            .appendField(__("array.reset",1));
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase ) {
            case 0:
                entry.order = this.getFieldValue("ORDER");
                AbbozzaInterpreter.callInput(this,"SIZE");
                entry.phase = 1;
                break;
            case 1:
                World.arrayWorld.reset(entry.callResult,entry.order);
                entry.nonBlocking = true;
                entry.finished();
                break;
            default:
                return false;
        }
        return true;
    }
}

Blockly.Blocks['array_reset'] = Abbozza.ArrayReset;
AbbozzaCode['array_reset'] = ['reset(#);',["V_SIZE"]];



Abbozza.ArrayLength = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.ARRAY"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.appendDummyInput()
            .appendField(_("array.length"));
        this.setTooltip('');
    },
    execute : function(entry) {
        entry.returnValue = World.arrayWorld.getLength();
        entry.finished();
        return true;    
    }    
}

Blockly.Blocks['array_length'] = Abbozza.ArrayLength;
AbbozzaCode['array_length'] = ['getLength()',[]];



Abbozza.ArraySet = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.ARRAY"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(false);
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT"); 
        this.setInputsInline(true);
        this.appendValueInput("INDEX")
            .appendField(__("array.set",0))
            .setCheck("NUMBER");
        this.appendValueInput("VALUE")
            .appendField(__("array.set",1))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase) {
            case 0:
                AbbozzaInterpreter.callInput(this,"INDEX");
                entry.phase = 1;
                break;
            case 1:
                entry.index = entry.callResult;
                AbbozzaInterpreter.callInput(this,"VALUE");
                entry.phase = 2;                
                break;
            case 2:
                World.arrayWorld.set(entry.index,entry.callResult);
                entry.nonBlocking = true;
                entry.finished();
                return true;
                break;
            default:
                return false;
        }
    }    
}

Blockly.Blocks['array_set'] = Abbozza.ArraySet;
AbbozzaCode['array_set'] = ['set(#,#);',["V_INDEX","V_VALUE"]];


Abbozza.ArrayGet = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.ARRAY"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(true, "NUMBER");
        this.setInputsInline(true);
        this.appendValueInput("INDEX")
            .appendField(_("array.get"))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase) {
            case 0:
                AbbozzaInterpreter.callInput(this,"INDEX");
                entry.phase = 1;
                break;
            case 1:
                entry.returnValue = World.arrayWorld.get(entry.callResult);
                entry.finished();
                return true;
                break;
            default:
                return false;
        }
    }    
}

Blockly.Blocks['array_get'] = Abbozza.ArrayGet;
AbbozzaCode['array_get'] = ['get(#)',["V_INDEX"]];


Abbozza.ArraySwap = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.ARRAY"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(false);
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setInputsInline(true);
        this.appendValueInput("INDEX")
            .appendField(__("array.swap",0))
            .setCheck("NUMBER");
        this.appendValueInput("INDEX2")
            .appendField(__("array.swap",1))
            .setCheck("NUMBER");
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase) {
            case 0:
                AbbozzaInterpreter.callInput(this,"INDEX");
                entry.phase = 1;
                break;
            case 1:
                entry.index = entry.callResult;
                AbbozzaInterpreter.callInput(this,"INDEX2");
                entry.phase = 2;                
                break;
            case 2:
                World.arrayWorld.swap(entry.index,entry.callResult);
                entry.nonBlocking = true;
                entry.finished();
                return true;
                break;
            default:
                return false;
        }
    }    
}

Blockly.Blocks['array_swap'] = Abbozza.ArraySwap;
AbbozzaCode['array_swap'] = ['swap(#,#);',["V_INDEX","V_INDEX2"]];


Abbozza.ArrayAsIndex = {
    init : function() {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.ARRAY"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);            
        this.setOutput(false);
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setInputsInline(true);
        this.appendDummyInput("INDEX")
            .appendField(__("array.as_index",0))
            .appendField(new VariableTypedDropdown(this, "NUMBER", null), "VAR")
            .appendField(__("array.as_index",1))
            .appendField(new Blockly.FieldColour("#000000"), "COLOR");
        this.setTooltip('');
    },
    execute : function(entry) {
        switch ( entry.phase) {
            case 0:
                var varName = this.getFieldValue("VAR");
                var color = this.getFieldValue("COLOR");
                World.arrayWorld.showAsIndex(varName, color);
                entry.nonBlocking = true;
                entry.finished();
                return true;
                break;
            default:
                return false;
        }
    }    
}

Blockly.Blocks['array_as_index'] = Abbozza.ArrayAsIndex;
AbbozzaCode['array_as_index'] = ['showAsIndex("#","#");',["F_VAR","F_COLOR"]];

