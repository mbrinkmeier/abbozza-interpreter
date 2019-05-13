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
    state: -1, // undefined state
    sourceState: -1,
    delay: 500,
    worker: null,
    globalSymbols: [],
    breakLoop: false,
    threads: [],
    sourceThreads: [],
    activeThread: null,
    activeSourceThread: null,
    atBreakpoint: false,
    exec: [],
    executedSteps: 0,
    executedBlocks: 0,
    exceptions: [],
    objects: [],
    currentThreadId: 0,
    speedRunning: false
};

AbbozzaInterpreter.STATE_UNDEFINED = -1; // The interpreter is in an undefined state or not running
AbbozzaInterpreter.STATE_READY = 0;      // The Interpreter is initialized and ready to run
AbbozzaInterpreter.STATE_RUNNING = 1;    // The interpreter is running
AbbozzaInterpreter.STATE_PAUSED = 2;     // The interpreter is paused, ready to continue
AbbozzaInterpreter.STATE_TERMINATED = 3; // The program terminated regularly
AbbozzaInterpreter.STATE_ERROR = 4;      // The program terminated with an error


/**
 * Set the state of both interpreters
 * 
 * @param {type} state
 * @param {type} sourceState
 * @returns {undefined}
 */
AbbozzaInterpreter.setState = function (state, sourceState) {
    this.state = state;
    this.sourceState = sourceState;

    switch (this.state) {
        case AbbozzaInterpreter.STATE_UNDEFINED:
            break;
        case AbbozzaInterpreter.STATE_READY:
        case AbbozzaInterpreter.STATE_PAUSED:
        case AbbozzaInterpreter.STATE_TERMINATED:
        case AbbozzaInterpreter.STATE_ERROR:
            document.getElementById("run").children[0].src = "/img/run.png";
            document.getElementById("speedrun").children[0].src = "/img/speedrun.png";
            document.getElementById("speedrun").style.display = "block";
            break;
        case AbbozzaInterpreter.STATE_RUNNING:
            document.getElementById("run").children[0].src = "/img/pause.png";
            document.getElementById("speedrun").children[0].src = "/img/pause.png";
            document.getElementById("speedrun").style.display = "none";
            break;
    }

    switch (this.sourceState) {
        case AbbozzaInterpreter.STATE_UNDEFINED:
            break;
        case AbbozzaInterpreter.STATE_PAUSED:
        case AbbozzaInterpreter.STATE_READY:
        case AbbozzaInterpreter.STATE_TERMINATED:
        case AbbozzaInterpreter.STATE_ERROR:
            document.getElementById("runSource").src = "/img/run.png";
            document.getElementById("speedrunSource").src = "/img/speedrun.png";
            document.getElementById("speedrunSource").style.display = "inline";
            break;
        case AbbozzaInterpreter.STATE_RUNNING:
            document.getElementById("runSource").src = "/img/pause.png";
            document.getElementById("speedrunSource").src = "/img/pause.png";
            document.getElementById("speedrunSource").style.display = "none";
            break;
    }
};


/**
 * Switch the interpreter to blocks
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.switchToBlocks = function () {
    // If already executing blocks, do nothing
    if (this.state != this.STATE_UNDEFINED)
        return;

    this.setState(this.STATE_READY, this.STATE_UNDEFINED);

    AbbozzaInterpreter.sourceInterpreter = null;
    this.reset();
}


/**
 * Switch the interpreter to source
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.switchToSource = function () {
    // If already executing source, do nothing
    if (this.sourceState != this.STATE_UNDEFINED)
        return;

    this.setState(this.STATE_UNDEFINED, this.STATE_READY);

    this.resetSource();
}

/**
 * Returns true if the source is currently running.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.isRunningSource = function () {
    if ((this.state == this.STATE_UNDEFINED) || (this.sourceState != this.STATE_UNDEFINED)) {
        return true;
    }
    return false;
}


/**
 ** BLOCKS 
 **/


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

    this.setState(AbbozzaInterpreter.STATE_READY, AbbozzaInterpreter.STATE_UNDEFINED);

    var newEvent = new CustomEvent("abz_reset");
    document.dispatchEvent(newEvent);
};

