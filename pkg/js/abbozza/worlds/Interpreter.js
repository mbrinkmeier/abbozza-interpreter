/**
 * The static object for the Interpreter
 * 
 */


var AbbozzaInterpreter = {
    mode : 0,
    delay : 1,
    worker : null,
    hilightedBlock : null,
    localSymbols : [],
    globalSymbols : [],
    exec: [],
    breakLoop: false,
    
    execStack : []
};


AbbozzaInterpreter.MODE_STOPPED  = 0;
AbbozzaInterpreter.MODE_RUNNING  = 1;
AbbozzaInterpreter.MODE_PAUSED = 2;
AbbozzaInterpreter.MODE_TERMINATED = 3;
AbbozzaInterpreter.MODE_ABORTED = 4;


AbbozzaInterpreter.init = function() {
    this.mode = this.MODE_STOPPED;
 
};

/**
 * The Step button is pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.step = function() {
    if ( (this.mode == this.MODE_TERMINATED) || (this.mode == this.MODE_ABORTED) ) {
        // Empty execution stack 
        this.execStack = [];
        // Go to mode STOPPED to start new execution
        this.mode = this.MODE_STOPPED;
    }
    this.executeStep();
    this.mode = this.MODE_PAUSED;
}

/**
 * Th run button is pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.run = function() {
    if ( this.mode == this.MODE_RUNNING ) {
        this.mode = this.MODE_PAUSED;
        return;
    }
    if ( (this.mode == this.MODE_TERMINATED) || (this.mode == this.MODE_ABORTED) ) {
       this.execStack = [];
       this.mode = this.MODE_STOPPED;
       this.executeStep();
    }
    this.mode = this.MODE_RUNNING;
    this.worker = window.setTimeout( AbbozzaInterpreter.doStep , this.delay );
};

/**
 * The Stop button is pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.stop = function() {
    // Immediately abort the execution and wait for a step
    this.mode = this.MODE_ABORTED;
    this.execStack = [];
    var newEvent = new CustomEvent("abz_aborted");
};
  
/**
 * This operation is executed by a timer to repeatedly execute steps.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.doStep = function() {
    AbbozzaInterpreter.executeStep();
    // If RUNNING automatically execute the next step
    if ( AbbozzaInterpreter.mode == AbbozzaInterpreter.MODE_RUNNING )
        window.setTimeout(AbbozzaInterpreter.doStep , this.delay);
}


/**
 * Execute ONE step
 * 
 * @returns {undefined}
 */  
AbbozzaInterpreter.executeStep = function() {
    
    // If the execution stack is empty, and the mode is STOPPED, add the main 
    // block to start the execution
    var newEntry;
    if ( (this.execStack.length == 0) && (this.mode == this.MODE_STOPPED) ) {
        ErrorMgr.clearErrors();
        if ( World.getStartBlock ) {
            // Ask the world for Start block is any is provided
            newEntry = new ExecStackEntry(World.getStartBlock(),true);
            this.execStack.push(newEntry);
        } else {
            // Take the main block
            var workspace = Blockly.mainWorkspace;
            var topBlocks = workspace.getTopBlocks(true);
            for (var i = 0; i < topBlocks.length; i++) {
                var block = topBlocks[i];
                if (block.type.startsWith("main")) {
                    // The main block
                    newEntry = new ExecStackEntry(block,true);
                    this.execStack.push(newEntry);
                }
            }
        }
    }
       
    // If the execution stack is empty, the status becomes TERMINATED
    if ( this.execStack.length == 0) {
        this.terminating();
        return;
    }
    
    // Execute the top block
    var topEntry = this.execStack[this.execStack.length-1];
    if (topEntry) { 
        var newEvent = new CustomEvent("abz_step");
        document.dispatchEvent(newEvent);
        if ( (this.highlightedBlock != null) && (this.highlightedBlock != topEntry.block) ) {
            this.highlightedBlock.setHighlighted(false);
        }
        this.highlightedBlock = topEntry.block;
        this.highlightedBlock.setHighlighted(true);
        
        if ( topEntry.phase >= 0 ) topEntry.execute();
        
        // After execution, check if block is finished
        if ( topEntry.phase < 0 ) {
            // Remove entry from execution stack
            AbbozzaInterpreter.execStack.pop();
       
            if ( topEntry.isStatement == false ) {
                // If it has a return value, take it and insert it as callResult into new top
                var newTop = AbbozzaInterpreter.execStack[AbbozzaInterpreter.execStack.length-1];
                if ( newTop ) {
                    newTop.callResult = topEntry.returnValue;
                }
            } else {
                // Execute the next statement
                var nextBlock = topEntry.block.getNextBlock();
                if ( nextBlock ) {
                    var newEntry = new ExecStackEntry(nextBlock,true);
                    AbbozzaInterpreter.execStack.push(newEntry);
                }
            }
            topEntry = this.execStack[this.execStack.length-1];
        }
        
    } else {
        // Remove empty entry
        this.execStack.pop();
    }
    
    // Terminate if the stack is empty
    if ( this.execStack.length == 0 ) {
        this.terminating();
    } 
};


