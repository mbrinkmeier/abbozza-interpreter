/**
 * @license
 * abbozza!
 *
 * Copyright 2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
 * The static object for the Interpreter
 * 
 */

AbbozzaInterpreter = {
    state: 0,
    sourceState: 0,
    delay: 500,
    worker: null,
    globalSymbols: [],
    breakLoop: false,
    threads: [],
    activeThread: null,
    atBreakpoint: false,
    exec: [],
    executedSteps: 0,
    executedBlocks: 0,
    exceptions: [],
    objects: []
};

AbbozzaInterpreter.STATE_READY = 0;     // The Interpreter is initialized and ready to run
AbbozzaInterpreter.STATE_RUNNING = 1;   // The interpreter is running
AbbozzaInterpreter.STATE_PAUSED = 2;     // The interpreter is paused, ready to continue
AbbozzaInterpreter.STATE_TERMINATED = 3; // The program terminated regularly
AbbozzaInterpreter.STATE_ERROR = 4;      // The program terminated with an error

/**
 * Initialize the interpreter
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.reset = function () {
    for (var idx = 0; idx < this.threads.length; idx++) {
        if (this.threads[idx]) {
            this.threads[idx].cleanUp();
        }
    }

    this.threads = [];
    this.globalSymbols = [];
    Abbozza.exceptions = [];
    this.objects = [];
    this.setSpeed(document.getElementById("speed").value);

    World.reset();
    this.state = AbbozzaInterpreter.STATE_READY;
    var newEvent = new CustomEvent("abz_reset");
    document.dispatchEvent(newEvent);
};

/**
 * The step button s pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.step = function () {
    switch (this.state) {
        case AbbozzaInterpreter.STATE_READY:
            // Do the first step and pause
            this.start();
            this.state = AbbozzaInterpreter.STATE_PAUSED;
            this.doStep();
            break;
        case AbbozzaInterpreter.STATE_RUNNING:
            // Switch to pause
            this.state = AbbozzaInterpreter.STATE_PAUSED;
            break;
        case AbbozzaInterpreter.STATE_PAUSED:
            // do a step
            this.doStep();
            break;
        case AbbozzaInterpreter.STATE_TERMINATED:
        case AbbozzaInterpreter.STATE_ERROR:
            // Reset and do a step
            this.reset();
            this.start();
            this.state = AbbozzaInterpreter.STATE_PAUSED;
            this.doStep();
            break;
    }
};


/**
 * The step button s pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.run = function () {
    switch (this.state) {
        case AbbozzaInterpreter.STATE_READY:
            // Do the first step and pause
            this.start();
            this.state = AbbozzaInterpreter.STATE_RUNNING;
            this.doStep();
            break;
        case AbbozzaInterpreter.STATE_RUNNING:
            // Switch to pause
            this.state = AbbozzaInterpreter.STATE_PAUSED;
            break;
        case AbbozzaInterpreter.STATE_PAUSED:
            // do a step
            this.state = AbbozzaInterpreter.STATE_RUNNING;
            this.doStep();
            break;
        case AbbozzaInterpreter.STATE_TERMINATED:
        case AbbozzaInterpreter.STATE_ERROR:
            // Reset and do a step
            this.reset();
            this.start();
            this.state = AbbozzaInterpreter.STATE_RUNNING;
            this.doStep();
            break;
    }
};



/**
 * This operation is executed by a timer to repeatedly execute steps.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.doStep = function () {
    if ((AbbozzaInterpreter.state != AbbozzaInterpreter.STATE_RUNNING) &&
            (AbbozzaInterpreter.state != AbbozzaInterpreter.STATE_PAUSED)) {
        return;
    }

    if (!Abbozza.waitingForAnimation) {
        AbbozzaInterpreter.executeStep();
        // If RUNNING automatically execute the next step
        if (AbbozzaInterpreter.state == AbbozzaInterpreter.STATE_RUNNING)
            window.setTimeout(AbbozzaInterpreter.doStep, AbbozzaInterpreter.delay);
    } else {
        window.setTimeout(AbbozzaInterpreter.doStep, 0);
    }
};

/**
 * Prepare the first step of execution after init
 * 
 * @returns {AbbozzaInterpreter.startBlocks}
 */
