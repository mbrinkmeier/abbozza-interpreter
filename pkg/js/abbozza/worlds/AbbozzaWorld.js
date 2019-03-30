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
 * This prototype provides various functionalities required by an abbozza! world.
 * 
 * The following handlers for various events can be defined.
 * 
 * World.onReset() is triggered if the World is reset, eg. if a new program 
 *                 execution starts or if the world is initialized
 *                  
 * World.onStart() is triggered if a new program execution is started.
 * 
 * World.onStep() is triggered after each execution step of the program
 * 
 * World.onTerminate() is triggered if the program terminates regularly
 * 
 * World.onError() us triggered if the program aborts with an error
 */


/**
 * 
 * @param {type} id
 * @returns {AbbozzaWorld}
 */
function AbbozzaWorld(id) {
    this.id = id;
    this.worldDoms = null;
};


/**
 * This operation has to be called to initialize the world and its view.
 * 
 * @param {type} view
 * @returns {undefined}
 */
AbbozzaWorld.prototype.init = function (view) {
    if (this.initView) {
        this.initView(view);
    }
    if ( this.onInit ) {
        this.onInit();
    }
};


/**
 * This abstract operation can be overloaded to initialize the view.
 * IT is called once during the initialization;
 * 
 * @param {type} view
 * @returns {undefined}
 */
AbbozzaWorld.prototype.initView = function(view) {}


/**
 * Returns the id of the world
 * 
 * @returns {string} The id
 */
AbbozzaWorld.prototype.getId = function () {
    return this.id;
};

/**
 * Returns the info textof the world.
 * 
 * @returns {string} The info text for the world
 */
AbbozzaWorld.prototype.getInfo = function() {
    return this.id;
};


AbbozzaWorld.prototype.purgeHooks = function() {
    this.onReset = null;
    this.onStart = null;
    this.onStep = null;
    this.onTerminate = null;
    this.onError = null;
}


AbbozzaWorld.prototype.setWorldDom = function(worlds) {
    this.worldDoms = worlds;
}

/**
 * This handler is called if the excution of a program starts.
 * 
 * @returns {undefined}
 */
AbbozzaWorld.prototype.reset = function() {
    // First do the stuff the world always has to do
    this.resetWorld();
    
    // Check the dom and resore the world
    if ( this.worldDoms && Abbozza.worldFromDom ) {
        for (var idx = 0; idx < this.worldDoms.length; idx++) {
            Abbozza.worldFromDom(this.worldDoms[idx]);
        }        
    }
    
    // Now the dom is overriden or modified by the tasks hooks
    if (World.onReset)
        World.onReset();
    if (Task && Task.onReset)
        Task.onReset();
    if (Page && Page.onReset)
        Page.onReset();
    
    document.dispatchEvent(new CustomEvent("abz_reset"));
};

/**
 * This operation may be overriden to implement a world specific reset behavior
 * @returns {undefined}
 */
AbbozzaWorld.prototype.resetWorld = function() {};


/**
 * This handler is called if the excution of a program starts.
 */
AbbozzaWorld.prototype.start = function() {
    this.startWorld();
    if (World.onStart)
        World.onStart();
    if (Task && Task.onStart)
        Task.onStart();
    if (Page && Page.onStart)
        Page.onStart();
    document.dispatchEvent(new CustomEvent("abz_start"));
};

/**
 * This operation may be overriden to implement a world specific start behavior
 */
AbbozzaWorld.prototype.startWorld = function() {};


/**
 * This handler is called if the execution of a program is terminated regularly
 * 
 * @returns {boolean} true if the Program end mesage should be displayed.
 */
AbbozzaWorld.prototype.terminate = function () {
    var show = true;
    this.terminateWorld();
    if (World.onTerminate)
        show = show & World.onTerminate();
    if (Task && Task.onTerminate)
        show = show & Task.onTerminate();
    if (Page && Page.onTerminate)
        show = show & Page.onTerminate();
    document.dispatchEvent(new CustomEvent("abz_fnished"));
    return show;
};

/**
 * This operation may be overriden to implement a world specific terminate behavior
 */
AbbozzaWorld.prototype.terminateWorld = function() {};


/**
 * This handler is called if the execution of a programm way ended by an error
 * 
 * @returns {undefined}
 */
AbbozzaWorld.prototype.error = function(exception) {
    this.errorWorld(exception);
    if (World.onError)
        World.onError();
    if (Task && Task.onError)
        Task.onError();
    if (Page && Page.onError)
        Page.onError();
    document.dispatchEvent(new CustomEvent("abz_error"));
    if (exception) {
        Abbozza.openOverlay(exception[1]);
        Abbozza.overlayWaitForClose();
    }
};