/**
 * The step button is pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.step = function () {
    // If the source is currently running
    if ((this.state == this.STATE_UNDEFINED) || (this.sourceState != this.STATE_UNDEFINED)) {
        // Switch to blocks
        this.switchToBlocks();
    }

    switch (this.state) {
        case AbbozzaInterpreter.STATE_READY:
            // Do the first step and pause
            this.start();
            AbbozzaInterpreter.setState(this.STATE_PAUSED, this.STATE_UNDEFINED);
            this.doStep();
            break;
        case AbbozzaInterpreter.STATE_RUNNING:
            // Switch to pause
            AbbozzaInterpreter.setState(this.STATE_PAUSED, this.STATE_UNDEFINED);
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
            AbbozzaInterpreter.setState(this.STATE_PAUSED, this.STATE_UNDEFINED);
            this.doStep();
            break;
        default: // STATE_UNDEFINED
    }
};


/**
 * The run button s pressed
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.run = function (speedRun = false) {

    this.speedRunning = speedRun;

    // If the source is currently running
    if ((this.state == this.STATE_UNDEFINED) || (this.sourceState != this.STATE_UNDEFINED)) {
        // Switch to blocks
        this.switchToBlocks();
    }

    switch (this.state) {
        case AbbozzaInterpreter.STATE_READY:
            // Do the first step and pause
            this.start();
            AbbozzaInterpreter.setState(this.STATE_RUNNING, this.STATE_UNDEFINED);
            this.doStep();
            break;
        case AbbozzaInterpreter.STATE_RUNNING:
            // Switch to pause
            AbbozzaInterpreter.setState(this.STATE_PAUSED, this.STATE_UNDEFINED);
            break;
        case AbbozzaInterpreter.STATE_PAUSED:
            // do a step
            AbbozzaInterpreter.setState(this.STATE_RUNNING, this.STATE_UNDEFINED);
            this.doStep();
            break;
        case AbbozzaInterpreter.STATE_TERMINATED:
        case AbbozzaInterpreter.STATE_ERROR:
            // Reset and do a step
            this.reset();
            this.start();
            AbbozzaInterpreter.setState(this.STATE_RUNNING, this.STATE_UNDEFINED);
            this.doStep();
            break;
}
};


/**
 * Prepare the first step of execution after init
 * 
 * @returns {AbbozzaInterpreter.startBlocks}
 */
AbbozzaInterpreter.start = function () {
    // If the source is currently running ...
    if ((this.state == this.STATE_UNDEFINED) || (this.sourceState != this.STATE_UNDEFINED)) {
        return;
    }

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
 * This operation is executed by a timer to repeatedly execute steps.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.doStep = function () {
    // If the source is currently running ...
    if ((AbbozzaInterpreter.state == AbbozzaInterpreter.STATE_UNDEFINED) || (AbbozzaInterpreter.sourceState != AbbozzaInterpreter.STATE_UNDEFINED)) {
        return;
    }

    if ((AbbozzaInterpreter.state != AbbozzaInterpreter.STATE_RUNNING) &&
            (AbbozzaInterpreter.state != AbbozzaInterpreter.STATE_PAUSED)) {
        return;
    }

    // Repeat execute step, while
    // - stepping is deactivated
    // - not waiting for animation
    // - entry is blocking
    // But at least once.
    if (!Abbozza.waitingForAnimation) {
        var nonBlocking = false;
        var steps = 0;
        do {
            nonBlocking = AbbozzaInterpreter.executeStep();
            steps++;
        } while ((steps <= 10000) && !nonBlocking && !Abbozza.waitingForAnimation && AbbozzaInterpreter.speedRunning && (AbbozzaInterpreter.state == AbbozzaInterpreter.STATE_RUNNING));
        // If RUNNING automatically execute the next step
        if (AbbozzaInterpreter.state == AbbozzaInterpreter.STATE_RUNNING) {
            window.setTimeout(AbbozzaInterpreter.doStep, AbbozzaInterpreter.delay);
        }
    } else {
        window.setTimeout(AbbozzaInterpreter.doStep, 0);
    }
};


/**
 * Execute ONE block step
 *  
 * @returns {boolean} True if at least one thread is non-blocking, false otherwise
 */
AbbozzaInterpreter.executeStep = function () {
    // If the source is currently running ...
    if ((AbbozzaInterpreter.state == AbbozzaInterpreter.STATE_UNDEFINED) || (AbbozzaInterpreter.sourceState != AbbozzaInterpreter.STATE_UNDEFINED)) {
        return false;
    }

    var threadMsgs = [];
    var nonBlocking = false;

    if (this.atBreakpoint && (this.state == AbbozzaInterpreter.STATE_RUNNING)) {
        this.setState(this.STATE_PAUSED, this.STATE_UNDEFINED);
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
        return false;
    }

    var state = Thread.STATE_FINISHED;
    for (var idx = 0; idx < this.threads.length; idx++) {
        var thread = this.threads[idx];
        if (thread && (thread.state < Thread.STATE_FINISHED)) {
            nonBlocking = nonBlocking || thread.executeStep();
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
            Abbozza.openOverlay(_(msg),Abbozza.workspaceFrame.div);
            Abbozza.overlayWaitForClose();
        }, 1);
    }

    // All Threads finished 
    if (state == Thread.STATE_FINISHED) {
        this.setState(this.STATE_TERMINATED, this.STATE_UNDEFINED);
        this.terminating();
    } else if (state == Thread.STATE_ABORTED) {
        this.setState(this.STATE_ERROR, this.STATE_UNDEFINED);
        this.terminating();
    } else if (Abbozza.exceptions.length > 0) {
        // Check if there are thrown and untreated exceptions
        this.setState(this.STATE_ERROR, this.STATE_UNDEFINED);
        this.terminating();
    } else if (state == Thread.STATE_BREAKPOINT) {
        this.atBreakpoint = true;
    }

    return nonBlocking;
};


