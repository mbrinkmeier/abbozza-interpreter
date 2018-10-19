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
    atBreakpoint : false,
    exec: [],
    executedSteps : 0,
    executedBlocks : 0
};


AbbozzaInterpreter.MODE_STOPPED  = 0;
AbbozzaInterpreter.MODE_RUNNING  = 1;
AbbozzaInterpreter.MODE_PAUSED = 2;
AbbozzaInterpreter.MODE_TERMINATED = 3;
AbbozzaInterpreter.MODE_ABORTED = 4;
AbbozzaInterpreter.MODE_ABORTED_BY_ERROR = 5;

/**
 * Initialize the interpreter
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.init = function() {
    AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_STOPPED;
};


/**
 * Remove all blocks from the workspace
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.newSketch = function() {
    Abbozza.newSketch();
    if (World.reset) World.reset();
    threads = [];
    this.globalSymbols = [];
};


/**
 * The Step button is pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.step = function() {
    if ( (AbbozzaInterpreter.mode == AbbozzaInterpreter.MODE_TERMINATED) 
         || (AbbozzaInterpreter.mode >= AbbozzaInterpreter.MODE_ABORTED) ) {
        // Go to mode STOPPED to start new execution
        AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_STOPPED;
    }
    this.executeStep();
    
    // Check if the execution was terminated
    if ( AbbozzaInterpreter.mode < AbbozzaInterpreter.MODE_TERMINATED ) {
        AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_PAUSED;
    }
};

/**
 * Th run button is pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.run = function() {
    if ( AbbozzaInterpreter.mode == AbbozzaInterpreter.MODE_RUNNING ) {
        AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_PAUSED;
        return;
    }
    if ( (AbbozzaInterpreter.mode == AbbozzaInterpreter.MODE_TERMINATED) || (AbbozzaInterpreter.mode >= AbbozzaInterpreter.MODE_ABORTED) ) {
       AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_STOPPED;
    }
    this.executeStep();
    if ( AbbozzaInterpreter.mode < AbbozzaInterpreter.MODE_TERMINATED ) {
       AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_RUNNING;
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
    AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_ABORTED;
    ErrorMgr.clearErrors();
    for ( var idx = 0; idx < this.threads.length; idx++) {
        if ( this.threads[idx] ) {
            this.threads[idx].cleanUp();
        }
    }   
    // this.threads = [];
    World._onStop();
    var newEvent = new CustomEvent("abz_aborted");
    document.dispatchEvent(newEvent);

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
        
    var threadMsgs = [];
    
    // If the thread list is empty and the mode is STOPPED, setup threads
    // for all top-blocks with prefix "main". 
    if ( AbbozzaInterpreter.mode == AbbozzaInterpreter.MODE_STOPPED ) {
        // Call the onStart hook
        World._onStart();
        for ( var i = 0; i < this.threads.length; i++) {
            this.threads[i].cleanUp();
        }
        this.setupThreads();
        this.executedteps = 0;
        this.executedBlocks = 0;
    }
    
    if ( this.atBreakpoint && (AbbozzaInterpreter.mode == AbbozzaInterpreter.MODE_RUNNING) ) {
        AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_PAUSED;
        var newEvent = new CustomEvent("abz_breakpoint");
        document.dispatchEvent(newEvent);
        this.atBreakpoint = false;
        for ( var i = 0; i < this.threads.length; i++) {
            if ( this.threads[i] ) {
                this.threads[i].highlightTop();
                if ( this.threads[i].state == Thread.STATE_BREAKPOINT ) {
                    this.threads[i].state = Thread.STATE_OK;
                }
            }
        }
        return;
    }
    
    var state = Thread.STATE_FINISHED;
    for ( var idx = 0; idx < this.threads.length; idx++) {
        if ( this.threads[idx] && this.threads[idx].state < Thread.STATE_FINISHED ) {
            this.threads[idx].executeStep();
            var tstate = this.threads[idx].state;
            if ( (tstate == Thread.STATE_BREAKPOINT) && (state != Thread.STATE_ABORTED)) {
                state = Thread.STATE_BREAKPOINT;
            } else if ( tstate == Thread.STATE_ABORTED ) {
                state = Thread.STATE_ABORTED;
            } else if ( (tstate == Thread.STATE_OK) && (state == Thread.STATE_FINISHED ) ) {
                state = Thread.STATE_OK;
            }
            if ( this.threads[idx].stateMsg != null ) {
                threadMsgs.push(this.threads[idx].stateMsg);
            }
        }
    }
    World._onStep();

    for (idx = 0; idx < threadMsgs.length; idx++ ) {
        var msg = threadMsgs[idx];
        window.setTimeout(function() { alert(_(msg)) }, 1);
    }
    
    // All Threads finished 
    if ( state == Thread.STATE_FINISHED ) {
        AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_TERMINATED;
        this.terminating();
    } else if ( state == Thread.STATE_ABORTED ) {
        AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_ABORTED_BY_ERROR;        
        this.terminating();
    } else if ( state == Thread.STATE_BREAKPOINT ) {
        this.atBreakpoint = true;
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

    if ( AbbozzaInterpreter.mode < AbbozzaInterpreter.MODE_ABORTED ) {
        World._onStop();
        var newEvent = new CustomEvent("abz_stop");
        document.dispatchEvent(newEvent);
        AbbozzaInterpreter.mode = AbbozzaInterpreter.MODE_TERMINATED;
        for ( var idx = 0; idx < this.threads.length; idx++) {
            if ( this.threads[idx] ) {
                this.threads[idx].cleanUp();
            }
        }        
        Abbozza.openOverlay(_("gui.finished"));
        Abbozza.overlayWaitForClose();
    } else if ( AbbozzaInterpreter.mode == AbbozzaInterpreter.MODE_ABORTED ) {
        World._onStop();
        var newEvent = new CustomEvent("abz_stop");
        document.dispatchEvent(newEvent);
        for ( var idx = 0; idx < this.threads.length; idx++) {
            if ( this.threads[idx] ) {
                this.threads[idx].cleanUp();
            }
        }        
    } else {
        var newEvent = new CustomEvent("abz_error");
        World._onError();
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
    this.state = 0 ; // Entry ok
    this.stateMsg = null; // No message
};


/**
 * Execute the block with the current phase
 */
