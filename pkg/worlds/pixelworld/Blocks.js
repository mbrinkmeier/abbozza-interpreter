/**
 * This block declares a variable of type Pixel.
 *   
 * @type type
 */
Abbozza.VariablePixel = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.pixel"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
        this.symbolType = "#PIXEL";
    }
};

Blockly.Blocks['pixel_var_pixel'] = Abbozza.VariablePixel;


/**
 * Create a new pixel.
 * 
 * @type type
 */
Abbozza.PixelNewPixel = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        var block = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("obj.new") + " " + _("pixel.pixel"));
        this.appendValueInput("X")
                .appendField("x: ")
                .setAlign(Blockly.ALIGN_RIGHT)
                .setCheck("NUMBER");
        this.appendValueInput("Y")
                .appendField("y: ")
                .setAlign(Blockly.ALIGN_RIGHT)
                .setCheck("NUMBER");
        this.setOutput(true, "#PIXEL");
        this.setInputsInline(true);
        this.setTooltip('');
    },

    execute: function (entry) {
        switch (entry.phase) {
            case 0 :
                AbbozzaInterpreter.callInput(this, "X", "NUMBER");
                entry.phase = 1;
                break;
            case 1 :
                entry._x_ = entry.callResult;
                AbbozzaInterpreter.callInput(this, "Y", "NUMBER");
                entry.phase = 2;
                break;
            case 2 :
                entry.returnValue = AbbozzaInterpreter.createObject("#PIXEL", new Pixel(entry._x_, entry.callResult));
                entry.finished();
        }
    }
};

Blockly.Blocks['pixel_new_pixel'] = Abbozza.PixelNewPixel;
AbbozzaCode['pixel_new_pixel'] = ['new Pixel(#,#)', ["V_X", "V_Y"]];


/**
 * This block declares a variable of type Pixel.
 *   
 * @type type
 */
Abbozza.VariableColor = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.color"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
        this.symbolType = "#COLOR";
    }
};

Blockly.Blocks['pixel_var_color'] = Abbozza.VariableColor;


/**
 * Create a new pixel.
 * 
 * @type type
 */
Abbozza.PixelNewColor = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        var block = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("obj.new") + " " + _("pixel.color"))
        this.appendValueInput("RED")
                .appendField(_("dev.red") + " :")
                .setAlign(Blockly.ALIGN_RIGHT)
                .setCheck("NUMBER");
        this.appendValueInput("GREEN")
                .appendField(_("dev.green") + " :")
                .setAlign(Blockly.ALIGN_RIGHT)
                .setCheck("NUMBER");
        this.appendValueInput("BLUE")
                .appendField(_("dev.blue") + " :")
                .setAlign(Blockly.ALIGN_RIGHT)
                .setCheck("NUMBER");
        this.setOutput(true, "#COLOR");
        this.setInputsInline(false);
        this.setTooltip('');
    },

    execute: function (entry) {
        switch (entry.phase) {
            case 0 :
                AbbozzaInterpreter.callInput(this, "RED", "NUMBER");
                entry.phase = 1;
                break;
            case 1 :
                entry._red_ = entry.callResult;
                AbbozzaInterpreter.callInput(this, "GREEN", "NUMBER");
                entry.phase = 2;
                break;
            case 2 :
                entry._green_ = entry.callResult;
                AbbozzaInterpreter.callInput(this, "BLUE", "NUMBER");
                entry.phase = 3;
                break;
            case 3 :
                entry.returnValue = AbbozzaInterpreter.createObject("#COLOR", new Color(entry._red_, entry._green_, entry.callResult));
                entry.finished();
        }
    }
};

Blockly.Blocks['pixel_new_color'] = Abbozza.PixelNewColor;
AbbozzaCode['pixel_new_color'] = ['new Color(#,#,#)', ["V_RED", "V_GREEN", "V_BLUE"]];

/**
 * Create a new pixel.
 * 
 * @type type
 */
Abbozza.PixelNewColorChoice = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        var block = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("obj.new") + " " + _("pixel.color"))
                .appendField(new Blockly.FieldColour("#000000"), "COLOR");
        this.setOutput(true, "#COLOR");
        this.setInputsInline(false);
        this.setTooltip('');
    },

    execute: function (entry) {
        switch (entry.phase) {
            case 0 :
                var color = this.getFieldValue("COLOR");
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
                var red = parseInt(result[1], 16);
                var green = parseInt(result[2], 16);
                var blue = parseInt(result[3], 16);
                entry.returnValue = AbbozzaInterpreter.createObject("#COLOR", new Color(red, green, blue));
                entry.finished();
        }
    }
};

