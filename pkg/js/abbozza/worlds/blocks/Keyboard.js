/**
 * @license
 * abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The blocks for the main block
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Abbozza.KeyGetPressed = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.KEYBOARD"));
    this.appendDummyInput()
        .appendField(_("keyboard.GET_PRESSED"));
    this.setInputsInline(false);
    this.setOutput(true, "STRING");
    this.setTooltip('');
  },
    execute : function(entry) {
        entry.returnValue = World.getPressedKey();
        entry.nonBlocking = true;
        entry.finished();
        return true;    
    }
}


Abbozza.KeyGetLast = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.KEYBOARD"));
    this.appendDummyInput()
        .appendField(_("keyboard.GET_LAST"));
    this.setInputsInline(false);
    this.setOutput(true, "STRING");
    this.setTooltip('');
  },
    execute : function(entry) {
        entry.returnValue = World.getLastKey();
        entry.nonBlocking = true;
        entry.finished();
        return true;    
    }
}

Abbozza.KeyConst = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.KEYBOARD"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
            [_("key.RIGHT"), "ArrowRight"], 
            [_("key.LEFT"), "ArrowLeft"], 
            [_("key.UP"), "ArrowUp"], 
            [_("key.DOWN"), "ArrowDown"], 
            [_("key.PGUP"), "PageUp"], 
            [_("key.PGDOWN"), "PageDown"], 
            [_("key.BACKSPACE"), "Backspace"], 
            [_("key.DELETE"), "Delete"], 
            [_("key.ESCAPE"), "Escape"], 
            [_("key.END"), "End"],
            [_("key.HOME"), "Home"], 
            [_("key.TAB"), "Tab"], 
            [_("key.INSERT"), "Insert"]
        ]), "KEY");
    this.setOutput(true,"STRING");
    this.setTooltip('');
  },
    execute : function(entry) {
        entry.returnValue = this.getFieldValue("KEY");
        entry.finished();
        return true;    
    }
};


Blockly.Blocks['key_get_pressed'] = Abbozza.KeyGetPressed;
Blockly.Blocks['key_get_last'] = Abbozza.KeyGetLast;
Blockly.Blocks['key_const'] = Abbozza.KeyConst;

AbbozzaCode['key_get_pressed'] = [ 'getPressedKey()',[]];
AbbozzaCode['key_get_last'] = [ 'getLastKey()',[]];
AbbozzaCode['key_const'] = [ '"#"',["F_KEY"]];