/**
 ** Source Interpreter
 **/

AbbozzaInterpreter.sourceInterpreter = null;

/**
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.resetSource = function () {
    // cleanup source threads
    for (var idx = 0; idx < this.sourceThreads.length; idx++) {
        if (this.sourceThreads[idx]) {
            this.sourceThreads[idx].cleanUp();
        }
    }

    this.sourceThreads = [];
    Abbozza.exceptions = [];

    this.setSpeed(document.getElementById("speed").value);

    World.reset();

    // Initialize the global interpreter, father of all
    this.sourceCode = Abbozza.sourceEditor.getValue();
    AbbozzaInterpreter.sourceInterpreter = new Interpreter(this.sourceCode, World._initSourceInterpreter);

    this.setState(AbbozzaInterpreter.STATE_UNDEFINED, AbbozzaInterpreter.STATE_READY);

    var newEvent = new CustomEvent("abz_reset");
    document.dispatchEvent(newEvent);
}

/**
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.stepSource = function () {
    // If the source is currently running
    if ((this.sourceState == this.STATE_UNDEFINED) || (this.state != this.STATE_UNDEFINED)) {
        // Switch to blocks
        this.switchToSource();
    }

    switch (this.sourceState) {
        case AbbozzaInterpreter.STATE_READY:
            // Do the first step and pause
            this.startSource();
            this.setState(this.STATE_UNDEFINED, this.STATE_PAUSED);
            this.doSourceStep();
            break;
        case AbbozzaInterpreter.STATE_RUNNING:
            // Switch to pause
            this.setState(this.STATE_UNDEFINED, this.STATE_PAUSED);
            break;
        case AbbozzaInterpreter.STATE_PAUSED:
            // do a step
            this.doSourceStep();
            break;
        case AbbozzaInterpreter.STATE_TERMINATED:
        case AbbozzaInterpreter.STATE_ERROR:
            // Reset and do a step
            this.resetSource();
            this.startSource();
            this.setState(this.STATE_UNDEFINED, this.STATE_PAUSED);
            this.doSourceStep();
            break;
        default:
            // Do the first step and pause
            this.resetSource();
            this.startSource();
            this.setState(this.STATE_UNDEFINED, this.STATE_PAUSED);
            this.doSourceStep();
            break;
    }
};


/**
 * Operations for the interpretation of source code
 */
AbbozzaInterpreter.runSource = function (speedRun = false) {

    this.speedRunning = speedRun;

    // If the source is currently running
    if ((this.sourceState == this.STATE_UNDEFINED) || (this.state != this.STATE_UNDEFINED)) {
        // Switch to blocks
        this.switchToSource();
    }

    switch (this.sourceState) {
        case AbbozzaInterpreter.STATE_READY:
            // Do the first step and pause
            this.startSource();
            this.setState(this.STATE_UNDEFINED, this.STATE_RUNNING);
            this.doSourceStep();
            break;
        case AbbozzaInterpreter.STATE_RUNNING:
            // Switch to pause
            this.setState(this.STATE_UNDEFINED, this.STATE_PAUSED);
            break;
        case AbbozzaInterpreter.STATE_PAUSED:
            // do a step
            this.setState(this.STATE_UNDEFINED, this.STATE_RUNNING);
            this.doSourceStep();
            break;
        case AbbozzaInterpreter.STATE_TERMINATED:
        case AbbozzaInterpreter.STATE_ERROR:
            // Reset and do a step
            this.resetSource();
            this.startSource();
            this.setState(this.STATE_UNDEFINED, this.STATE_RUNNING);
            this.doSourceStep();
            break;
        default:
            // Do the first step and pause
            this.resetSource();
            this.startSource();
            this.setState(this.STATE_UNDEFINED, this.STATE_PAUSED);
            this.doSourceStep();
            break;
}
}