Blockly.Blocks['pixel_new_color_choice'] = Abbozza.PixelNewColorChoice;
AbbozzaCode['pixel_new_color_choice'] = function (generator) {
    var color = generator.fieldToCode(this, "COLOR");

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    var red = parseInt(result[1], 16);
    var green = parseInt(result[2], 16);
    var blue = parseInt(result[3], 16);

    var code = "";
    var code = "";
    code = "new Color(" + red + "," + green + "," + blue + ")";

    return code;
}



/**
 * Set the coordinate of a pixel object
 * 
 * @type type
 */
Abbozza.PixelSetCoord = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(false);
        this.appendValueInput("VALUE")
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(__("var.set",0))
                .appendField(new VariableTypedDropdown(this, "#PIXEL", null, false), "PIXEL")
                .appendField(".")
                .appendField(new Blockly.FieldDropdown([["x","X"],["y","Y"]]), "COORD")
                .appendField(__("var.set",1))
                .setCheck(["NUMBER","DECIMAL"]);
        this.setTooltip('');
        this.setOutput(false);
    },
    execute: function (entry) {
        switch ( entry.phase ) {
            case 0 :
                AbbozzaInterpreter.callInput(this,"VALUE");
                entry.phase = 1;
                break;
            case 1 :
                var coord = this.getFieldValue("COORD");
                var name = this.getFieldValue("PIXEL");
                var reference = AbbozzaInterpreter.getSymbol(name);
                var pixel = AbbozzaInterpreter.getObjectValue(reference);
                if (pixel instanceof Pixel) {
                    if ( coord == "X" ) {
                        pixel.x = entry.callResult;
                    } else {
                        pixel.y = entry.callResult;                        
                    }
                } else {
                    ErrorMgr.addError(this,_("err.wrong_name"));
                    Abbozza.throwException(1, _("err.unknown_class"));
                }
                entry.finished();
        }
    }
}

Blockly.Blocks['pixel_set_coord'] = Abbozza.PixelSetCoord;
AbbozzaCode['pixel_set_coord'] = ['#.set#(#);', ["F_PIXEL", "F_COORD", "V_VALUE"]];

/**
 * Set the coordinate of a pixel object
 * 
 * @type type
 */
Abbozza.PixelGetCoord = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setInputsInline(false);
        this.appendDummyInput("VALUE")
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.get") )
                .appendField(new VariableTypedDropdown(this, "#PIXEL", null, false), "PIXEL")
                .appendField(".")
                .appendField(new Blockly.FieldDropdown([["x","X"],["y","Y"]]), "COORD");
        this.setTooltip('');
        this.setOutput(true,"NUMBER");
    },
    execute: function (entry) {
        switch ( entry.phase ) {
            case 0 :
                var coord = this.getFieldValue("COORD");
                var name = this.getFieldValue("PIXEL");
                var reference = AbbozzaInterpreter.getSymbol(name);
                var pixel = AbbozzaInterpreter.getObjectValue(reference);
                if (pixel instanceof Pixel) {
                    if ( coord == "X" ) {
                        entry.returnValue = pixel.getX();
                    } else {
                        entry.returnValue = pixel.getY();
                    }
                } else {
                    ErrorMgr.addError(this,_("err.wrong_name"));
                    Abbozza.throwException(1, _("err.unknown_class"));
                }
                entry.finished();
        }
    }
}

Blockly.Blocks['pixel_get_coord'] = Abbozza.PixelGetCoord;
AbbozzaCode['pixel_get_coord'] = ['#.get#()', ["F_PIXEL", "F_COORD"]];


/**
 * 
 * @type type
 */
Abbozza.PixelSetColorComp = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(false);
        this.appendValueInput("VALUE")
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(__("var.set",0))
                .appendField(new VariableTypedDropdown(this, "#COLOR", null, false), "COLOR")
                .appendField(".")
                .appendField(new Blockly.FieldDropdown([[_("dev.RED"), "Red"], [_("dev.GREEN"), "Green"], [_("dev.BLUE"), "Blue"]]), "COMP")
                .appendField(__("var.set",1))
                .setCheck(["NUMBER","DECIMAL"]);
        this.setTooltip('');
        this.setOutput(false);
    },
    execute: function (entry) {
        switch ( entry.phase ) {
            case 0 :
                AbbozzaInterpreter.callInput(this,"VALUE");
                entry.phase = 1;
                break;
            case 1 :
                var comp = this.getFieldValue("COMP");
                var name = this.getFieldValue("COLOR");
                var reference = AbbozzaInterpreter.getSymbol(name);
                var color = AbbozzaInterpreter.getObjectValue(reference);
                if (color instanceof Color) {
                    if ( comp == "Red" ) { 
                        color.red = entry.callResult;
                    } else if ( comp == "Green" ) {
                        color.green = entry.callResult;                        
                    } else {
                        color.blue = entry.callResult;                                                
                    }
                } else {
                    ErrorMgr.addError(this,_("err.wrong_name"));
                    Abbozza.throwException(1, _("err.unknown_class"));
                }
                entry.finished();
        }
    }
}

