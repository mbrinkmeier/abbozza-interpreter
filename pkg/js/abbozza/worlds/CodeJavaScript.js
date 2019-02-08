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
 * @fileoverview This file defines the code generated by the blocks.
 * 
 * Each code template is given in the follwoing form
 * 
 * Abbozza.Code[type] = [ <template> , [ <arg1>, <arg2>, ...] ]
 *  
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */


/**
 * Code snippets for blocks
 */

AbbozzaCode = [];

/**
 * Conditionals
 */
AbbozzaCode['cond_if'] = ['if (#) {\n#\n}', ["V_CONDITION", "S_STATEMENTS"]];
AbbozzaCode['cond_if_else'] = ['if (#) {\n#\n} else {\n#\n}', ["V_CONDITION", "S_STATEMENTS1", "S_STATEMENTS2"]];


/**
 * Loops
 */
AbbozzaCode['loop_endless'] = ["while (true) {\n#\n}", ["S_STATEMENTS"]];
AbbozzaCode['loop_while'] = ["while (#) {\n#\n}", ["V_CONDITION", "S_STATEMENTS"]];
AbbozzaCode['loop_fixed'] = ["for (# __counter=0;__counter<#;__counter++) {\n#\n}", ["K_NUMBER", "V_COUNT", "S_STATEMENTS"]];
AbbozzaCode['loop_count'] = ["for (#=#;#<#;#=#+#) {\n#\n}", ["F_VAR", "V_FROM", "F_VAR", "V_TO", "F_VAR", "F_VAR", "V_STEP", "S_STATEMENTS"]];
// AbbozzaCode['loop_delay'] = ["abbozza.sleep(#);",["V_TIME"]];
// AbbozzaCode['loop_delay_millis'] = ["wait_ms(#);",["V_TIME"]];
// AbbozzaCode['loop_delay_micros'] = ["wait_us(#);",["V_TIME"]];
// AbbozzaCode['loop_delay_seconds'] = ["wait(#);",["V_TIME"]];
AbbozzaCode['loop_break'] = ["break;", []];

AbbozzaCode['loop_count_dir'] = ["for(#=#;###;#=#+#) {\n#\n}", ["F_VAR", "V_FROM", "F_VAR",
        function (generator) {
            var dir = generator.fieldToCode(this, "DIR");
            var rel = "<=";
            if (dir == "DESC") {
                rel = ">=";
            }
            return rel;
        }
        , "V_TO", "F_VAR", "F_VAR",
        function (generator) {
            var dir = generator.fieldToCode(this, "DIR");
            var step = "1";
            if (dir == "DESC") {
                step = "-1";
            }
            return step;
        },
        "S_STATEMENTS"
    ]];

AbbozzaCode['loop_count_dir_step'] = ["for(#=#;###;#=##) {\n#\n}", ["F_VAR", "V_FROM", "F_VAR",
        function (generator) {
            var dir = generator.fieldToCode(this, "DIR");
            var rel = "<=";
            if (dir == "DESC") {
                rel = ">=";
            }
            return rel;
        }
        , "V_TO", "F_VAR", "F_VAR",
        function (generator) {
            var dir = generator.fieldToCode(this, "DIR");
            var step = generator.valueToCode(this, "STEP");
            if (dir == "DESC") {
                step = "-" + step;
            } else {
                step = "+" + step;
            }
            return step;
        },
        "S_STATEMENTS"
    ]];

/**
 * Math
 */
AbbozzaCode['math_number'] = ["#", ["F_VALUE"]];
AbbozzaCode['math_decimal'] = ["#", ["F_VALUE"]];
AbbozzaCode['math_calc'] = ["#", [function (generator) {
            var left = generator.valueToCode(this, "LEFT");
            var right = generator.valueToCode(this, "RIGHT");
            var op = this.getFieldValue("OP");
            if (op == "POWER") {
                return "Math.pow(" + left + "," + right + ")";
            }
            return "(" + left + keyword(op) + right + ")";
        }]];
