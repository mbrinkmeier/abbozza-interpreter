/* 
 * Copyright 2019 Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A class for handling threads
 * 
 * @returns {undefined}
 */
Thread = function (myId) {
    this.callList = [];
    this.execStack = [];
    this.localSymbols = [];
    this.highlightedBlock = null;
    this.state = 0;
    this.stateMsg = null;
    this.id = myId;
    this.syncingWith = null;
    this.stateBeforeSync = 0;
}

Thread.STATE_OK = 0;
Thread.STATE_BREAKPOINT = 1;
Thread.STATE_SYNCING = 2;
Thread.STATE_WAITING = 3;
Thread.STATE_FINISHED = 4;
Thread.STATE_ABORTED = 5;

/**
 * Setting up the thread.
 * 
 * @param {type} block
 * @returns {undefined}
 */
Thread.prototype.setup = function (block) {
    this.callList = [];
    this.execStack = [];
    this.localSymbols = [];

    // Create an entry for the start block
    if (block != null) {
        var newEntry = new ExecStackEntry(block, true);
        this.execStack.push(newEntry);
    }
}



/**
 * Execute ONE step
 *  
 * @returns {undefined}
 */
Thread.prototype.executeStep = function () {

    AbbozzaInterpreter.activeThread = this;

    if (this.state == Thread.STATE_SYNCING) {
        return;
    }

    this.state = Thread.STATE_OK;
    this.stateMsg = null;

    if (this.execStack.length == 0) {
        if ((this.highlightedBlock != null) && (this.highlightedBlock != topEntry.block)) {
            this.highlightedBlock.setHighlighted(false);
        }
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
        if (this.highlightedBlock != null) {
            this.highlightedBlock.setHighlighted(false);
        }
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


Thread.prototype.isRunning = function () {
    return (this.state <= 3);
}

Thread.prototype.syncWithThread = function (thread) {
    if (thread == null)
        return;

    // Do nothing if not running or if other thread is not running
    if (!this.isRunning() || !thread.isRunning())
        return;

    // Check if other thread is waiting for me
    if (thread.releaseSync(this)) {
        this.syncingWith = null;
        this.state = this.stateBeforeSync;
    } else {
        // Wait for the other thread
        this.syncingWith = thread;
        this.stateBeforeSync = this.state;
        this.state = Thread.STATE_SYNCING;
    }
}

/**
 * 
 * @param {type} thread
 * @returns {undefined}
 */
Thread.prototype.releaseSync = function (thread) {
    if (this.syncingWith == thread) {
        this.syncWith = null;
        this.state = this.stateBeforeSync;
        return true;
    }
    return false;
}
