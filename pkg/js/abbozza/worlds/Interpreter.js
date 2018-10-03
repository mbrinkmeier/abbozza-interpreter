/**
 * The static object for the Interpreter
 * 
 */


var AbbozzaInterpreter = {
    mode : 0,
    delay : 1,
    worker : null,
    globalSymbols : [],
    breakLoop: false,
    threads : [],
    activeThread : null,
    exec: []
};


AbbozzaInterpreter.MODE_STOPPED  = 0;
AbbozzaInterpreter.MODE_RUNNING  = 1;
AbbozzaInterpreter.MODE_PAUSED = 2;
AbbozzaInterpreter.MODE_TERMINATED = 3;
AbbozzaInterpreter.MODE_ABORTED = 4;
AbbozzaInterpreter.MODE_ABORTED_BY_ERROR = 5;

AbbozzaInterpreter.init = function() {
    this.mode = this.MODE_STOPPED;
};


AbbozzaInterpreter.newSketch = function() {
    Abbozza.newSketch();
    if (World.reset) World.reset();
    threads = [];
    this.globslSymbols = [];
};


/**
 * The Step button is pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.step = function() {
    if ( (this.mode == this.MODE_TERMINATED) || (this.mode >= this.MODE_ABORTED) ) {
        // Kill all threads 
        this.threads = [];
        // Go to mode STOPPED to start new execution
        this.mode = this.MODE_STOPPED;
    }
    this.executeStep();
    if ( this.mode < this.MODE_TERMINATED ) {
        this.mode = this.MODE_PAUSED;
    }
};

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
    if ( (this.mode == this.MODE_TERMINATED) || (this.mode >= this.MODE_ABORTED) ) {
       this.threads = [];
       this.mode = this.MODE_STOPPED;
    }
    this.executeStep();
    if ( this.mode < this.MODE_TERMINATED ) {
       this.mode = this.MODE_RUNNING;
       this.worker = window.setTimeout( AbbozzaInterpreter.doStep , AbbozzaInterpreter.delay );
    }
};

/**
 * The Stop button is pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.stop = function() {
    // Immediately abort the execution and wait for a step
    this.mode = this.MODE_ABORTED;
    ErrorMgr.clearErrors();
    for ( var idx = 0; idx < this.threads.length; idx++) {
        if ( this.threads[idx] ) {
            this.threads[idx].cleanUp();
        }
    }   
    this.threads = [];
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
        window.setTimeout(AbbozzaInterpreter.doStep , AbbozzaInterpreter.delay);
};


/**
 * Execute ONE step
 *  
 * @returns {undefined}
 */  
AbbozzaInterpreter.executeStep = function() {
        
    // If the thread list is empty and the mode is STOPPED, setup threads
    // for all top-blocks with prefix "main". 
    if ( (this.threads.length == 0) && (this.mode == this.MODE_STOPPED) ) {
        this.setupThreads();
    }
       
    // If the execution stack is empty, the status becomes TERMINATED
    var running = false;
    var breakpoint = false;
    for ( var idx = 0; idx < this.threads.length ; idx++) {
        if ( this.threads[idx] ) {
            running = running || this.threads[idx].isRunning();
            breakpoint = breakpoint || this.threads[idx].atBreakpoint();
        }
    }
    if ( !running ) {
        this.terminating();
        return;
    }
    
    if ( breakpoint ) {
        this.mode = this.MODE_PAUSED;
        var newEvent = new CustomEvent("abz_breakpoint");
        document.dispatchEvent(newEvent);
        return;
    }
    
    for ( var idx = 0; idx < this.threads.length; idx++) {
        if ( this.threads[idx] && this.threads[idx].isRunning() ) this.threads[idx].executeStep();
    }
    var newEvent = new CustomEvent("abz_step");
    document.dispatchEvent(newEvent);

    // Check if all threads teminated or one terminated due to an error.
    running = false;
    var error = false;
    for ( var idx = 0; idx < this.threads.length; idx++) {
        if ( this.threads[idx] ) {
            running = running || this.threads[idx].isRunning();
            error = error || this.threads[idx].errorOccurred();
        }
    }
    
    // If all threaeds ended or an error occurred, terminat the whole process
    if ( !running || error ) {
        if ( error ) 
            this.mode = AbbozzaInterpreter.MODE_ABORTED_BY_ERROR;
        this.terminating();
    } 
};


