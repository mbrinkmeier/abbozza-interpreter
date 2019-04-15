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


Abbozza.Main = {
    title: "<title>",
    symbols: null,
    // test: "",

    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.CTRL"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.appendDummyInput().appendField(_("block.MAIN"));
        this.appendStatementInput("STATEMENTS")
                .setCheck("STATEMENT");
        this.setTooltip('');
        this.setMutator(new DynamicMutator( Configuration.getVariableBlocks ));
        this.setDeletable(false);
        this.data = "main";
    },

    setSymbolDB: function (db) {
        this.symbols = db;
    },

    setTitle: function (title) {},

    compose: function (topBlock) {
        Abbozza.composeSymbols(topBlock, this);
    },

    decompose: function (workspace) {
        return Abbozza.decomposeSymbols(workspace, this, _("GLOBALVARS"), false);
    },

    generateSetupCode: function (generator) {
        return "";
    },

    generateCode: function (generator) {

        // Generate code for global variables
        var code = "";
        var var_code = generator.variablesToCode(this.symbols, "");

        if (var_code != "") {
            code = code + var_code + "\n";
        }
        generator.globalVarCode = code;
        
        // Generate the statements of the main program
        var statements = generator.statementToCode(this, 'STATEMENTS', "");

        code = "";
        code = code + "int main() {\n";
        code = code + "   abbozza.init();\n";
        code = code + "###inithook###\n\n";
        code = code + statements;
 
        code = code + "\n\n   release_fiber();\n";
        code = code + "}\n";
                
        // return code;
        return statements;
    },

    check: function (block) {
        return "Test";
    },

    mutationToDom: function () {
        // Abbozza.log("variables to Dom")
        var mutation = document.createElement('mutation');
        var title = document.createElement('title');
        title.appendChild(document.createTextNode(this.title));
        mutation.appendChild(title);
        if (this.symbols)
            mutation.appendChild(this.symbols.toDOM());
        // Abbozza.log(mutation);
        return mutation;
    },

    domToMutation: function (xmlElement) {
        var child;
        // Abbozza.log("variables from Dom")
        for (var i = 0; i < xmlElement.childNodes.length; i++) {
            child = xmlElement.childNodes[i];
            // Abbozza.log(child);
            if (child.tagName == 'symbols') {
                if (this.symbols == null) {
                    this.setSymbolDB(new SymbolDB(null, this));
                }
                this.symbols.fromDOM(child);
                // Abbozza.log(this.symbols);
            } else if (child.tagName == 'title') {
                // Abbozza.log("title : " + child.textContent);
                this.setTitle(child.textContent);
            }
        }
    },
    
    execute: function(entry) {
        if ( entry.phase == 0 ) {
    
            // Prepare the global variables!!!            
            var variables = this.symbols.getVariables(true);
            for (var i = 0; i < variables.length; i++) {
                var variable = variables[i];
                AbbozzaInterpreter.setGlobalSymbol(variable[0],AbbozzaInterpreter.getDefaultValue(variable[1],variable[2]));
            }
            
            if ( AbbozzaInterpreter.callStatement(this,"STATEMENTS") ) {
                entry.phase = 1;
            } else {
                entry.finished();
            }
        } else {
            entry.finished();
        }
        return true;
    }

};


Blockly.Blocks['main'] = Abbozza.Main;



/**
 * Block for the definition of local variables, parameters and return type
 */
Abbozza.FunctionDeclControl = {
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getColor("cat.FUNC"));
        this.appendDummyInput()
                .appendField(_("func.NAME"))
                .appendField(new FieldNameInput("<name>", Abbozza.globalSymbols, Abbozza.globalSymbols.FUN_SYMBOL), "NAME");
        this.appendDummyInput()
                .appendField(_("func.RETURNTYPE"))
                .appendField(new Blockly.FieldDropdown(Abbozza.Generator.typeList), "TYPE");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(_("func.PARAMETER"));
        this.appendStatementInput("PARS").setCheck("VAR_DECL");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(_("LOCALVARS"));
        this.appendStatementInput("VARS").setCheck("VAR_DECL");
        this.setTooltip('');
    },
    setTitle: function (title) {
    }

};

Blockly.Blocks['func_decl_control'] = Abbozza.FunctionDeclControl;




Abbozza.VariableDeclControl = {
    // variables: null,
    title: "",
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        this.appendDummyInput().appendField(this.title, "TITLE");
        this.appendStatementInput("VARS")
                .setCheck("VAR_DECL");
        this.setTooltip('');
    },
    setTitle: function (title) {
        this.title = title;
        this.getField("TITLE").setText(title);
    }
};

