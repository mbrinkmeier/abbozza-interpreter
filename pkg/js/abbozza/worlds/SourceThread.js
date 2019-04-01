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
 * A class for handling source code threads
 * 
 * @returns {undefined}
 */
SourceThread = function(myId) {
    this.callList = [];
    this.execStack = [];
    this.localSymbols = [];
    this.state = 0;
    this.stateMsg = null;
    this.id = myId;
    this.syncingWith = null;
    this.waitingFor = null;
    this.stateBeforeSync = 0;
    this.interpreter = null;
    this.globalInterpreter;
    this.mark = null;
}



/**
 * Setting up the thread.
 * 
 * @param {type} block
 * @returns {undefined}
 */
SourceThread.prototype.setup = function(father, code) {
    this.globalInterpreter = father;
    
    // Create a new interpreter.
    this.interpreter = new Interpreter('');
    // Get the scopr from the father
    this.interpreter.stateStack[0].scope = this.globalInterpreter.global;
    this.interpreter.appendCode(code);
}


/**
 * Execute ONE step
 *  
 * @returns {undefined}
 */
SourceThread.prototype.executeStep = function(setMarks = true) {
    if (this.state == Thread.STATE_SYNCING) {
        return;
    }

    if ( this.state == Thread.STATE_WAITING ) {
        if ( !AbbozzaInterpreter.isThreadRunning(this.waitingFor)) {
            this.state == Thread.STATE_OK;
        } else {
            return;
        }
    }
    
    this.globalInterpreter.stateStack = this.interpreter.stateStack;
    
    if ( this.globalInterpreter.stateStack.length ) {
        try {
            var node = this.globalInterpreter.stateStack[this.globalInterpreter.stateStack.length-1].node;
            var spos = Abbozza.sourceEditor.getDoc().posFromIndex(node.start);
            var epos = Abbozza.sourceEditor.getDoc().posFromIndex(node.end);
            if (setMarks) {
                if (this.mark) this.mark.clear();
                this.mark = Abbozza.sourceEditor.getDoc().markText(spos, epos, {className: "sourceMarker"});
            }
            var stepped = this.globalInterpreter.step();
            
            if (!stepped) {
                this.state = Thread.STATE_FINISHED;
                if (this.mark) this.mark.clear();
            }
        } catch (e) {
            this.state = Thread.STATE_ABORTED;
            if (setMarks) {
                if (this.mark) {
                    this.mark.clear(); 
                    this.mark = Abbozza.sourceEditor.getDoc().markText(spos, epos, {className: "sourceErrorMarker"});
                }
            }
        }
    } else {
        this.state = Thread.STATE_FINISHED;
        return;
    }   
};

SourceThread.prototype.cleanUp = function () {
}


SourceThread.prototype.isRunning = function () {
    return (this.state <= 3);
}

SourceThread.prototype.syncWithThread = function (thread) {
}

/**
 * 
 * @param {type} thread
 * @returns {undefined}
 */
SourceThread.prototype.releaseSync = function (thread) {
}