ExecStackEntry.prototype.execute = function() {
    if ( !this.block ) return false;

    this.state = 0;
    this.stateMsg = null;
    
    if ( this.phase == 0 ) {
        AbbozzaInterpreter.executedBlocks++;            
    }
    AbbozzaInterpreter.executedSteps++;

    if ( this.block.execute ) {
        // Call the blocks own execute function.
        this.block.execute(this);
    } else if ( AbbozzaInterpreter.exec[this.block.type] ) {
        // Call the function given externally
        AbbozzaInterpreter.exec[this.block.type].call(this.block,this);
    } else {
        AbbozzaInterpreter.executedSteps--;
        AbbozzaInterpreter.executedBlocks--;
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
    this.state = 0;
    this.stateMsg = null;
}

Thread.STATE_OK = 0;
Thread.STATE_BREAKPOINT = 1;
Thread.STATE_FINISHED = 2;
Thread.STATE_ABORTED = 3;

Thread.prototype.setup = function(block) {
    this.execStack = [];
    this.localSymbols = [];

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
    
    this.state = Thread.STATE_OK;
    this.stateMsg = null;
    
    if ( this.execStack.length == 0) {
        this.state = Thread.STATE_FINISHED;
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
        
        if ( topEntry.phase >= 0 ) {
            topEntry.execute();
            // Execution of entry ended in error
            if ( topEntry.state != 0 ) {
                this.state = Thread.STATE_ABORTED;
                this.stateMsg = topEntry.stateMsg;
                return;
            } else if ( this.state == Thread.STATE_ABORTED ) {
                return;
            }
        }
        
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
    
    // Check for breakpoint
    topEntry = this.execStack[this.execStack.length-1];
    if ( this.atBreakpoint() ) {
        this.state = Thread.STATE_BREAKPOINT;
    }
    
    // Terminate if the stack is empty
    if ( this.execStack.length == 0 ) {
        this.state = Thread.STATE_FINISHED;
    } 
};



Thread.prototype.highlightTop = function() {
    if ( this.highlightedBlock ) {
        this.highlightedBlock.setHighlighted(false);
        this.highlightedBlock = null;
    }
    var topEntry = this.execStack[this.execStack.length-1];
    if (topEntry) { 
        if ( (this.highlightedBlock != null) && (this.highlightedBlock != topEntry.block) ) {
            this.highlightedBlock.setHighlighted(false);
        }
        this.highlightedBlock = topEntry.block;
        this.highlightedBlock.setHighlighted(true);
    }
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
        this.state = Thread.STATE_ABORTED;
        return false;
    }
    var calledBlock = block.getInputTargetBlock(name);
    if ( calledBlock == null ) {
        ErrorMgr.addError(block, _("err.NOINPUT"));
        this.state = Thread.STATE_ABORTED;
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