AbbozzaInterpreter.start = function () {
    World.start();
    for (var i = 0; i < this.threads.length; i++) {
        this.threads[i].cleanUp();
    }
    this.setupThreads();
    this.executedSteps = 0;
    this.executedBlocks = 0;
    Abbozza.exceptions = [];
    this.globalSymbols = [];
    this.objects = [];
}

/**
 * Execute ONE block step
 *  
 * @returns {undefined}
 */
AbbozzaInterpreter.executeStep = function () {

    var threadMsgs = [];

    if (this.atBreakpoint && (this.state == AbbozzaInterpreter.STATE_RUNNING)) {
        this.state = AbbozzaInterpreter.STATE_PAUSED;
        var newEvent = new CustomEvent("abz_breakpoint");
        document.dispatchEvent(newEvent);
        this.atBreakpoint = false;
        for (var i = 0; i < this.threads.length; i++) {
            if (this.threads[i]) {
                this.threads[i].highlightTop();
                if (this.threads[i].state == Thread.STATE_BREAKPOINT) {
                    this.threads[i].state = Thread.STATE_OK;
                }
            }
        }
        return;
    }

    var state = Thread.STATE_FINISHED;
    for (var idx = 0; idx < this.threads.length; idx++) {
        if (this.threads[idx] && this.threads[idx].state < Thread.STATE_FINISHED) {
            this.threads[idx].executeStep();
            var tstate = this.threads[idx].state;
            if ((tstate == Thread.STATE_BREAKPOINT) && (state != Thread.STATE_ABORTED)) {
                state = Thread.STATE_BREAKPOINT;
            } else if (tstate == Thread.STATE_ABORTED) {
                state = Thread.STATE_ABORTED;
            } else if ((tstate == Thread.STATE_OK) && (state == Thread.STATE_FINISHED)) {
                state = Thread.STATE_OK;
            }
            if (this.threads[idx].stateMsg != null) {
                threadMsgs.push(this.threads[idx].stateMsg);
            }
        }
    }
    // Call the World step hook
    World.step();

    for (idx = 0; idx < threadMsgs.length; idx++) {
        var msg = threadMsgs[idx];
        window.setTimeout(function () {
            alert(_(msg))
        }, 1);
    }

    // All Threads finished 
    if (state == Thread.STATE_FINISHED) {
        this.state = AbbozzaInterpreter.STATE_TERMINATED;
        this.terminating();
    } else if (state == Thread.STATE_ABORTED) {
        this.state = AbbozzaInterpreter.STATE_ERROR;
        this.terminating();
    } else if (Abbozza.exceptions.length > 0) {
        // Check if there are thrown and untreated exceptions
        this.state = AbbozzaInterpreter.STATE_ERROR;
        this.terminating();
    } else if (state == Thread.STATE_BREAKPOINT) {
        this.atBreakpoint = true;
    }
};

