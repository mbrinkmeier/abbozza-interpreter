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
 * @fileoverview Blocks for in and output control
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */



Abbozza.WebSocketOpen = {
    init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    var port = Number(Abbozza.serverPort)+1;
    this.appendDummyInput()
        .appendField(_("websocket.OPEN"))
        .appendField(new Blockly.FieldTextInput("ws://localhost:" + port),"URL");
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
}

Blockly.Blocks['websocket_open'] = Abbozza.WebSocketOpen;

Abbozza.WebSocketClose = {
    init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(_("websocket.CLOSE"));
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
}

Blockly.Blocks['websocket_close'] = Abbozza.WebSocketClose;



/**
 * Write 4-byte int to the serial port
 */
Abbozza.WebSocketWriteInt = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/oscill.png",16,16))     
        .appendField(_("websocket.WRITE_INT"))
        .setCheck("NUMBER");
    this.setOutput(false);  
    this.setInputsInline(false);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
}

Blockly.Blocks['websocket_write_int'] = Abbozza.WebSocketWriteInt;


/**
 * Read 4-byte int to the serial port
 */
Abbozza.WebSocketReadInt = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/oscill.png",16,16))     
        .appendField(_("websocket.READ_INT"));
    this.setOutput(true,"NUMBER");  
    this.setInputsInline(true);
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  }
}

Blockly.Blocks['websocket_read_int'] = Abbozza.WebSocketReadInt;



/**
 * Write byte int to the serial port
 */
Abbozza.WebSocketWriteByte = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("websocket.WRITE_BYTE"))
        .setCheck("NUMBER");
    this.setOutput(false);  
    this.setInputsInline(false);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
}

Blockly.Blocks['websocket_write_byte'] = Abbozza.WebSocketWriteByte;


/**
 * Read 4-byte int to the serial port
 */
Abbozza.WebSocketReadByte = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("websocket.READ_BYTE"));
    this.setOutput(true,"NUMBER");  
    this.setInputsInline(false);
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  }
}

Blockly.Blocks['websocket_read_byte'] = Abbozza.WebSocketReadByte;



/**
 * Write a string to the serial port.
 */
Abbozza.WebSocketPrint = {
  init: function() {
     this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("websocket.PRINT"))
        .setCheck("STRING");
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
 }
}

Blockly.Blocks['websocket_print'] = Abbozza.WebSocketPrint;

/**
 * Writes a string with a newline to the serial port.
 */
Abbozza.WebSocketPrintLn = {
   init: function() {
     this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("websocket.PRINTLN"))
        .setCheck(["STRING","NUMBER","BOOLEAN","DECIMAL"]);
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
   }
}

Blockly.Blocks['websocket_println'] = Abbozza.WebSocketPrintLn;

/**
 * Writes a string with a newline to the serial port.
 */
Abbozza.WebSocketReadLn = {
   init: function() {
     this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("websocket.READLN"));
    this.setOutput(true,"STRING");  
    this.setTooltip('');
 }
}

Blockly.Blocks['websocket_readln'] = Abbozza.WebSocketReadLn;


/**
 * Writes a string with a newline to the serial port.
 */
Abbozza.WebSocketAvailable = {
   init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("websocket.AVAILABLE"));
    this.setOutput(true,"BOOLEAN");  
    this.setTooltip('');
    }
}

Blockly.Blocks['websocket_available'] = Abbozza.WebSocketAvailable;


/**
 * Reads the whole buffer 
 */
Abbozza.WebSocketReadAll = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.SERIAL"));
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
                .appendField(_("websocket.READ_ALL"));
        this.setInputsInline(false);
        this.setOutput(true, "STRING");
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    }
};

Blockly.Blocks['websocket_read_all'] = Abbozza.WebSocketReadAll;