AbbozzaCode['math_round'] = ["#(#)", ["F_OP", "V_ARG"]];
AbbozzaCode['math_unary_x'] = ["#(#)", ["F_OP", "V_ARG"]];
// AbbozzaCode['math_binary'] = [ "#(#,#)", [ "F_OP", "V_FIRST", "V_SECOND" ]];
AbbozzaCode['math_random'] = ["abbozza.random(#+1)", ["V_MAX"]];
AbbozzaCode['math_random2'] = ["(abbozza.random((#+1)-#)+#)", ["V_MAX", "V_MIN", "V_MIN"]];
AbbozzaCode['math_randomseed'] = ["abbozza.seedRandom(#);", ["V_SEED"]];
AbbozzaCode['math_millis'] = ["abbozza.systemTime()", []];

AbbozzaCode['logic_const'] = ["#", ["F_NAME"]];
AbbozzaCode['logic_op'] = ["(# # #)", ["V_LEFT", "F_LOGOP", "V_RIGHT"]];
AbbozzaCode['logic_not'] = ["(!#)", ["V_ARG"]];
/* AbbozzaCode['logic_compare'] = [ "(# # #)" ,[ "V_LEFT", "F_OP" , 
 function(generator) {
 var vtype = generator.getTypeOfValue(this,"LEFT");
 var rtype = generator.getTypeOfValue(this,"RIGHT");
 var right;
 if ( rtype == vtype ) {
 right = generator.valueToCode(this,"RIGHT");
 } else {
 right = generator.valueToCode(this,"RIGHT",vtype);
 }
 var op = generator.fieldToCode(this,"OP");
 if ( (vtype == "STRING") && ( (op == "!=" ) || ( op == "<=" ) || ( op == ">=" ) )  ) {
 ErrorMgr.addError(this,_("err.COMPARISON_NOT_ALLOWED"));
 }
 return right;
 }]]; */

AbbozzaCode['logic_compare'] =
        function (generator) {
            var left = generator.valueToCode(this, "LEFT");
            var op = generator.fieldToCode(this, "OP");

            var vtype = generator.getTypeOfValue(this, "LEFT");
            var rtype = generator.getTypeOfValue(this, "RIGHT");

            var right;
            if (rtype == vtype) {
                right = generator.valueToCode(this, "RIGHT");
            } else {
                right = generator.valueToCode(this, "RIGHT", vtype);
            }

            if (vtype == "STRING") {
                if (op == "!=") {
                    op = "==";
                    return "!(" + left + " " + op + " " + right + ")";
                } else if (op == "<=") {
                    op = ">";
                    return "!(" + left + " " + op + " " + right + ")";
                } else if (op == ">=") {
                    op = "<";
                    return "!(" + left + " " + op + " " + right + ")";
                } else {
                    return "(" + left + " " + op + " " + right + ")";
                }
            } else {
                return "(" + left + " " + op + " " + right + ")";
            }
        };


AbbozzaCode['text_const'] = ["#", [
        function (generator) {
            var content = this.getFieldValue("CONTENT");
            return goog.string.quote(content);
        }
    ]];
