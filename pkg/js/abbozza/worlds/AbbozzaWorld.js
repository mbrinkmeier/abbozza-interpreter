function AbbozzaWorld(id) {
    this.id = id;
};

AbbozzaWorld.prototype._init = function() {
    if ( this.init ) {
        this.init();
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


AbbozzaWorld.prototype._onStart = function() {
    if ( this.onStart ) this.onStart();
    if ( Task && Task.onStart ) Task.onStart(this);
};

AbbozzaWorld.prototype._onStop = function() {
    if ( this.onStop ) this.onStop();
    if ( Task && Task.onStop ) Task.onStop(this);
};

AbbozzaWorld.prototype._onError = function() {
    if ( this.onError ) this.onError();
    if ( Task && Task.onError ) Task.onError(this);
};

AbbozzaWorld.prototype._onStep = function() {
    if ( this.onStep ) this.onStep();
    if ( Task && Task.onStep ) Task.onStep(this);
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