Blockly.Blocks['devices_control'] = Abbozza.VariableDeclControl;
Blockly.Blocks['var_control'] = Abbozza.VariableDeclControl;


/*
**
** THREADS
**
**/


/**
 * Start Thread
 */
Abbozza.FunctionStartThread = {
    callLabel: null,
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getColor("cat.FUNC"));
        var thisBlock = this;
        this.callLabel = new Blockly.FieldLabel(__("func.START_THREAD", 0));
        this.callLabel2 = new Blockly.FieldLabel(__("func.START_THREAD", 1));
        this.appendDummyInput("INP")
                .appendField(this.callLabel)
                .appendField(new FunctionDropdown(this, function(entry) {
                    thisBlock.refitInputs(entry);
                }), "NAME")
                .appendField(this.callLabel2);
        this.setInputsInline(true);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    onchange: function () {
        var name = this.getFieldValue("NAME");
        // this.refitInputs(name);
    },
    refitInputs: function(name) {
        var symbol = Abbozza.getGlobalSymbol(name);

        if (symbol == null)
            return;

        var no = Abbozza.deleteInputs(this, "PAR");

        var funcBlock = Abbozza.getTopBlock(name);
        if (name == null)
            return;

        if (funcBlock.symbols == null)
            return;

        var parameters = funcBlock.symbols.getParameters(true);
        var inp;

        var localeEntry = "func.START_THREAD";

        this.callLabel.setText(__(localeEntry, 0));
        if (parameters.length == 0) {
            this.setInputsInline(true);
        } else {
            this.setInputsInline(false);
            for (no = 0; no < parameters.length; no++) {
                inp = this.appendValueInput("PAR" + no)
                        .setCheck([parameters[no][1]])
                        .appendField(parameters[no][0])
                        .setAlign(Blockly.ALIGN_RIGHT);
            }
        }

        // Threads ignore return values
        if (this.outputConnection != null) {
            // had output
            this.unplug(true, true);
            this.setOutput(false, "STATEMENT");
            this.setPreviousStatement(true, "STATEMENT");
            this.setNextStatement(true, "STATEMENT");
        }

    },
    mutationToDom: function () {
        var mutation = document.createElement('mutation');
        var name = this.getFieldValue("NAME");
        mutation.setAttribute("name", name);

        // Write parameters to DOM
        var symbol = Abbozza.getGlobalSymbol(name);

        if (symbol == null) {
            mutation.setAttribute("type", "VOID");
            return mutation;
        }

        var no = 0;

        var funcBlock = Abbozza.getTopBlock(name);
        if (name == null)
            return;

        var parameters = funcBlock.symbols.getParameters(true);
        var el;
        var t;

        for (no = 0; no < parameters.length; no++) {
            el = document.createElement("par");
            el.setAttribute("type", parameters[no][1]);
            el.setAttribute("name", parameters[no][0])
            mutation.appendChild(el);
        }

        mutation.setAttribute("type", symbol[1]);

        return mutation;
    },
    domToMutation: function (xmlElement) {
        var name = xmlElement.getAttribute("name");
        var type = xmlElement.getAttribute("type");

        var parameters = xmlElement.getElementsByTagName("par");
        var inp;

        var no = Abbozza.deleteInputs(this, "PAR");

        var localeEntry = "func.START_THREAD";

        this.callLabel.setText(__(localeEntry, 0));

        if (parameters[0] == null) {
            this.setInputsInline(true);
        } else {
            no = 0;
            while (parameters[no]) {
                this.setInputsInline(false);
                inp = this.appendValueInput("PAR" + no).
                        setCheck([parameters[no].getAttribute("type")]);
                inp.appendField(parameters[no].getAttribute("name"));
                inp.setAlign(Blockly.ALIGN_RIGHT);
                no++;
            }
            // this.appendDummyInput("PAR" + no).appendField(") " + __(localeEntry, 1));
        }

        // Threads ignore return values.
        this.setOutput(false, "STATEMENT");
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
    }
};

Blockly.Blocks['func_start_thread'] = Abbozza.FunctionStartThread;



/**
 * Start Thread
 */