AbbozzaInterpreter.setupThreads = function() {
        var newThread;
        this.threads = [];
        ErrorMgr.clearErrors();
        if ( World.getStartBlocks ) {
            // Ask the world for Start block is any is provided
            var startBlocks = World.getStartBlocks();
            for ( var idx = 0; idx < startBlocks.length; idx++) {
                newThread = new Thread();
                newThread.setup(startBlocks[idx]);
                this.threads.push(newThread);
            }
        } else {
            // Take the main block
            var workspace = Blockly.mainWorkspace;
            var topBlocks = workspace.getTopBlocks(true);
            for (var i = 0; i < topBlocks.length; i++) {
                var block = topBlocks[i];
                if (block.type.startsWith("main")) {
                    newThread = new Thread();
                    newThread.setup(block);
                    this.threads.push(newThread);
                }
            }
        }    
}


/**
 * This operation is called if the execution is terminating.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.terminating = function() {
    // window.clearInterval(this.worker);    

    if ( this.mode < this.MODE_ABORTED ) {
        var newEvent = new CustomEvent("abz_terminated");
        document.dispatchEvent(newEvent);
        this.mode = this.MODE_TERMINATED;
        for ( var idx = 0; idx < this.threads.length; idx++) {
            if ( this.threads[idx] ) {
                this.threads[idx].cleanUp();
            }
        }        
        alert("Execution finished!");
    } else if ( this.mode == this.MODE_ABORTED ) {
        var newEvent = new CustomEvent("abz_aborted");
        document.dispatchEvent(newEvent);
        for ( var idx = 0; idx < this.threads.length; idx++) {
            if ( this.threads[idx] ) {
                this.threads[idx].cleanUp();
            }
        }        
    } else {
        var newEvent = new CustomEvent("abz_aborted_by_error");        
        document.dispatchEvent(newEvent);
        // Do NOT clean up
    }
}


/**
 * Put the block on the execution stack.
 * 
 * @param {type} block
 * @returns {Boolean}
 */
AbbozzaInterpreter.callBlock = function(block) {
    if (this.activeThread) return this.activeThread.callBlock(block);
    return false;
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
    if (this.activeThread) return this.activeThread.callInput(block,name,enfType);
    return false;
};


/**
 * Calls the next statement block
 * 
 * @param {type} block
 * @param {type} name
 * @returns {Boolean}
 */
AbbozzaInterpreter.callStatement = function(block,name = null ) {
    if (this.activeThread) return this.activeThread.callStatement(block,name);
    return false;
};

/**
 * Calls a function block
 * 
 * @param {type} block
 * @param {type} parameters
 * @returns {Boolean}
 */
AbbozzaInterpreter.callFunction = function(block,parameters) {
   if (this.activeThread) return this.activeThread.callFunction(block,parameters);
   return false;
};

/**
 * End a function call (return block)
 * 
 * @param {type} returnEntry
 * @returns {undefined}
 */
AbbozzaInterpreter.endFunctionCall = function(returnEntry) {
    if (this.activeThread) return this.activeThread.endFunctionCall(returnEntry);
    return false;
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
    if (this.activeThread) this.activeThread.setLocalSymbol(key,value,dim);
};


AbbozzaInterpreter.getLocalSymbol = function(key) {
    if (this.activeThread) return this.activeThread.getLocalSymbol(key);
    return null;
};


AbbozzaInterpreter.pushLocalSymbols = function() {
    if (this.activeThread) this.activeThread.localSymbols.push([]);
}


AbbozzaInterpreter.popLocalSymbols = function() {
    if (this.activeThread) this.activeThread.localSymbols.pop();
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
};


AbbozzaInterpreter.setSpeed = function(speed) {
    this.delay = 10 * ( 100-speed );    
};

AbbozzaInterpreter.getSpeed = function() {
    return 100 - Math.round(this.delay/10);    
};


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