Blockly.Blocks['pixel_set_color_comp'] = Abbozza.PixelSetColorComp;
AbbozzaCode['pixel_set_color_comp'] = ['#.set#(#);', ["F_COLOR", "F_COMP", "V_VALUE"]];

/**
 * 
 * @type type
 */
Abbozza.PixelGetColorComp = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setInputsInline(false);
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.get"))
                .appendField(new VariableTypedDropdown(this, "#COLOR", null, false), "COLOR")
                .appendField(".")
                .appendField(new Blockly.FieldDropdown([[_("dev.RED"), "Red"], [_("dev.GREEN"), "Green"], [_("dev.BLUE"), "Blue"]]), "COMP");
        this.setTooltip('');
        this.setOutput(true,"NUMBER");
    },
    execute: function (entry) {
        switch ( entry.phase ) {
            case 0 :
                var comp = this.getFieldValue("COMP");
                var name = this.getFieldValue("COLOR");
                var reference = AbbozzaInterpreter.getSymbol(name);
                var color = AbbozzaInterpreter.getObjectValue(reference);
                if (color instanceof Color) {
                    if ( comp == "Red" ) { 
                        entry.returnValue = color.getRed();
                    } else if ( comp == "Green" ) {
                        entry.returnValue = color.getGreen();                       
                    } else {
                        entry.returnValue = color.getBlue();                                           
                    }
                } else {
                    ErrorMgr.addError(this,_("err.wrong_name"));
                    Abbozza.throwException(1, _("err.unknown_class"));
                }
                entry.finished();
        }
    }
}

Blockly.Blocks['pixel_get_color_comp'] = Abbozza.PixelGetColorComp;
AbbozzaCode['pixel_get_color_comp'] = ['#.get#()', ["F_COLOR", "F_COMP"]];

/**
 * 
 * @type type
 */
Abbozza.PixelSetColor = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(false);
        this.appendDummyInput("PIXEL")
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.set") + " " + _("pixel.pixel"))
                .appendField(new VariableTypedDropdown(this, "#PIXEL", null, false), "PIXEL")
                .appendField(_("pixel.to_color"))
                .appendField(new VariableTypedDropdown(this, "#COLOR", null, false), "COLOR");
        this.setTooltip('');
        this.setOutput(false);
    },
    execute: function (entry) {
        var name = this.getFieldValue("PIXEL");
        var reference = AbbozzaInterpreter.getSymbol(name);
        var pixel = AbbozzaInterpreter.getObjectValue(reference);
        name = this.getFieldValue("COLOR");
        reference = AbbozzaInterpreter.getSymbol(name);
        var color = AbbozzaInterpreter.getObjectValue(reference);
        if ((pixel instanceof Pixel) && (color instanceof Color)) {
            World.pixelworld.set(pixel,color);
        } else {
            ErrorMgr.addError(this,_("err.wrong_name"));
            Abbozza.throwException(1, _("err.unknown_class"));
        }
        entry.finished();
    }
}


Blockly.Blocks['pixel_set_color'] = Abbozza.PixelSetColor;
AbbozzaCode['pixel_set_color'] = ['#.setColor(#);', ["F_PIXEL", "F_COLOR"]];


/**
 * 
 * @type type
 */
Abbozza.PixelGetColor = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(false);
        this.appendDummyInput("PIXEL")
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.get") + " " + _("pixel.color"))
                .appendField(new VariableTypedDropdown(this, "#COLOR", null, false), "COLOR")
                .appendField(_("pixel.from") + " " + _("pixel.pixel"))
                .appendField(new VariableTypedDropdown(this, "#PIXEL", null, false), "PIXEL");
        this.setTooltip('');
        this.setOutput(false);
    },

    execute: function (entry) {
        var name = this.getFieldValue("PIXEL");
        var reference = AbbozzaInterpreter.getSymbol(name);
        var pixel = AbbozzaInterpreter.getObjectValue(reference);
        name = this.getFieldValue("COLOR");
        var colref = AbbozzaInterpreter.getSymbol(name);
        if ((pixel instanceof Pixel) && (color instanceof Color)) {
            AbbozzaInterpreter.setObjectValue(colref,pixel.getColor(pixel));
        } else {
            ErrorMgr.addError(this,_("err.wrong_name"));
            Abbozza.throwException(1, _("err.unknown_class"));
        }
        entry.finished();
    }
}

Blockly.Blocks['pixel_get_color'] = Abbozza.PixelGetColor;
AbbozzaCode['pixel_get_color'] = ['# = #.getColor();', ["V_COLOR","V_PIXEL"]];



/**
 * 
 * @type type
 */