/**
 * Prepare the first step of execution after init
 * 
 * @returns {AbbozzaInterpreter.startBlocks}
 */
AbbozzaInterpreter.startSource = function (speedRun = false) {
    // If the blocks are currently running ...
    if ((this.sourceState == this.STATE_UNDEFINED) || (this.state != this.STATE_UNDEFINED)) {
        return;
    }

    World.start();

    for (var i = 0; i < this.sourceThreads.length; i++) {
        this.sourceThreads[i].cleanUp();
    }
    this.setupSourceThreads();

    this.executedSteps = 0;
    Abbozza.exceptions = [];

    if (speedRun)
        this.speedRun();
}


AbbozzaInterpreter.speedRun = function () {

    this.setState(this.STATE_UNDEFINED, this.STATE_RUNNING);

    while (this.sourceState == this.STATE_RUNNING) {
        try {
            var stepped = AbbozzaInterpreter.sourceInterpreter.step();
            World.step();
            if (!stepped) {
                this.setState(this.STATE_UNDEFINED, this.STATE_TERMINATED);
                if (AbbozzaInterpreter.lastMark)
                    AbbozzaInterpreter.lastMark.clear();
                World.terminate();
                Abbozza.openOverlay(_("gui.finished"),Abbozza.workspaceFrame.div);
                Abbozza.overlayWaitForClose();
            }
        } catch (e) {
            this.setState(this.STATE_UNDEFINED, this.STATE_ERROR);
            running = false;
            World.error();
            Abbozza.openOverlay(_("gui.aborted_by_error"),Abbozza.workspaceFrame.div);
            Abbozza.appendOverlayText("\n");
            Abbozza.appendOverlayText(e);
            Abbozza.overlayWaitForClose();
        }
    }

    // Simple Speedrun
    // AbbozzaInterpreter.sourceInterpreter.run();
    // return;
}

/**
 * This operation is executed by a timer to repeatedly execute steps.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.doSourceStep = function () {
    // If the blocks are currently running ...
    if ((AbbozzaInterpreter.sourceState == AbbozzaInterpreter.STATE_UNDEFINED) || (AbbozzaInterpreter.state != AbbozzaInterpreter.STATE_UNDEFINED)) {
        return;
    }

    if ((AbbozzaInterpreter.sourceState != AbbozzaInterpreter.STATE_RUNNING) &&
            (AbbozzaInterpreter.sourceState != AbbozzaInterpreter.STATE_PAUSED)) {
        return;
    }

    if (!Abbozza.waitingForAnimation) {
        var nonBlocking = false;
        var steps = 0;
        do {
            nonBlocking = AbbozzaInterpreter.executeSourceStep();
            steps++;
        } while ((steps <= 1000) && !nonBlocking && !Abbozza.waitingForAnimation && AbbozzaInterpreter.speedRunning && (AbbozzaInterpreter.sourceState == AbbozzaInterpreter.STATE_RUNNING));
        // If RUNNING automatically execute the next step
        if (AbbozzaInterpreter.sourceState == AbbozzaInterpreter.STATE_RUNNING)
            window.setTimeout(AbbozzaInterpreter.doSourceStep, AbbozzaInterpreter.delay);
    } else {
        window.setTimeout(AbbozzaInterpreter.doSourceStep, 0);
    }
}


AbbozzaInterpreter.executeSourceStep = function () {
    // If the blocks are currently running ...
    if ((this.sourceState == this.STATE_UNDEFINED) || (this.state != this.STATE_UNDEFINED)) {
        return false;
    }

    var threadMsgs = [];
    var nonBlocking = false;

    // Do one step in each thread
    var state = Thread.STATE_FINISHED;
    for (var idx = 0; idx < this.sourceThreads.length; idx++) {
        var thread = this.sourceThreads[idx];
        if (thread && thread.state < Thread.STATE_FINISHED) {
            nonBlocking = nonBlocking || thread.executeStep();
            var tstate = thread.state;
            if (tstate == Thread.STATE_ABORTED) {
                state = Thread.STATE_ABORTED;
            } else if ((tstate <= Thread.STATE_WAITING) && (state == Thread.STATE_FINISHED)) {
                state = Thread.STATE_OK;
            }
            if (thread.stateMsg != null) {
                threadMsgs.push(thread.stateMsg);
            }
        }
    }
    World.step();

    for (idx = 0; idx < threadMsgs.length; idx++) {
        var msg = threadMsgs[idx];
        window.setTimeout(function () {
            Abbozza.openOverlay(_(msg),Abbozza.sourceFrame.div);
            Abbozza.overlayWaitForClose();
        }, 1);
    }

    // All Threads finished
    if (state == Thread.STATE_FINISHED) {
        this.setState(this.STATE_UNDEFINED, this.STATE_TERMINATED);
        this.terminatingSource();
    } else if (state == Thread.STATE_ABORTED) {
        this.setState(this.STATE_UNDEFINED, this.STATE_ERROR);
        this.terminatingSource();
    } else if (Abbozza.exceptions.length > 0) {
        // Check if there are thrown and untreated exceptions
        this.setState(this.STATE_UNDEFINED, this.STATE_ERROR);
        this.terminatingSource();
    } else if (state == Thread.STATE_BREAKPOINT) {
        this.atBreakpoint = true;
    }

    return nonBlocking;
};

/**
 ** THREADS 
 **/