AbbozzaCode['text_charat'] = ["String(#).charAt(#)", ["V_TEXT", "V_POS"]];
AbbozzaCode['text_concat'] = ["#+#", ["V_TEXT1", "V_TEXT2"]];
AbbozzaCode['text_from_number'] = ["String(#)", ["V_VALUE"]];
AbbozzaCode['text_from_ascii'] = ["String.fromCharCode(#)", ["V_VALUE"]];
AbbozzaCode['ascii_from_text'] = ["#.charCodeAt(0)", ["V_TEXT"]];
AbbozzaCode['ascii_from_text_pos'] = ["#.charCodeAt(#)", ["V_TEXT", "V_POS"]];
// AbbozzaCode['text_length'] = ["ManagedString(#).length()",["V_TEXT"]];
// AbbozzaCode['text_substring'] = ["ManagedString(#).substring(#,#-#+1)",["V_TEXT","V_FROM","V_TO","V_FROM"]];
AbbozzaCode['text_length'] = ["#.length", ["V_TEXT"]];
AbbozzaCode['text_substring'] = ["#.substring(#,#-#+1)", ["V_TEXT", "V_FROM", "V_TO", "V_FROM"]];
AbbozzaCode['text_is_empty'] = ["( # == \"\" )", ["V_TEXT"]];
AbbozzaCode['text_to_number'] = ["Number(#)", ["V_TEXT"]];
AbbozzaCode['text_to_decimal'] = ["Number(#)", ["V_TEXT"]];

AbbozzaCode['var_block'] = function (generator) {
    this.getSymbol();
    var code = "";
    var name = generator.fieldToCode(this, "NAME");
    if (name == _("default.NAME")) {
        ErrorMgr.addError(this, _("err.NOVARIABLE"));
    }

    var symbols = this.getRootBlock().symbols;
    var symbol = symbols.exists(name);
    if (!symbol || ((symbol[3] != symbols.VAR_SYMBOL) && (symbol[3] != symbols.PAR_SYMBOL))) {
        ErrorMgr.addError(this, _("err.WRONG_NAME") + ": " + name);
    }

    var block;

    code = name;
    var no = 0;
    var index;
    while (this.getInput("DIM" + no)) {
        index = generator.valueToCode(this, 'DIM' + no);
        code = code + "[" + index + "]";
        no++;
    }
    return code;
}
AbbozzaCode['var_assign'] = ["# = #;", ["V_LEFT", "V_RIGHT"]];

// Functions
AbbozzaCode['func_decl'] = function (generator) {
    var name = this.name;
    if (name == _("default.NAME")) {
        ErrorMgr.addError(this, _("err.WRONG_NAME") + ": " + name);
    }

    var symbols = this.getRootBlock().symbols;
    var symbol = symbols.exists(name);
    if (!symbol || ((symbol[3] != symbols.FUN_SYMBOL) && (symbol[3] != symbols.ISR_SYMBOL))) {
        ErrorMgr.addError(this, _("err.WRONG_NAME") + ": " + name);
    }

    var statements = generator.statementToCode(this, 'STATEMENTS', "   ");

    var code = "\n";

    var sig = "function " + this.name + "(";
    var spaces = "";
    for (var j = 0; j < sig.length - 1; j++)
        spaces = spaces + " ";
    code = code + sig;

    var pars = generator.parametersToCode(this.symbols, spaces);

    code = code + pars + "{\n";
    code = code + generator.variablesToCode(this.symbols, "   ");
    code = code + statements;

    if (this.getInput("RETURN")) {
        var returncode = generator.valueToCode(this, "RETURN");
        code = code + "\n   return " + returncode + ";";
    }
    code = code + "\n}\n\n";
    return code;
};


AbbozzaCode['func_call'] = function (generator) {
    var code = "";
    var name = generator.fieldToCode(this, "NAME");

    var symbols = this.getRootBlock().symbols;
    var symbol = symbols.exists(name);
    if (!symbol || ((symbol[3] != symbols.FUN_SYMBOL) && (symbol[3] != symbols.ISR_SYMBOL))) {
        ErrorMgr.addError(this, _("err.WRONG_NAME") + ": " + name);
    }

    var block;

    code = name + "(";
    var no = 0;
    var par;
    var inp;
    while (inp = this.getInput("PAR" + no)) {
        if (inp.type == Blockly.INPUT_VALUE) {
            par = generator.valueToCode(this, "PAR" + no);
            if (no != 0)
                code = code + ",";
            code = code + par;
        }
        no++;
    }
    code = code + ")";

    if (symbol[1] == "VOID") {
        code = code + ";";
    }

    return code;
};