/**
 * This operation is called if the execution is terminating.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.terminating = function() {
    // window.clearInterval(this.worker);    

    if ( this.mode != this.MODE_ABORTED ) {
        var newEvent = new CustomEvent("abz_terminated");
        document.dispatchEvent(newEvent);
        this.mode = this.MODE_TERMINATED;
        alert("Execution finished!");
    } else {
        var newEvent = new CustomEvent("abz_aborted");
        document.dispatchEvent(newEvent);
        // alert("Execution finished!");
    }
        
    if ( this.highlightedBlock ) { 
        this.highlightedBlock.setHighlighted(false);
        this.highlightedBlock = null;
    }    
}


/**
 * Put the block on the execution stack.
 * 
 * @param {type} block
 * @returns {Boolean}
 */
AbbozzaInterpreter.callBlock = function(block) {
    if ( !block ) return false;
    
    var entry = new ExecStackEntry(block);
    this.execStack.push(entry);
    return true;
};

/**
 * Calls the block connected to the given input
 * 
 * @param {type} block
 * @param {type} name
 * @param {type} enfType
 * @returns {Boolean}
 */
AbbozzaInterpreter.callInput = function(block,name, enfType = null) {
    if ( !block ) return false;
    
    if (block.getInput(name) == null) {
        ErrorMgr.addError(block, _("err.NOINPUT"));
        return false;
    }
    var calledBlock = block.getInputTargetBlock(name);
    var entry = new ExecStackEntry(calledBlock,false,enfType);
    if (( enfType == "NUMBER" ) || ( enfType == "DECIMAL")) {
        entry.returnValue = Number(entry.returnValue);
    } else if (( enfType == "STRING" ) || ( enfType == "TEXT")) {
        entry.returnValue = String(entry.returnValue);
    } else if ( enfType == "BOOLEAN" ) {
        if ( typeof entry.returnValue == "string" ) {
           entry.returnValue = ( entry.returnValue != "" );
       } else if ( typeof entry.returnValue == "number") {
           entry.returnValue = ( entry.returnValue != 0 );           
       }
    }
    this.execStack.push(entry);
};


/**
 * Calls the next statement block
 * 
 * @param {type} block
 * @param {type} name
 * @returns {Boolean}
 */
AbbozzaInterpreter.callStatement = function(block,name = null ) {
    if ( !block ) return false;
    
    var calledBlock;
    if ( name != null ) {
        calledBlock = block.getInputTargetBlock(name);    
    } else {
        calledBlock = block;
    }
    
    if ( calledBlock == null) {
        return false;
    }
    
    var entry = new ExecStackEntry(calledBlock,true);
    this.execStack.push(entry);
    return true;
};

/**
 * Calls a function block
 * 
 * @param {type} block
 * @param {type} parameters
 * @returns {Boolean}
 */
AbbozzaInterpreter.callFunction = function(block,parameters) {
    if ( !block ) return false;
    
    var entry;
    if ( block.rettype != "VOID" ) {
        entry = new ExecStackEntry(block,false);
    } else {
        entry = new ExecStackEntry(block,true);
    }
    entry.args = parameters;
    
    this.execStack.push(entry);
    return true;
};

/**
 * End a function call (return block)
 * 
 * @param {type} returnEntry
 * @returns {undefined}
 */
AbbozzaInterpreter.endFunctionCall = function(returnEntry) {
    while ( (this.execStack.length > 0) && (this.execStack[this.execStack.length-1].block.type != "func_decl" )) {
        this.execStack.pop();
    }
    if ( this.execStack.length > 0 ) {
        var funcEntry = this.execStack[this.execStack.length-1];
        if ((funcEntry.block.rettype == "STRING") || (funcEntry.block.rettype == "TEXT")) {
            funcEntry.returnValue = String(returnEntry.returnValue);
        } else if ((funcEntry.block.rettype == "NUMBER") || (funcEntry.block.rettype == "DECIMAL")) {
            funcEntry.returnValue = Number(returnEntry.returnValue);
        } else if ( funcEntry.block.rettype == "BOOLEAN" ) {
            if ( typeof entry.returnValue == "string" ) {
                funcEntry.returnValue = ( returnEntry.returnValue != "" );
            } else if ( typeof entry.returnValue == "number") {
                funcEntry.returnValue = ( returnEntry.returnValue != 0 );           
            }
        } else {
            funcEntry.returnValue = returnEntry.returnValue;
        }
        funcEntry.finished();
    }
}


/**
 * Get the default value for the given type
 * @param {type} type
 * @param {type} len
 * @returns {Number|Array|AbbozzaInterpreter.getDefaultArray.ar|String|Boolean}
 */
