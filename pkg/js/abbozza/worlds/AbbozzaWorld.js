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

function AbbozzaWorld(id) {
    this.id = id;
}
;

AbbozzaWorld.prototype._init = function (view) {
    if (this.init) {
        this.init(view);
    }
};

AbbozzaWorld.prototype.getId = function () {
    return this.id;
};

AbbozzaWorld.prototype.getInfo = function () {
    return this.id;
};


/**
 * These operations can be overwritten to implement a standard behavior of the
 * wordl.
 * 
 * reset() is called if th wolrd is loaded , even before sketch is started
 * start() is called if a sketch is started
 * step() is called every time a step os a sketch is executed
 * stop() is called if the sketch terminates (either by error or regularly)
 */
AbbozzaWorld.prototype.reset = function () {};
AbbozzaWorld.prototype.start = function () {};
AbbozzaWorld.prototype.step = function () {};
AbbozzaWorld.prototype.stop = function () {};

AbbozzaWorld.prototype.error = function (exception) {
    if (exception) {
        Abbozza.openOverlay(exception[1]);
        Abbozza.overlayWaitForClose();
    }
}

/**
 * This handler is called if the excution of a program starts.
 * 
 * @returns {undefined}
 */
AbbozzaWorld.prototype._onStart = function () {
    this.start();
    if (World.onStart)
        World.onStart();
    if (Task && Task.onStart)
        Task.onStart();
    if (Page && Page.onStart)
        Page.onStart();
    document.dispatchEvent(new CustomEvent("abz_start"));
};

/**
 * This handler is called if the execution of a program terminated regularly
 * 
 * @returns {undefined}
 */
AbbozzaWorld.prototype._onStop = function () {
    this.stop();
    if (World.onStop)
        World.onStop();
    if (Task && Task.onStop)
        Task.onStop();
    if (Page && Page.onStop)
        Page.onStop();
    document.dispatchEvent(new CustomEvent("abz_stop"));
};

/**
 * This handler is called if the execution of a programm way ended by an error
 * 
 * @returns {undefined}
 */
AbbozzaWorld.prototype._onError = function (exception) {
    if (World.onError)
        World.onError();
    if (Task && Task.onError)
        Task.onError();
    if (Page && Page.onError)
        Page.onError();
    document.dispatchEvent(new CustomEvent("abz_error"));
    if (exception) {
        World.error(exception);
    }
};

/**
 * This handler is callex after a step of an execution was performed
 * @returns {undefined}
 */
AbbozzaWorld.prototype._onStep = function () {
    this.step();
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



AbbozzaWorld.prototype._initSourceInterpreter = function (interpreter, scope) {
    var wrapper;
    interpreter.setProperty(scope, "getPressedKey", interpreter.createNativeFunction(World.getPressedKey));
    interpreter.setProperty(scope, "getLastKey", interpreter.createNativeFunction(World.getLastKey));

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

    // Do global initialization of interpreter
    if (World.initSourceInterpreter) {
        World.initSourceInterpreter(interpreter, scope);
    }
}


AbbozzaWorld.prototype._activateKeyboard = function (view) {
    World.curKey = "";
    World.lastKey = "";
    view.addEventListener("keydown", this.onKeyDown);
    view.addEventListener("keyup", this.onKeyUp);
}

AbbozzaWorld.prototype.onKeyDown = function (event) {
    World.curKey = World.getKeyString(event);
}

AbbozzaWorld.prototype.onKeyUp = function (event) {
    World.lastKey = World.curKey;
    World.curKey = "";
}


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

AbbozzaWorld.prototype.getPressedKey = function () {
    return World.curKey;
}

AbbozzaWorld.prototype.getLastKey = function () {
    var val = World.lastKey;
    World.lastKey = "";
    return val;
}