Abbozza.PixelSetDrawColor = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(false);
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.set") + " " + _("pixel.draw_color"))
                .appendField(new VariableTypedDropdown(this, "#COLOR", null, false), "COLOR");
        this.setTooltip('');
        this.setOutput(false);
    },
    execute: function (entry) {
        var name = this.getFieldValue("COLOR");
        var reference = AbbozzaInterpreter.getSymbol(name);
        var color = AbbozzaInterpreter.getObjectValue(reference);
        if (color instanceof Color) {
            World.pixelworld.setDrawColor(color);
        } else {
            ErrorMgr.addError(this,_("err.wrong_name"));
            Abbozza.throwException(1, _("err.unknown_class"));
        }
        entry.finished();
    }
}

Blockly.Blocks['pixel_set_draw_color'] = Abbozza.PixelSetDrawColor;
AbbozzaCode['pixel_set_draw_color'] = ['setDrawColor(#);', ["F_COLOR"]];


/**
 * 
 * @type type
 */
Abbozza.PixelSet = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(true);
        this.appendValueInput("X")
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.set") + "x:")
                .setCheck("NUMBER");
        this.appendValueInput("Y")
                .appendField("Y:")
                .setCheck("NUMBER");
        this.appendValueInput("RED")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(_("dev.RED"))
                .setCheck("NUMBER");
        this.appendValueInput("GREEN")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(_("dev.GREEN"))
                .setCheck("NUMBER");
        this.appendValueInput("BLUE")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(_("dev.BLUE"))
                .setCheck("NUMBER");
        this.setTooltip('');
        this.setOutput(false);
    },

    execute: function (entry) {
        switch (entry.phase) {
            case 0 :
                AbbozzaInterpreter.callInput(this, "X", "NUMBER");
                entry.phase = 1;
                break;
            case 1 :
                entry._x_ = entry.callResult;
                AbbozzaInterpreter.callInput(this, "Y", "NUMBER");
                entry.phase = 2;
                break;
            case 2 :
                entry._y_ = entry.callResult;
                AbbozzaInterpreter.callInput(this, "RED", "NUMBER");
                entry.phase = 3;
                break;
            case 3 :
                entry._red_ = entry.callResult;
                AbbozzaInterpreter.callInput(this, "GREEN", "NUMBER");
                entry.phase = 4;
                break;
            case 4 :
                entry._green_ = entry.callResult;
                AbbozzaInterpreter.callInput(this, "BLUE", "NUMBER");
                entry.phase = 5;
                break;
            case 5 :
                entry._blue_ = entry.callResult;
                World.pixelworld.setPixel(entry._x_, entry._y_, entry._red_, entry._green_, entry._blue_);
                entry.finished();
        }
    }
}

Blockly.Blocks['pixel_set'] = Abbozza.PixelSet;
AbbozzaCode['pixel_set'] = ['setPixel(#,#,#,#,#);', ["V_X", "V_Y", "V_RED", "V_GREEN", "V_BLUE"]];


/**
 * Get the color components of a pixel
 */

Abbozza.PixelGet = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.PIXELWORLD"));
        this.setInputsInline(true);
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/pixelworld.png", 16, 16))
                .appendField(_("pixel.get"))
                .appendField(new Blockly.FieldDropdown([[_("dev.RED"), "Red"], [_("dev.GREEN"), "Green"], [_("dev.BLUE"), "Blue"]]), "COLOR");
        this.appendValueInput("X")
                .appendField("X:")
                .setCheck("NUMBER");
        this.appendValueInput("Y")
                .appendField("Y:")
                .setCheck("NUMBER");
        this.setTooltip('');
        this.setOutput(true, "NUMBER");
    },

    execute: function (entry) {
        switch (entry.phase) {
            case 0 :
                AbbozzaInterpreter.callInput(this, "X", "NUMBER");
                entry.phase = 1;
                break;
            case 1 :
                entry._x_ = entry.callResult;
                AbbozzaInterpreter.callInput(this, "Y", "NUMBER");
                entry.phase = 2;
                break;
            case 2 :
                entry._y_ = entry.callResult;
                var col = block.getFieldValue("COLOR");
                if (col == "Red") {
                    entry.returnValue = World.pixelworld.getPixelRed(entry._x_, entry._y_);
                } else if (col == "Green") {
                    entry.returnValue = World.pixelworld.getPixelGreen(entry._x_, entry._y_);
                } else {
                    entry.returnValue = World.pixelworld.getPixelBlue(entry._x_, entry._y_);
                }
                entry.finished();
        }
    }
}

Blockly.Blocks['pixel_get'] = Abbozza.PixelGet;
AbbozzaCode['pixel_get'] = ['getPixel#(#,#)', ["F_COLOR", "V_X", "V_Y"]];