/**
 * This operation may be overriden to implement a world specific error behavior
 */
AbbozzaWorld.prototype.errorWorld = function() {};


/**
 * This handler is callex after a step of an execution was performed
 * @returns {undefined}
 */
AbbozzaWorld.prototype.step = function () {
    this.stepWorld();
    var result = true;
    if (World.onStep)
        result = result && World.onStep();
    if (Task && Task.onStep)
        result = result && Task.onStep();
    if (Page && Page.onStep)
        result = result && Page.onStep();
    document.dispatchEvent(new CustomEvent("abz_step"));
    return result;
};

/**
 * This operation may be overriden to implement a world specific error behavior
 */
AbbozzaWorld.prototype.stepWorld = function() {};

/**
 * Create the wrappers for datastructures.
 * 
 * @param {type} interpreter
 * @param {type} scope
 * @returns {undefined}
 */
AbbozzaWorld.prototype._initSourceInterpreter = function (interpreter, scope) {
    var wrapper;
    interpreter.setProperty(scope, "getPressedKey", interpreter.createNativeFunction(World.getPressedKey));
    interpreter.setProperty(scope, "getLastKey", interpreter.createNativeFunction(World.getLastKey));

    // Add the functions for WS communication
    AbbozzaInterpreter.createWrappers(interpreter,scope,
        [
            ["WSopen",false,WebSocket,WebSocket.open],
            ["WSclose",false,WebSocket,WebSocket.close],
            ["WSisAvailable",false,WebSocket,WebSocket.isAvailable],
            ["WSsend",false,WebSocket,WebSocket.sendln],
            ["WSreadln",false,WebSocket,WebSocket.getLine],
            ["WSreadAll",false,WebSocket,WebSocket.getAll],
            ["WSsendByte",false,WebSocket,WebSocket.sendByte],
            ["WSreadByte",false,WebSocket,WebSocket.getByte]
        ]);
    
    // Stack constructor.
    var stackWrapper = function () {
        if (interpreter.calledWithNew()) {
            // Called as new Stack().
            this.data = new Stack();
            return this;
        } else {
            return null;
        }
    };
    interpreter.STACK = interpreter.createNativeFunction(stackWrapper, true);
    interpreter.setProperty(scope, 'Stack', interpreter.STACK);
    
    wrapper = function() {
        return this.data.isEmpty();
    };
    interpreter.setNativeFunctionPrototype(this.STACK, 'isEmpty', wrapper);

    wrapper = function(value) {
        this.data.push(value);
    };
    interpreter.setNativeFunctionPrototype(this.STACK, 'push', wrapper);

    wrapper = function() {
        return this.data.pop();
    };
    interpreter.setNativeFunctionPrototype(this.STACK, 'pop', wrapper);

    wrapper = function() {
        return this.data.top();
    };
    interpreter.setNativeFunctionPrototype(this.STACK, 'top', wrapper);

    
    var queueWrapper = function () {
        if (interpreter.calledWithNew()) {
            // Called as new Stack().
            this.data = new Queue();
            return this;
        }
    };
    interpreter.QUEUE = interpreter.createNativeFunction(queueWrapper, true);
    interpreter.setProperty(scope, 'Queue', interpreter.QUEUE);

    wrapper = function() {
        return this.data.isEmpty();
    };
    interpreter.setNativeFunctionPrototype(this.QUEUE, 'isEmpty', wrapper);

    wrapper = function(value) {
        this.data.enqueue(value);
    };
    interpreter.setNativeFunctionPrototype(this.QUEUE, 'enqueue', wrapper);

    wrapper = function() {
        return this.data.dequeue();
    };
    interpreter.setNativeFunctionPrototype(this.QUEUE, 'dequeue', wrapper);

    wrapper = function() {
        return this.data.head();
    };
    interpreter.setNativeFunctionPrototype(this.QUEUE, 'head', wrapper);

    var listWrapper = function() {
        if (interpreter.calledWithNew()) {
            // Called as new Stack().
            this.data = new List();
            return this;
        }
    };
    interpreter.LIST = interpreter.createNativeFunction(listWrapper, true);
    interpreter.setProperty(scope, 'List', interpreter.LIST);
    
    wrapper = function() {
        return this.data.isEmpty();
    };
    interpreter.setNativeFunctionPrototype(this.LIST, 'isEmpty', wrapper);

    wrapper = function(index) {
        return this.data.getItem(index);
    };
    interpreter.setNativeFunctionPrototype(this.LIST, 'getItem', wrapper);

    wrapper = function(value) {
        this.data.append(value);
    };
    interpreter.setNativeFunctionPrototype(this.LIST, 'append', wrapper);

    wrapper = function(index,value) {
        this.data.insertAt(index,value);
    };
    interpreter.setNativeFunctionPrototype(this.LIST, 'insertAt', wrapper);

    wrapper = function(index,value) {
        this.data.setItem(index,value);
    };
    interpreter.setNativeFunctionPrototype(this.LIST, 'setItem', wrapper);

    wrapper = function(index) {
        this.data.delete(index);
    };
    interpreter.setNativeFunctionPrototype(this.LIST, 'delete', wrapper);
        
    wrapper = function() {
        return this.data.getLength();
    };
    interpreter.setNativeFunctionPrototype(this.LIST, 'getLength', wrapper);


    var bintreeWrapper = function(value) {
        if (interpreter.calledWithNew()) {
            // Called as new Stack().
            this.data = new Bintree(value);
            return this;
        }
    };
    interpreter.BINTREE = interpreter.createNativeFunction(bintreeWrapper, true);
    interpreter.setProperty(scope, 'BinTree', interpreter.BINTREE);

    wrapper = function() {
        return this.data.getData();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'getData', wrapper);
    
    wrapper = function(value) {
        return this.data.setData(value);
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'setData', wrapper);

    wrapper = function(value) {
        return this.data.getLeftChild();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'getLeftChild', wrapper);

    wrapper = function(value) {
        return this.data.getRightChild();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'getRightChild', wrapper);

        wrapper = function(value) {
        return this.data.getParent();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'getParent', wrapper);

    wrapper = function(child) {
        this.data.setLeftChild(child);
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'setLeftChild', wrapper);

    wrapper = function(child) {
        this.data.setRightChild(child);
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'setRightChild', wrapper);

    wrapper = function() {
        this.data.deleteLeftChild();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'deleteLeftChild', wrapper);

    wrapper = function() {
        this.data.deleteRightChild();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'deleteRightChild', wrapper);

    wrapper = function() {
        return this.data.hasLeftChild();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'hasLeftChild', wrapper);

    wrapper = function() {
        return this.data.hasRightChild();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'hasRightChild', wrapper);

    wrapper = function() {
        return this.data.hasParent();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'hasParent', wrapper);

    wrapper = function() {
        return this.data.isLeaf();
    }
    interpreter.setNativeFunctionPrototype(this.BINTREE, 'isLeaf', wrapper);

    // Do global initialization of interpreter
    if (World.initSourceInterpreter) {
        World.initSourceInterpreter(interpreter, scope);
    }
}

