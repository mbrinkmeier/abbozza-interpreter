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
 * @fileoverview The Code Generator of Abbozza.
 * 
 * It provides several methods for the generation of code from
 * the blocks.
 * 
 * It allows to add erros, which are diaplayed by icons.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * Each value block has to have at most one of the following types:
 * "NUMBER", "STRING", "DECIMAL, "BOOLEAN"
 * 
 * Each block can have the following types in addition:
 * "VAR"
 * 
 * Plug types
 * "ARR_DIM", "VAR_DECL"
 */

/**
 * Definition of the dictionary of reserved words
 */
ReservedWords.list = ",abbozza,calliope,if,else,for,switch,case,while,do,break,continue,return,goto," +
        "#define,#include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,LED_BUILTIN,true,false," +
        "void,boolean,char,unsigned,byte,int,word,long,short,float,double,string,String,unit8_t," +
        "sizeof,PROGMEM,accelerometer,display,sleep,wait_ms,compass,ManagedString," +
        "MicroBitEvent,MicroBitImage,PocketBuffer,MicroBitI2C,MicroBitStorage,MicroBitSerial," +
        "MicroBit," +
        "Keyboard.releaseAll,Keyboard.write";


/**
 * This operation is the entry point for code generation.
 * It Iterates through the top blocks of the workspace, generates their
 * code and combines it. In addition it adds libraries and additional
 * required statements not directly generated. 
 */

AbbozzaGenerator.prototype.initGenerator_ = function() {
    this.serialRequired = false;
    this.serialParserRequired = false;
    this.parserRequired = false;
    this.startMonitor = false;

    // Sets the flag for the radio
    this.radioRequired = false;
    
    // The counter for user defined images
    this.imageCounter = 0;    
}

/**
 * This operation checks the varios generation options and adds
 * code as needed.
 * 
 * @returns {undefined}
 */
AbbozzaGenerator.prototype.checkOptions_ = function() {}

AbbozzaGenerator.prototype.workspaceToCode_ = function (opt_workspace) {
    return code;
};


/**
 * Prepend the generated code with a general
 * comment, required libraries and pre setup code.
 * 
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
AbbozzaGenerator.prototype.finish = function (code) {
    return code;
};


/**
 * Generates a string for a symbol of the form
 * <type> <name><arraydim> \t //<comment>
 */
AbbozzaGenerator.prototype.symbolToCode = function (symbol) {
    var name = symbol[0];
    var type = symbol[1];
    var len = symbol[2];
    var code = "";

    var code = "var " + name + Abbozza.lenAsString(len);

    return code;
}


/**
 * Generates the list of variables in the symbolDB of the form
 * <type> <name><dimension>;
 * <type> <name><dimension>;
 * ...
 */
AbbozzaGenerator.prototype.variablesToCode = function (symbols, prefix) {
    var code = "";
    var variables = symbols.getVariables(true);
    for (var i = 0; i < variables.length; i++) {
        var entry = variables[i];
        code = code + prefix + this.symbolToCode(entry) + ";";
        if ((entry[4] != "") && (entry[4] != null))
            code = code + "\t// " + entry[4].replace(/\n/g, " ");
        code = code + "\n";
    }
    return code;
}

/**
 * Generates a list of parameters for functions.
 */
AbbozzaGenerator.prototype.parametersToCode = function (symbols, prefix) {
    var parameters = symbols.getParameters(true);
    var pars = "";
    var entry;

    if (parameters.length > 0) {
        entry = parameters[0];
        pars = " " + entry[0];
        if (entry[4] != null && entry[4] != "") {
            pars = pars + "\t// " + entry[4].replace(/\n/g, " ");
        }
        for (var i = 1; i < parameters.length; i++) {
            entry = parameters[i];
            pars = pars + ",\n" + prefix + "  " + entry[0];
            if (entry[4] != null && entry[4] != "") {
                pars = pars + "\t// " + entry[4].replace(/\n/g, " ");
            }
        }
        pars = pars + " ) ";
    } else {
        pars = ") ";
    }

    return pars;
}



/**
 * This operation adds a type cast to the given code.
 */
AbbozzaGenerator.prototype.enforceType = function (code, enfType, origType) {
    switch (enfType) {
        case "NUMBER":
            code = "Number(" + code + ")";
            break;
        case "TEXT":
        case "STRING":
            code = "String(" + code + ")";
            break;
        case "DECIMAL":
            code = "Number(" + code + ")";
            break;
        case "BOOLEAN":
            code = "Boolean(" + code + ")";
            break;
    }
    return code;
}


/**
 * The keywords for abbozza! labels
 */
__keywords = [
    ["VOID", "void"],
    ["NUMBER", "var"],
    ["STRING", "var"],
    ["DECIMAL", "var"],
    ["BOOLEAN", "var"],
    ["TRUE", "true"],
    ["FALSE", "false"],
    ["AND", "and"],
    ["OR", "or"],
    ["EQUALS", "=="],
    ["INEQUAL", "!="],
    ["LESS", "<"],
    ["LESSEQ", "<="],
    ["GREATER", ">"],
    ["GREATEREQ", ">="],
    ["ROUND", "Math.round"],
    ["FLOOR", "Math.floor"],
    ["CEIL", "Math.ceil"],
    ["ABS", "Math.fabs"],
    ["SQRT", "Math.sqrt"],
    ["SIN", "Math.sin"],
    ["COS", "Math.cos"],
    ["TAN", "Math.tan"],
    ["ASIN", "Math.asin"],
    ["ACOS", "Math.acos"],
    ["ATAN", "Math.atan"],
    ["MIN", "Math.min"],
    ["MAX", "Math.max"],
    ["PLUS", "+"],
    ["MINUS", "-"],
    ["MULT", "*"],
    ["DIV", "/"],
    ["MOD", "%"],
    ["POWER", "**"],
    ["HIGH","1"],
    ["LOW","0"]
];
__dict = __keywords;