/**
 * Initialize threads
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.setupThreads = function () {
    var newThread;
    this.threads = [];
    this.currentThreadId = 0;

    ErrorMgr.clearErrors();
    if (World.getStartBlocks) {
        // Ask the world for Start block
        var startBlocks = World.getStartBlocks();
        for (var idx = 0; idx < startBlocks.length; idx++) {
            this.currentThreadId++;
            newThread = new Thread(this.currentThreadId);
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
                newThread = new Thread(0);
                newThread.setup(block);
                this.threads.push(newThread);
            }
        }
    }
}

/**
 * 
 * @param {type} block
 * @param {type} parameters
 * @returns {Number} The thread id of the new thread;
 */
AbbozzaInterpreter.startThread = function (block, parameters) {
    if (this.isRunningSource()) {
        return -1;
    } else {
        this.currentThreadId++;
        newThread = new Thread(this.currentThreadId);
        newThread.setup(null);
        newThread.callFunction(block, parameters);
        this.threads.push(newThread);
        return this.currentThreadId;
    }
}

/**
 * Get the thread object for the id.
 * 
 * @param {type} id
 * @returns {Array}
 */
AbbozzaInterpreter.getThread = function (id) {
    if (id < 0)
        return null;

    for (var i = 0; i < this.threads.length; i++) {
        if (this.threads[i].id == id) {
            console.log("Thread " + id + " : ");
            console.log(this.threads[i]);
            return this.threads[i];
        }
    }

    return null;
}


/**
 * Initialize threads
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.setupSourceThreads = function () {
    var newThread;
    this.sourceThreads = [];

    // Start the main thread
    newThread = new SourceThread(0);
    this.currentThreadId = 0;
    newThread.setup(this.sourceInterpreter, "main()");
    this.sourceThreads.push(newThread);
}

/**
 * Start an additional source thread
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.startSourceThread = function (code) {
    if (!AbbozzaInterpreter.isRunningSource()) {
        return -1;
    } else {
        AbbozzaInterpreter.currentThreadId++;
        newThread = new SourceThread(AbbozzaInterpreter.currentThreadId);
        newThread.setup(AbbozzaInterpreter.sourceInterpreter, code);
        AbbozzaInterpreter.sourceThreads.push(newThread);
        return AbbozzaInterpreter.currentThreadId;
    }
}

/**
 * Get the thread object for the id.
 * 
 * @param {type} id
 * @returns {Array}
 */
AbbozzaInterpreter.getSourceThread = function (id) {
    if (id < 0)
        return null;

    for (var i = 0; i < this.sourceThreads.length; i++) {
        if (this.sourceThreads[i].id == id) {
            return this.sourceThreads[i];
        }
    }

    return null;
}