AbbozzaInterpreter.getDefaultValue  = function(type, len) {
    if ( type == "NUMBER") {
        if ( len != null ) {
            return this.getDefaultArray(len,0);
        } else {
            return 0;
        }
    } else if ( type == "DECIMAL") {
        if ( len != null ) {
            return this.getDefaultArray(len,0.0);
        } else {
            return 0.0;
        }
    } else if ( (type == "STRING")  || (type == "TEXT") ) {
        if ( len != null) {
            return this.getDefaultArray(len,"");
        } else {
            return "";
        }
    } else if ( type == "BOOLEAN") {
        if ( len != null) {
            return this.getDefaultArray(len,false);
        } else {
            return false;
        }
    } else {
        return null;
    }
};

/**
 * Fills an array with default values
 * 
 * @param {type} dimension
 * @param {type} val
 * @param {type} pos
 * @returns {Array|AbbozzaInterpreter.getDefaultArray.ar}
 */
AbbozzaInterpreter.getDefaultArray  = function(dimension,val, pos = 0) {
    var ar = [];
    if ( pos == dimension.length-1 ) {
        // Last dimension
        for ( var i = 0; i < dimension[pos]; i++ ) {
            ar.push(val);
        }
    } else {
        for ( var i = 0; i < dimension[pos]; i++ ) {
            ar.push(this.getDefaultArray(dimension,val,pos+1));
        }
    }
    return ar;
}



AbbozzaInterpreter.setGlobalSymbol = function(key,value, dim = null) {
    if ( dim == null ) {
        this.globalSymbols[key] = value;
    } else {    
        var ar = this.globalSymbols[key];
        for ( var i = 0; i < dim.length-1; i++) {
            ar = ar[dim[i]];
        }
        ar[dim[dim.length-1]] = value;
    }
};


AbbozzaInterpreter.getGlobalSymbol = function(key) {
    return this.globalSymbols[key];
};


AbbozzaInterpreter.setLocalSymbol = function(key,value, dim = null) {
    if ( this.localSymbols.length == 0 ) return null;

    var symbols = this.localSymbols[this.localSymbols.length-1];
    if ( dim == null ) {
        symbols[key] = value;
    } else {    
        var ar = this.globalSymbols[key];
        for ( var i = 0; i < dim.length-1; i++) {
            ar = ar[dim[i]];
        }
        ar[dim[dim.length-1]] = value;        
    }
};


AbbozzaInterpreter.getLocalSymbol = function(key) {
    if ( this.localSymbols.length == 0 ) return null;

    var symbols = this.localSymbols[this.localSymbols.length-1];
    return symbols[key];
};


AbbozzaInterpreter.pushLocalSymbols = function() {
    this.localSymbols.push([]);
}


AbbozzaInterpreter.popLocalSymbols = function() {
    this.localSymbols.pop();
}


AbbozzaInterpreter.getSymbol = function(key, dim) {
    var val = this.getLocalSymbol(key);
    if ( val == null ) {
        val = this.getGlobalSymbol(key);
    }
    // Run through the dimensions
    if ( dim != null ) {
        for ( var i = 0; i < dim.length; i++ ) {
            val = val[dim[i]];
        }
    }
    return val;
}

AbbozzaInterpreter.setSymbol = function(key, val, dim) {
    var sym = this.getLocalSymbol(key);
    if ( sym == null ) {
        sym = this.getGlobalSymbol(key);
        if ( sym == null ) {
            return false;
        }
        this.setGlobalSymbol(key,val,dim);
    } else {
        this.setLocalSymbol(key,val,dim);        
    }    
}

Blockly.BlockSvg.prototype.setHighlighted = function(highlighted) {
      if (!this.rendered) {
    return;
  }
  if (highlighted) {
    this.svgPath_.setAttribute('filter',
        'url(#' + this.workspace.options.embossFilterId + ')');
    this.svgPathLight_.style.display = 'none';
  } else {
    this.svgPath_.setAttribute('filter',null);
    delete this.svgPathLight_.style.display;
  }
}

/**
 * Th class for the executoin stack entries
 * 
 * @param {type} block
 * @returns {ExecStackEntry}
 */
function ExecStackEntry(block,isStatement, enfType = null) {
    this.isStatement = isStatement;
    this.phase = 0;
    this.block = block;
    this.returnValue = null;
    this.callResult = null;
    this.enfType = enfType;
};


/**
 * Execute the block with the current phase
 */
ExecStackEntry.prototype.execute = function() {
    if ( !this.block ) return false;

    if ( this.block.execute ) {
        // Call the blocks own execute function.
        this.block.execute(this);
    } else if ( AbbozzaInterpreter.exec[this.block.type] ) {
        // Call the function given externally
        AbbozzaInterpreter.exec[this.block.type].call(this.block,this);
    } else {
        ErrorMgr.addError(this.block, _("err.NO_EXECUTE"));
        this.finished();
    }    
};


ExecStackEntry.prototype.finished = function() {
    this.phase = -1;
};