Blockly.BlockSvg.prototype.updateBreakpointMark = function() {
    if ( this.isBreakpoint && (this.isBreakpoint == true)) {
        if ( this.warning == null ) {
            this._hadWarning_ = false;
            this.setWarningText("Breakpoint");
        }
    } else {
        this.isBreakpoint = false;
        this.setWarningText(null);
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


/**
 * A class for handling threads
 * 
 * @returns {undefined}
 */
Thread = function() {
    this.execStack = [];
    this.localSymbols = [];
    this.highlightedBlock = null;
}


Thread.prototype.setup = function(block) {
    this.execStack = [];
    this.localSymbols = [];
    this.terminated = false;
    this.terminatedByError = false;

    // Create an entry for the start block
    newEntry = new ExecStackEntry(block,true);
    this.execStack.push(newEntry);
}



/**
 * Execute ONE step
 *  
 * @returns {undefined}
 */  
Thread.prototype.executeStep = function() {
       
    AbbozzaInterpreter.activeThread = this;
    
    this.terminated = false;
    this.terminatedByError = false;
    
    if ( this.execStack.length == 0) {
        this.terminate();
        return;
    }
    
    // Execute the top block
    var topEntry = this.execStack[this.execStack.length-1];
    if (topEntry) { 
        if ( (this.highlightedBlock != null) && (this.highlightedBlock != topEntry.block) ) {
            this.highlightedBlock.setHighlighted(false);
        }
        this.highlightedBlock = topEntry.block;
        this.highlightedBlock.setHighlighted(true);
        
        if ( topEntry.phase >= 0 ) topEntry.execute();
        
        // After execution, check if block is finished
        if ( topEntry.phase < 0 ) {
            // Remove entry from execution stack
            this.execStack.pop();
       
            if ( topEntry.isStatement == false ) {
                // If it has a return value, take it and insert it as callResult into new top
                var newTop = this.execStack[this.execStack.length-1];
                if ( newTop ) {
                    newTop.callResult = topEntry.returnValue;
                }
            } else {
                // Execute the next statement
                var nextBlock = topEntry.block.getNextBlock();
                if ( nextBlock ) {
                    var newEntry = new ExecStackEntry(nextBlock,true);
                    this.execStack.push(newEntry);
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
        this.terminate();
    } 
};



Thread.prototype.terminate = function() {
    this.terminated = true;
    this.terminatedByError = false;
}


Thread.prototype.terminateByError = function() {
    this.terminated = true;
    this.terminatedByError = true;
}


Thread.prototype.isRunning = function() {
    return !(this.terminated || this.terminatedByError);
}

Thread.prototype.errorOccurred = function() {
    return this.terminatedByError;
}

Thread.prototype.atBreakpoint = function() {
        var topEntry = this.execStack[this.execStack.length-1];
        if ( topEntry && (topEntry.phase == 0 ) && ( topEntry.block.isBreakpoint) ) {
            return true;
        }
        return false;
}


Thread.prototype.cleanUp = function() {
    if ( this.highlightedBlock ) {
        this.highlightedBlock.setHighlighted(false);
        this.highlightedBlock = null;
    }
}

Thread.prototype.callBlock = function(block) {
    if ( !block ) return false;
    
    var entry = new ExecStackEntry(block);
    this.execStack.push(entry);
    return true;
};

Thread.prototype.callInput = function(block,name, enfType = null) {
    if ( !block ) return false;
    
    if (block.getInput(name) == null) {
        ErrorMgr.addError(block, _("err.NOINPUT"));
        this.mode = this.MODE_ABORTED_BY_ERROR;
        this.terminateByError();
        return false;
    }
    var calledBlock = block.getInputTargetBlock(name);
    if ( calledBlock == null ) {
        ErrorMgr.addError(block, _("err.NOINPUT"));
        this.mode = this.MODE_ABORTED_BY_ERROR;
        this.terminateByError();
        return false;        
    }
    
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
    
    return true;
};


Thread.prototype.callStatement = function(block,name = null ) {
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

Thread.prototype.callFunction = function(block,parameters) {
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


Thread.prototype.endFunctionCall = function(returnEntry) {
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
};


Thread.prototype.setLocalSymbol = function(key,value, dim = null) {
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


Thread.prototype.getLocalSymbol = function(key) {
    if ( this.localSymbols.length == 0 ) return null;

    var symbols = this.localSymbols[this.localSymbols.length-1];
    return symbols[key];
};