AbbozzaCode['func_return'] = function (generator) {
    var code = "";
    var result = "";
    var root = this.getRootBlock();
    if (root && root.rettype && root.rettype != "VOID") {
        result = " " + generator.valueToCode(this, "VALUE");
    }
    code = code + "return" + result + ";";
    if (this.getRootBlock()) {
        var root = this.getRootBlock();
        if (root.type == "main") {
            // Ignore the return statement if in main block
            code = "";
        }
    }
    return code;
};


AbbozzaCode['stack_new'] = ["new Stack()",[]];
AbbozzaCode['stack_is_empty'] = ["#.isEmpty()",["F_NAME"]];
AbbozzaCode['stack_push'] = ["#.push(#);",["F_NAME","V_VALUE"]];
AbbozzaCode['stack_pop'] = ["#.pop()",["F_NAME"]];
AbbozzaCode['stack_top'] = ["#.top()",["F_NAME"]];

AbbozzaCode['queue_new'] = ["new Queue()",[]];
AbbozzaCode['queue_is_empty'] = ["#.isEmpty()",["F_NAME"]];
AbbozzaCode['queue_enqueue'] = ["#.enqueue(#);",["F_NAME","V_VALUE"]];
AbbozzaCode['queue_dequeue'] = ["#.dequeue()",["F_NAME"]];
AbbozzaCode['queue_head'] = ["#.head()",["F_NAME"]];

AbbozzaCode['list_new'] = ["new List()",[]];
AbbozzaCode['list_is_empty'] = ["#.isEmpty()",["F_NAME"]];
AbbozzaCode['list_get_item'] = ["#.getItem(#)",["F_NAME","V_INDEX"]];
AbbozzaCode['list_append'] =  ["#.append(#);",["F_NAME","V_VALUE"]];
AbbozzaCode['list_insert_at'] =  ["#.insertAt(#,#);",["F_NAME","V_INDEX","V_VALUE"]];
AbbozzaCode['list_set_item'] =  ["#.setItem(#,#);",["F_NAME","V_INDEX","V_VALUE"]];
AbbozzaCode['list_delete'] =  ["#.delete(#);",["F_NAME","V_INDEX"]];
AbbozzaCode['list_get_length'] = ["#.getLength()",["F_NAME"]];

AbbozzaCode['bintree_new'] = ["new BinTree(#)",["V_VALUE"]];
AbbozzaCode['bintree_has'] = ["#.has#()",["F_NAME","F_FUNC"]];
AbbozzaCode['bintree_get'] = ["#.get#()",["F_NAME","F_FUNC"]];
AbbozzaCode['bintree_set'] = ["#.set#();",["F_NAME","F_FUNC"]];
AbbozzaCode['bintree_del'] = ["#.delete#();",["F_NAME","F_FUNC"]];
AbbozzaCode['bintree_set_data'] = ["#.setData(#);",["F_NAME","V_VALUE"]];
AbbozzaCode['bintree_get_data'] = ["#.getData()",["F_NAME"]];
AbbozzaCode['bintree_is_leaf'] = ["#.isLeaf()",["F_NAME"]];

AbbozzaCode['websocket_open'] = ["WSopen('#');",["F_URL"]];
AbbozzaCode['websocket_close'] = ["WSclose();",[]];
AbbozzaCode['websocket_available'] = ["WSisAvailable()",[]];
AbbozzaCode['websocket_println'] = ["WSsend(#);",["V_VALUE"]];
AbbozzaCode['websocket_readln'] = ["WSreadln()",[]];
AbbozzaCode['websocket_read_all'] = ["WSreadAll()",[]];
AbbozzaCode['websocket_write_byte'] = ["WSsendByte(#);",["V_VALUE"]];
AbbozzaCode['websocket_read_byte'] = ["WSreadByte()",[]];