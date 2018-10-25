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
};

AbbozzaWorld.prototype._init = function(view) {
    if ( this.init ) {
        this.init(view);
    }
};

AbbozzaWorld.prototype.getId = function() {
    return this.id;
};

AbbozzaWorld.prototype.getInfo = function() {
    return this.id;
};

AbbozzaWorld.prototype.reset = function() {    
};

/**
 * This handler is called if the excution of a program starts.
 * 
 * @returns {undefined}
 */
AbbozzaWorld.prototype._onStart = function() {
    if ( World.onStart ) World.onStart();
    if ( Task && Task.onStart ) Task.onStart();
    if ( Page && Page.onStart ) Page.onStart();
    document.dispatchEvent(new CustomEvent("abz_start"));
};

/**
 * This handler is called if the execution of a program terminated regularly
 * 
 * @returns {undefined}
 */
AbbozzaWorld.prototype._onStop = function() {
    if ( World.onStop ) World.onStop();
    if ( Task && Task.onStop ) Task.onStop();
    if ( Page && Page.onStop ) Page.onStop();
    document.dispatchEvent(new CustomEvent("abz_stop"));
};

/**
 * This handler is called if the execution of a programm way ended by an error
 * 
 * @returns {undefined}
 */
AbbozzaWorld.prototype._onError = function() {
    if ( World.onError ) World.onError();
    if ( Task && Task.onError ) Task.onError();
    if ( Page && Page.onError ) Page.onError();
    document.dispatchEvent(new CustomEvent("abz_error"));
};

/**
 * This handler is callex after a step of an execution was performed
 * @returns {undefined}
 */
AbbozzaWorld.prototype._onStep = function() {
    var result = true;
    if ( World.onStep ) result = result && World.onStep();
    if ( Task && Task.onStep ) result = result && Task.onStep();
    if ( Page && Page.onStep ) result = result && Page.onStep();
    document.dispatchEvent(new CustomEvent("abz_step"));
    return result;
};



AbbozzaWorld.prototype._initSourceInterpreter = function(interpreter,scope) {
    interpreter.setProperty(scope,"getPressedKey",interpreter.createNativeFunction(World.getPressedKey));
    interpreter.setProperty(scope,"getLastKey",interpreter.createNativeFunction(World.getLastKey));

    // Do global initialization of interpreter
    if ( World.initSourceInterpreter) {
        World.initSourceInterpreter(interpreter,scope);
    }
}


AbbozzaWorld.prototype._activateKeyboard = function(view) {
    World.curKey = "";
    World.lastKey = "";
    view.addEventListener("keydown", this.onKeyDown);
    view.addEventListener("keyup", this.onKeyUp);
}

AbbozzaWorld.prototype.onKeyDown = function(event) {
    World.curKey = World.getKeyString(event);
}

AbbozzaWorld.prototype.onKeyUp = function(event) {
    World.lastKey = World.curKey; 
    World.curKey = "";
}


AbbozzaWorld.prototype.getKeyString = function(event) {
    var val = event.key;
    if (event.shiftKey) val = "Shift+"+val;
    if (event.metaKey) val = "Meta+"+val;
    if (event.ctrlKey) val = "Ctrl+"+val;
    if (event.altKey) val = "Alt+"+val;
    return val;
}

AbbozzaWorld.prototype.getPressedKey = function() {
    return World.curKey;
}

AbbozzaWorld.prototype.getLastKey = function() {
    var val = World.lastKey;
    World.lastKey = "";
    return val;
}