/**
 * Initialize threads
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.setupThreads = function () {
    var newThread;
    this.threads = [];
    ErrorMgr.clearErrors();
    if (World.getStartBlocks) {
        // Ask the world for Start block is any is provided
        var startBlocks = World.getStartBlocks();
        for (var idx = 0; idx < startBlocks.length; idx++) {
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
AbbozzaInterpreter.terminating = function () {
    // window.clearInterval(this.worker);    
    switch (this.state) {
        case AbbozzaInterpreter.STATE_ERROR:
            var eventDetail = null;
            var exception = null;
            var newEvent;
            if (Abbozza.exceptions.length > 0) {
                for (var i = 0; i < Abbozza.exceptions.length; i++) {
                    exception = Abbozza.exceptions[i];
                    eventDetail = {
                        detail: {
                            code: exception[0],
                            msg: exception[1]
                        }
                    }
                    World.error(exception);
                    newEvent = new CustomEvent("abz_error", eventDetail);
                    document.dispatchEvent(newEvent);
                }
                Abbozza.exceptions = [];
            }
            break;
        default:
            var show = World.terminate();
            var newEvent = new CustomEvent("abz_stop");
            document.dispatchEvent(newEvent);
            for (var idx = 0; idx < this.threads.length; idx++) {
                if (this.threads[idx]) {
                    this.threads[idx].cleanUp();
                }
            }
            if ( show ) {
                Abbozza.openOverlay(_("gui.finished"));
                Abbozza.overlayWaitForClose();
            }
    }
}

/**
 * Put the block on the execution stack.
 * 
 * @param {type} block
 * @returns {Boolean}
 */