AbbozzaInterpreter.isThreadRunning = function (threadId) {
    var thread = AbbozzaInterpreter.getSourceThread(threadId);
    if (thread) {
        return thread.isRunning();
    }
    return false;
}

AbbozzaInterpreter.waitForThread = function (threadId) {
    var thread = AbbozzaInterpreter.getSourceThread(threadId);
    if (thread) {
        AbbozzaInterpreter.activeThread.state = Thread.STATE_WAITING;
        AbbozzaInterpreter.activeThread.waitingFor = thread;
    }
}

/**
 * This operation is called if the execution is terminating.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.terminating = function () {
    // If the source is currently running ...
    if ((this.state == this.STATE_UNDEFINED) || (this.sourceState != this.STATE_UNDEFINED)) {
        return;
    }

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
            if (show) {
                Abbozza.openOverlay(_("gui.finished"),Abbozza.workspaceFrame.div);
                Abbozza.overlayWaitForClose();
            }
    }
}


/**
 * This operation is called if the execution is terminating.
 * 
 * @returns {undefined}
 */
AbbozzaInterpreter.terminatingSource = function () {
    // If the source is currently running ...
    if ((this.state != this.STATE_UNDEFINED) || (this.sourceState == this.STATE_UNDEFINED)) {
        return;
    }

    switch (this.sourceState) {
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
            if (show) {
                Abbozza.openOverlay(_("gui.finished"),Abbozza.sourceFrame.div);
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
    var val = null;

    if (this.sourceState != this.STATE_UNDEFINED) {
        val = this.sourceInterpreter.getValueFromScope(key);
    } else {
        val = this.getLocalSymbol(key);
        if (val == null) {
            val = this.getGlobalSymbol(key);
        }
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
    this.nonBlocking = false; // By default the block can block the execution
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
 ** Operations for the creation of wrappers.
 **/


/**
 * Create a series of wrappers, described by an array.
 * Each entry of the array is again an array with the following entries:
 * 0 : Name of the wrapper function
 * 1 : Object on which the wrapped function should be executed
 * 2 : The wrapped function
 * 3 : Flag indicating that the Wrapper is asynchronous (true)
 * 4 : Flag indicating that the execution should be non-blocking (true)
 * 
 * @param {type} interpreter The source interpreter
 * @param {type} scope The scope to which the wrappers should be added
 * @param {type} wrappers The arrqay describing the wrappers
 * @returns {undefined}
 */
AbbozzaInterpreter.createWrappers = function (interpreter, scope, wrappers) {
    for (var i = 0; i < wrappers.length; i++) {
        var name = wrappers[i][0];
        var object = wrappers[i][1];
        var func = wrappers[i][2];
        var async = wrappers[i][3];
        var nonBlocking = wrappers[i][4];

        interpreter.setProperty(scope, name,
                AbbozzaInterpreter.createWrapper(interpreter, async, object, func, nonBlocking)
                );
    }
}

/**
 * Create a single wrapper.
 * 
 * @param {type} interpreter
 * @param {type} async
 * @param {type} obj
 * @param {type} func
 * @param {type} nonBlocking
 * @returns {unresolved}
 */
AbbozzaInterpreter.createWrapper = function (interpreter, async, obj, func, nonBlocking = false) {
    var object = obj;
    var method = func;
    if (async) {
        return interpreter.createAsyncFunction(
                function () {
                    AbbozzaInterpreter.currentThread.nonBlocking = nonBlocking;
                    return method.apply(object, Array.from(arguments));
                }
        );
    } else {
        return interpreter.createNativeFunction(
                function () {
                    AbbozzaInterpreter.currentThread.nonBlocking = nonBlocking;
                    return method.apply(object, Array.from(arguments));
                }
        );
     };
}



AbbozzaInterpreter.createNativeWrappersByName = function (interpreter, scope, obj, funcs, nonBlocking = false) {
    for (var i = 0; i < funcs.length; i++) {
        interpreter.setProperty(scope, funcs[i],
                AbbozzaInterpreter.createWrapper(interpreter, false, obj, obj[funcs[i]],nonBlocking));
    }
}



AbbozzaInterpreter.createAsyncWrappersByName = function (interpreter, scope, obj, funcs, nonBlocking = false) {
    for (var i = 0; i < funcs.length; i++) {
        interpreter.setProperty(scope, funcs[i],
                AbbozzaInterpreter.createWrapper(interpreter, true, obj, obj[funcs[i]],nonBlocking));
    }
}