/**
 * Activate the keyboard by adding the event handlers
 * 
 * @param {type} view
 * @returns {undefined}
 */
AbbozzaWorld.prototype._activateKeyboard = function (view) {
    World.curKey = "";
    World.lastKey = "";
    view.addEventListener("keydown", this.onKeyDown);
    view.addEventListener("keyup", this.onKeyUp);
}

/**
 * Handler for the KeyDown event
 * 
 * @param {type} event
 */
AbbozzaWorld.prototype.onKeyDown = function (event) {
    World.curKey = World.getKeyString(event);
}

/**
 * Handler for the KeyUp event
 * 
 * @param {type} event
 */
AbbozzaWorld.prototype.onKeyUp = function (event) {
    World.lastKey = World.curKey;
    World.curKey = "";
}

/**
 * Get the string describing the key given by the event
 * 
 * @param {type} event
 * @returns {String}
 */
AbbozzaWorld.prototype.getKeyString = function (event) {
    var val = event.key;
    if (event.shiftKey)
        val = "Shift+" + val;
    if (event.metaKey)
        val = "Meta+" + val;
    if (event.ctrlKey)
        val = "Ctrl+" + val;
    if (event.altKey)
        val = "Alt+" + val;
    return val;
}

/**
 * Get the currently pressed key
 * @returns {AbbozzaWorld.curKey|type.curKey|String}
 */
AbbozzaWorld.prototype.getPressedKey = function () {
    return this.curKey;
}

/**
 * Get the key that was pressed last.
 * @returns {type.lastKey|AbbozzaWorld.lastKey|String|AbbozzaWorld.curKey|type.curKey}
 */
AbbozzaWorld.prototype.getLastKey = function () {
    var val = this.lastKey;
    this.lastKey = "";
    return val;
}

/**
 * Add blocks to the list of possible variable declarations.
 * 
 * @param {type} list
 * @returns {undefined}
 */
AbbozzaWorld.prototype.addVariableBlocks = function(list) {
   return list; 
}