Abbozza.FunctionStartThreadId = {
    callLabel: null,
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getColor("cat.FUNC"));
        var thisBlock = this;
        this.callLabel = new Blockly.FieldLabel(__("func.START_THREAD", 0));
        this.callLabel2 = new Blockly.FieldLabel(__("func.START_THREAD", 1));
        this.appendDummyInput("INP")
                .appendField(this.callLabel)
                .appendField(new FunctionDropdown(this, function(entry) {
                    thisBlock.refitInputs(entry);
                }), "NAME")
                .appendField(this.callLabel2);
        this.setInputsInline(true);
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setOutput(true,"NUMBER");
        this.setTooltip('');
    },
    onchange: function () {
        var name = this.getFieldValue("NAME");
        // this.refitInputs(name);
    },
    refitInputs: function(name) {
        var symbol = Abbozza.getGlobalSymbol(name);

        if (symbol == null)
            return;

        var no = Abbozza.deleteInputs(this, "PAR");

        var funcBlock = Abbozza.getTopBlock(name);
        if (name == null)
            return;

        if (funcBlock.symbols == null)
            return;

        var parameters = funcBlock.symbols.getParameters(true);
        var inp;

        var localeEntry = "func.START_THREAD";

        this.callLabel.setText(__(localeEntry, 0));
        if (parameters.length == 0) {
            this.setInputsInline(true);
        } else {
            this.setInputsInline(false);
            for (no = 0; no < parameters.length; no++) {
                inp = this.appendValueInput("PAR" + no)
                        .setCheck([parameters[no][1]])
                        .appendField(parameters[no][0])
                        .setAlign(Blockly.ALIGN_RIGHT);
            }
        }
    },
    mutationToDom: function () {
        var mutation = document.createElement('mutation');
        var name = this.getFieldValue("NAME");
        mutation.setAttribute("name", name);

        // Write parameters to DOM
        var symbol = Abbozza.getGlobalSymbol(name);

        if (symbol == null) {
            mutation.setAttribute("type", "VOID");
            return mutation;
        }

        var no = 0;

        var funcBlock = Abbozza.getTopBlock(name);
        if (name == null)
            return;

        var parameters = funcBlock.symbols.getParameters(true);
        var el;
        var t;

        for (no = 0; no < parameters.length; no++) {
            el = document.createElement("par");
            el.setAttribute("type", parameters[no][1]);
            el.setAttribute("name", parameters[no][0])
            mutation.appendChild(el);
        }

        mutation.setAttribute("type", symbol[1]);

        return mutation;
    },
    domToMutation: function (xmlElement) {
        var name = xmlElement.getAttribute("name");
        var type = xmlElement.getAttribute("type");

        var parameters = xmlElement.getElementsByTagName("par");
        var inp;

        var no = Abbozza.deleteInputs(this, "PAR");

        var localeEntry = "func.START_THREAD";

        this.callLabel.setText(__(localeEntry, 0));

        if (parameters[0] == null) {
            this.setInputsInline(true);
        } else {
            no = 0;
            while (parameters[no]) {
                this.setInputsInline(false);
                inp = this.appendValueInput("PAR" + no).
                        setCheck([parameters[no].getAttribute("type")]);
                inp.appendField(parameters[no].getAttribute("name"));
                inp.setAlign(Blockly.ALIGN_RIGHT);
                no++;
            }
            // this.appendDummyInput("PAR" + no).appendField(") " + __(localeEntry, 1));
        }
    }
};

Blockly.Blocks['func_start_thread_id'] = Abbozza.FunctionStartThreadId;


Abbozza.FunctionThreadRunning =  {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.FUNC"));
    this.appendValueInput("ID").setCheck("NUMBER")
        .appendField(__("func.thread_running",0));
    this.appendDummyInput()
        .appendField(__("func.thread_running",1));
    this.setInputsInline(true);
    this.setOutput(true,["BOOLEAN"]);
    this.setTooltip('');
  }
};

Blockly.Blocks['func_thread_running'] = Abbozza.FunctionThreadRunning;


Abbozza.FunctionWaitForThread =  {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.FUNC"));
    this.appendValueInput("ID").setCheck("NUMBER")
        .appendField(_("func.wait_for_thread"));
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
};

Blockly.Blocks['func_wait_for_thread'] = Abbozza.FunctionWaitForThread;


Abbozza.FunctionSyncThread =  {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.FUNC"));
    this.appendValueInput("ID").setCheck("NUMBER")
        .appendField(_("func.sync_thread"));
    this.setInputsInline(true);
    this.setOutput(false);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
};

Blockly.Blocks['func_sync_thread'] = Abbozza.FunctionSyncThread;


Abbozza.FunctionMainThread =  {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.FUNC"));
    this.appendDummyInput().appendField(_("block.MAIN"));
    this.setInputsInline(true);
    this.setOutput(true,"NUMBER");
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  }
};

Blockly.Blocks['func_main_thread'] = Abbozza.FunctionMainThread;