AbbozzaInterpreter.callBlock = function (block) {
    if (this.activeThread)
        return this.activeThread.callBlock(block);
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
AbbozzaInterpreter.callInput = function (block, name, enfType = null) {
    if (this.activeThread)
        return this.activeThread.callInput(block, name, enfType);
    return false;
};


/**
 * Calls the next statement block
 * 
 * @param {type} block
 * @param {type} name
 * @returns {Boolean}
 */
AbbozzaInterpreter.callStatement = function (block, name = null) {
    if (this.activeThread)
        return this.activeThread.callStatement(block, name);
    return false;
};

/**
 * Calls a function block
 * 
 * @param {type} block
 * @param {type} parameters
 * @returns {Boolean}
 */
AbbozzaInterpreter.callFunction = function (block, parameters) {
    if (this.activeThread)
        return this.activeThread.callFunction(block, parameters);
    return false;
};

/**
 * End a function call (return block)
 * 
 * @param {type} returnEntry
 * @returns {undefined}
 */
AbbozzaInterpreter.endFunctionCall = function (returnEntry) {
    if (this.activeThread)
        return this.activeThread.endFunctionCall(returnEntry);
    return false;
}


/**
 * Get the default value for the given type
 * @param {type} type
 * @param {type} len
 * @returns {Number|Array|AbbozzaInterpreter.getDefaultArray.ar|String|Boolean}
 */
AbbozzaInterpreter.getDefaultValue = function (type, len) {
    if (type == "NUMBER") {
        if (len != null) {
            return this.getDefaultArray(len, 0);
        } else {
            return 0;
        }
    } else if (type == "DECIMAL") {
        if (len != null) {
            return this.getDefaultArray(len, 0.0);
        } else {
            return 0.0;
        }
    } else if ((type == "STRING") || (type == "TEXT")) {
        if (len != null) {
            return this.getDefaultArray(len, "");
        } else {
            return "";
        }
    } else if (type == "BOOLEAN") {
        if (len != null) {
            return this.getDefaultArray(len, false);
        } else {
            return false;
        }
    } else if (type.startsWith("#")) {
        return 0;
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
AbbozzaInterpreter.getDefaultArray = function (dimension, val, pos = 0) {
    var ar = [];
    if (pos == dimension.length - 1) {
        // Last dimension
        for (var i = 0; i < dimension[pos]; i++) {
            ar.push(val);
        }
    } else {
        for (var i = 0; i < dimension[pos]; i++) {
            ar.push(this.getDefaultArray(dimension, val, pos + 1));
        }
    }
    return ar;
}



AbbozzaInterpreter.setGlobalSymbol = function (key, value, dim = null) {
    if (dim == null) {
        AbbozzaInterpreter.globalSymbols[key] = value;
    } else {
        var ar = AbbozzaInterpreter.globalSymbols[key];
        for (var i = 0; i < dim.length - 1; i++) {
            ar = ar[dim[i]];
        }
        ar[dim[dim.length - 1]] = value;
}
};


AbbozzaInterpreter.getGlobalSymbol = function (key) {
    return this.globalSymbols[key];
};


AbbozzaInterpreter.setLocalSymbol = function (key, value, dim = null) {
    if (this.activeThread)
        this.activeThread.setLocalSymbol(key, value, dim);
};


AbbozzaInterpreter.getLocalSymbol = function (key) {
    if (this.activeThread)
        return this.activeThread.getLocalSymbol(key);
    return null;
};


AbbozzaInterpreter.pushLocalSymbols = function () {
    if (this.activeThread)
        this.activeThread.localSymbols.push([]);
}


AbbozzaInterpreter.popLocalSymbols = function () {
    if (this.activeThread)
        this.activeThread.localSymbols.pop();
}


AbbozzaInterpreter.getSymbol = function (key, dim) {
    var val = this.getLocalSymbol(key);
    if (val == null) {
        val = this.getGlobalSymbol(key);
    }
    // Run through the dimensions
    if (dim != null) {
        for (var i = 0; i < dim.length; i++) {
            val = val[dim[i]];
        }
    }
    return val;
}

AbbozzaInterpreter.setSymbol = function (key, val, dim) {
    var sym = this.getLocalSymbol(key);
    if (sym == null) {
        sym = this.getGlobalSymbol(key);
        if (sym == null) {
            return false;
        }
        this.setGlobalSymbol(key, val, dim);
    } else {
        this.setLocalSymbol(key, val, dim);
    }
};


AbbozzaInterpreter.setSpeed = function (speed) {
    AbbozzaInterpreter.delay = 10 * (100 - speed);
};

AbbozzaInterpreter.getSpeed = function () {
    return 100 - Math.round(AbbozzaInterpreter.delay / 10);
};


/*** OBJECTS ***/

AbbozzaInterpreter.createObject = function (cls, value) {
    this.objects.push([cls, value]);
    return this.objects.length;
};

AbbozzaInterpreter.getObject = function (reference) {
    if ((reference > 0) && (this.objects.length >= reference)) {
        return this.objects[reference - 1];
    }
    return null;
}

AbbozzaInterpreter.getObjectType = function (reference) {
    if ((reference > 0) && (this.objects.length >= reference)) {
        return this.objects[reference - 1][0];
    }
    return "";
};

AbbozzaInterpreter.getObjectValue = function (reference) {
    if ((reference > 0) && (this.objects.length >= reference)) {
        return this.objects[reference - 1][1];
    }
    return null;
};

AbbozzaInterpreter.setObjectValue = function (reference, value) {
    if ((reference > 0) && (this.objects.length >= reference)) {
        this.objects[reference - 1][1] = value;
    }
};


/*** MISC ***/

Blockly.BlockSvg.prototype.setHighlighted = function (highlighted) {
    if (!this.rendered) {
        return;
    }
    if (highlighted) {
        this.svgPath_.setAttribute('filter',
                'url(#' + this.workspace.options.embossFilterId + ')');
        this.svgPathLight_.style.display = 'none';
    } else {
        this.svgPath_.setAttribute('filter', null);
        delete this.svgPathLight_.style.display;
    }
}


Blockly.BlockSvg.prototype.updateBreakpointMark = function () {
    if (this.isBreakpoint && (this.isBreakpoint == true)) {
        if (this.warning == null) {
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
function ExecStackEntry(block, isStatement, enfType = null) {
    this.isStatement = isStatement;
    this.phase = 0;
    this.block = block;
    this.returnValue = null;
    this.callResult = null;
    this.enfType = enfType;
    this.state = 0; // Entry ok
    this.stateMsg = null; // No message
}
;


/**
 * Execute the block with the current phase
 */
ExecStackEntry.prototype.execute = function () {
    if (!this.block)
        return false;

    this.state = 0;
    this.stateMsg = null;

    if (this.phase == 0) {
        AbbozzaInterpreter.executedBlocks++;
    }
    AbbozzaInterpreter.executedSteps++;

    if (this.block.execute) {
        // Call the blocks own execute function.
        this.block.execute(this);
    } else if (AbbozzaInterpreter.exec[this.block.type]) {
        // Call the function given externally
        AbbozzaInterpreter.exec[this.block.type].call(this.block, this);
    } else {
        AbbozzaInterpreter.executedSteps--;
        AbbozzaInterpreter.executedBlocks--;
        ErrorMgr.addError(this.block, _("err.NO_EXECUTE"));
        this.finished();
    }
};


ExecStackEntry.prototype.finished = function () {
    this.phase = -1;
};


/**
 * A class for handling threads
 * 
 * @returns {undefined}
 */
Thread = function () {
    this.callList = [];
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

Thread.prototype.setup = function (block) {
    this.callList = [];
    this.execStack = [];
    this.localSymbols = [];

    // Create an entry for the start block
    newEntry = new ExecStackEntry(block, true);
    this.execStack.push(newEntry);
}



/**
 * Execute ONE step
 *  
 * @returns {undefined}
 */
Thread.prototype.executeStep = function () {

    AbbozzaInterpreter.activeThread = this;

    this.state = Thread.STATE_OK;
    this.stateMsg = null;

    if (this.execStack.length == 0) {
        this.state = Thread.STATE_FINISHED;
        return;
    }

    // Execute the top block
    var topEntry = this.execStack[this.execStack.length - 1];
    if (topEntry) {
        if ((this.highlightedBlock != null) && (this.highlightedBlock != topEntry.block)) {
            this.highlightedBlock.setHighlighted(false);
        }
        this.highlightedBlock = topEntry.block;
        this.highlightedBlock.setHighlighted(true);

        if (topEntry.phase >= 0) {
            topEntry.execute();
            // Execution of entry ended in error
            if (topEntry.state != 0) {
                this.state = Thread.STATE_ABORTED;
                this.stateMsg = topEntry.stateMsg;
                return;
            } else if (this.state == Thread.STATE_ABORTED) {
                return;
            }
        }

        // After execution, check if block is finished
        if (topEntry.phase < 0) {
            // Remove entry from execution stack
            this.execStack.pop();

            if (topEntry.isStatement == false) {
                // If it has a return value, take it and insert it as callResult into new top
                var newTop = this.execStack[this.execStack.length - 1];
                if (newTop) {
                    newTop.callResult = topEntry.returnValue;
                }
            } else {
                // Execute the next statement
                var nextBlock = topEntry.block.getNextBlock();
                if (nextBlock) {
                    var newEntry = new ExecStackEntry(nextBlock, true);
                    this.execStack.push(newEntry);
                }
            }

            if (topEntry.block.type == "func_call") {
                this.callList.push([AbbozzaInterpreter.executedSteps, null, null]);
            }
            topEntry = this.execStack[this.execStack.length - 1];
        }

    } else {
        // Remove empty entry
        this.execStack.pop();
    }

    // Check for breakpoint
    topEntry = this.execStack[this.execStack.length - 1];
    if (this.atBreakpoint()) {
        this.state = Thread.STATE_BREAKPOINT;
    }

    // Terminate if the stack is empty
    if (this.execStack.length == 0) {
        this.state = Thread.STATE_FINISHED;
    }
};



Thread.prototype.highlightTop = function () {
    if (this.highlightedBlock) {
        this.highlightedBlock.setHighlighted(false);
        this.highlightedBlock = null;
    }
    var topEntry = this.execStack[this.execStack.length - 1];
    if (topEntry) {
        if ((this.highlightedBlock != null) && (this.highlightedBlock != topEntry.block)) {
            this.highlightedBlock.setHighlighted(false);
        }
        this.highlightedBlock = topEntry.block;
        this.highlightedBlock.setHighlighted(true);
    }
}

Thread.prototype.atBreakpoint = function () {
    var topEntry = this.execStack[this.execStack.length - 1];
    if (topEntry && (topEntry.phase == 0) && (topEntry.block.isBreakpoint)) {
        return true;
    }
    return false;
}


Thread.prototype.cleanUp = function () {
    if (this.highlightedBlock) {
        this.highlightedBlock.setHighlighted(false);
        this.highlightedBlock = null;
    }
}


Thread.prototype.callBlock = function (block) {
    if (!block)
        return false;

    var entry = new ExecStackEntry(block);
    this.execStack.push(entry);
    return true;
};


Thread.prototype.callInput = function (block, name, enfType = null) {
    if (!block)
        return false;

    if (block.getInput(name) == null) {
        ErrorMgr.addError(block, _("err.NOINPUT"));
        this.state = Thread.STATE_ABORTED;
        return false;
    }
    var calledBlock = block.getInputTargetBlock(name);
    if (calledBlock == null) {
        ErrorMgr.addError(block, _("err.NOINPUT"));
        this.state = Thread.STATE_ABORTED;
        return false;
    }

    var entry = new ExecStackEntry(calledBlock, false, enfType);
    if ((enfType == "NUMBER") || (enfType == "DECIMAL")) {
        entry.returnValue = Number(entry.returnValue);
    } else if ((enfType == "STRING") || (enfType == "TEXT")) {
        entry.returnValue = String(entry.returnValue);
    } else if (enfType == "BOOLEAN") {
        if (typeof entry.returnValue == "string") {
            entry.returnValue = (entry.returnValue != "");
        } else if (typeof entry.returnValue == "number") {
            entry.returnValue = (entry.returnValue != 0);
        }
    }
    this.execStack.push(entry);

    return true;
};


Thread.prototype.callStatement = function (block, name = null) {
    if (!block)
        return false;

    var calledBlock;
    if (name != null) {
        calledBlock = block.getInputTargetBlock(name);
    } else {
        calledBlock = block;
    }

    if (calledBlock == null) {
        return false;
    }

    var entry = new ExecStackEntry(calledBlock, true);
    this.execStack.push(entry);
    return true;
};

Thread.prototype.callFunction = function (block, parameters) {
    if (!block)
        return false;

    var entry;
    if (block.rettype != "VOID") {
        entry = new ExecStackEntry(block, false);
    } else {
        entry = new ExecStackEntry(block, true);
    }
    entry.args = parameters;

    this.execStack.push(entry);
    this.callList.push([AbbozzaInterpreter.executedSteps, block, parameters]);

    return true;
};


Thread.prototype.endFunctionCall = function (returnEntry) {
    while ((this.execStack.length > 0) && (this.execStack[this.execStack.length - 1].block.type != "func_decl")) {
        this.execStack.pop();
    }
    if (this.execStack.length > 0) {
        var funcEntry = this.execStack[this.execStack.length - 1];
        if ((funcEntry.block.rettype == "STRING") || (funcEntry.block.rettype == "TEXT")) {
            funcEntry.returnValue = String(returnEntry.returnValue);
        } else if ((funcEntry.block.rettype == "NUMBER") || (funcEntry.block.rettype == "DECIMAL")) {
            funcEntry.returnValue = Number(returnEntry.returnValue);
        } else if (funcEntry.block.rettype == "BOOLEAN") {
            if (typeof entry.returnValue == "string") {
                funcEntry.returnValue = (returnEntry.returnValue != "");
            } else if (typeof entry.returnValue == "number") {
                funcEntry.returnValue = (returnEntry.returnValue != 0);
            }
        } else {
            funcEntry.returnValue = returnEntry.returnValue;
        }
        funcEntry.finished();
    }
    // this.callList.push([AbbozzaInterpreter.executedSteps, null, null]);
};


Thread.prototype.setLocalSymbol = function (key, value, dim = null) {
    if (this.localSymbols.length == 0)
        return null;

    key = "_" + key + "_";
    var symbols = this.localSymbols[this.localSymbols.length - 1];
    if (dim == null) {
        symbols[key] = value;
    } else {
        var ar = this.globalSymbols[key];
        for (var i = 0; i < dim.length - 1; i++) {
            ar = ar[dim[i]];
        }
        ar[dim[dim.length - 1]] = value;
    }
    console.log(symbols);
};


Thread.prototype.getLocalSymbol = function (key) {
    if (this.localSymbols.length == 0)
        return null;

    key = "_" + key + "_";
    var symbols = this.localSymbols[this.localSymbols.length - 1];
    return symbols[key];
};


Thread.prototype.getCallList = function () {
    return this.callList;
}



AbbozzaInterpreter.sourceInterpreter = null;
AbbozzaInterpreter.SOURCE_READY = 0;
AbbozzaInterpreter.SOURCE_PAUSED = 1;
AbbozzaInterpreter.SOURCE_RUNNING = 2;
AbbozzaInterpreter.SOURCE_TERMINATED = 3;
AbbozzaInterpreter.SOURCE_ERROR = 4;
AbbozzaInterpreter.sourceState = 0;


AbbozzaInterpreter.resetSource = function() {
    World.reset();
    Abbozza.exceptions = [];
    
    var code = Abbozza.sourceEditor.getValue();
    AbbozzaInterpreter.sourceInterpreter = new Interpreter(code, World._initSourceInterpreter);

    AbbozzaInterpreter.sourceState = AbbozzaInterpreter.SOURCE_READY;
    var newEvent = new CustomEvent("abz_reset");
    document.dispatchEvent(newEvent);
}

/**
 * Prepare the first step of execution after init
 * 
 * @returns {AbbozzaInterpreter.startBlocks}
 */
AbbozzaInterpreter.startSource = function () {
    World.start();
    this.executedSteps = 0;
    Abbozza.exceptions = [];
}


/*
 AbbozzaInterpreter.stepSource = function() {
 if ((AbbozzaInterpreter.sourceState == AbbozzaInterpreter.SOURCE_STOPPED)
 || (AbbozzaInterpreter.sourceState >= AbbozzaInterpreter.SOURCE_ABORTED)) {
 
 }
 AbbozzaInterpreter.sourceState = AbbozzaInterpreter.SOURCE_PAUSED;
 window.setTimeout(AbbozzaInterpreter.doSourceStep, 0);
 }
 */

AbbozzaInterpreter.stepSource = function () {
    switch (AbbozzaInterpreter.sourceState) {
        case AbbozzaInterpreter.SOURCE_READY:
            // Do the first step and pause
            this.startSource();
            this.sourceState = AbbozzaInterpreter.SOURCE_PAUSED;
            this.doSourceStep();
            break;
        case AbbozzaInterpreter.SOURCE_RUNNING:
            // Switch to pause
            this.sourceState = AbbozzaInterpreter.SOURCE_PAUSED;
            break;
        case AbbozzaInterpreter.SOURCE_PAUSED:
            // do a step
            this.doSourceStep();
            break;
        case AbbozzaInterpreter.SOURCE_TERMINATED:
        case AbbozzaInterpreter.SOURCE_ERROR:
            // Reset and do a step
            this.resetSource();
            this.startSource();
            this.sourceState = AbbozzaInterpreter.SOURCE_PAUSED;
            this.doSourceStep();
            break;
        default:
            // Do the first step and pause
            this.resetSource();
            this.startSource();
            this.sourceState = AbbozzaInterpreter.SOURCE_PAUSED;
            this.doSourceStep();
            break;
    }
};


/**
 * Operations for the interpretation of source code
 */
AbbozzaInterpreter.runSource = function () {
    switch (AbbozzaInterpreter.sourceState) {
        case AbbozzaInterpreter.SOURCE_READY:
            // Do the first step and pause
            this.startSource();
            this.sourceState = AbbozzaInterpreter.SOURCE_RUNNING;
            this.doSourceStep();
            break;
        case AbbozzaInterpreter.SOURCE_RUNNING:
            // Switch to pause
            this.sourceState = AbbozzaInterpreter.SOURCE_PAUSED;
            break;
        case AbbozzaInterpreter.SOURCE_PAUSED:
            // do a step
            this.sourceState = AbbozzaInterpreter.SOURCE_RUNNING;
            this.doSourceStep();
            break;
        case AbbozzaInterpreter.SOURCE_TERMINATED:
        case AbbozzaInterpreter.SOURCE_ERROR:
            // Reset and do a step
            this.resetSource();
            this.startSource();
            this.sourceState = AbbozzaInterpreter.SOURCE_RUNNING;
            this.doSourceStep();
            break;
        default:
            // Do the first step and pause
            this.resetSource();
            this.startSource();
            this.sourceState = AbbozzaInterpreter.SOURCE_PAUSED;
            this.doSourceStep();
            break;
    }
}




/**
 * This operation is executed by a timer to repeatedly execute steps.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.doSourceStep = function () {
    if ((AbbozzaInterpreter.sourceState != AbbozzaInterpreter.SOURCE_RUNNING) &&
            (AbbozzaInterpreter.sourceState != AbbozzaInterpreter.SOURCE_PAUSED)) {
        return;
    }

    if (!Abbozza.waitingForAnimation) {
        AbbozzaInterpreter.executeSourceStep();
        if (AbbozzaInterpreter.sourceState == AbbozzaInterpreter.SOURCE_RUNNING)
            window.setTimeout(AbbozzaInterpreter.doSourceStep, AbbozzaInterpreter.delay);
    } else {
        window.setTimeout(AbbozzaInterpreter.doSourceStep, 0);
    }
}


AbbozzaInterpreter.executeSourceStep = function () {
    /*
    if (AbbozzaInterpreter.sourceState == AbbozzaInterpreter.SOURCE_READY) {
        World._onStart();
        var code = Abbozza.sourceEditor.getValue();
        AbbozzaInterpreter.sourceInterpreter = new Interpreter(code, World._initSourceInterpreter);
    }
    */
   
    try {
        var state = AbbozzaInterpreter.sourceInterpreter.stateStack[AbbozzaInterpreter.sourceInterpreter.stateStack.length - 1];
        var spos = Abbozza.sourceEditor.getDoc().posFromIndex(state.node.start);
        var epos = Abbozza.sourceEditor.getDoc().posFromIndex(state.node.end);
        if (AbbozzaInterpreter.lastMark)
            AbbozzaInterpreter.lastMark.clear();
        AbbozzaInterpreter.lastMark = Abbozza.sourceEditor.getDoc().markText(spos, epos, {className: "sourceMarker"});
        var stepped = AbbozzaInterpreter.sourceInterpreter.step();
        World.step();
        if (!stepped) {
            AbbozzaInterpreter.sourceState = AbbozzaInterpreter.SOURCE_TERMINATED;
            if (AbbozzaInterpreter.lastMark)
                AbbozzaInterpreter.lastMark.clear();
            World.terminate();
            Abbozza.openOverlay(_("gui.finished"));
            Abbozza.overlayWaitForClose();
        }
    } catch (e) {
        AbbozzaInterpreter.sourceState = AbbozzaInterpreter.SOURCE_ERROR;
        if (AbbozzaInterpreter.lastMark) {
            AbbozzaInterpreter.lastMark.clear();
            AbbozzaInterpreter.lastMark = Abbozza.sourceEditor.getDoc().markText(spos, epos, {className: "sourceErrorMarker"});
        }
        
        World.error();
        Abbozza.openOverlay(_("gui.aborted_by_error"));
        Abbozza.appendOverlayText("\n");
        Abbozza.appendOverlayText(e);
        Abbozza.overlayWaitForClose();
    }
}
