function AbbozzaWorld(id) {
    this.id = id;
};

AbbozzaWorld.prototype.init = function() {    
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
}

AbbozzaWorld.prototype._onStop = function() {
    if ( this.onStop ) this.onStop();
    if ( Task && Task.onStop ) Task.onStop(this);
}

AbbozzaWorld.prototype._onError = function() {
    if ( this.onError ) this.onError();
    if ( Task && Task.onError ) Task.onError(this);
}

AbbozzaWorld.prototype._onStep = function() {
    if ( this.onStep ) this.onStep();
    if ( Task && Task.onStep ) Task.onStep(this);
}