/* 
 * Copyright 2018 Michael Brinkmeier (mbrinkmeier@uni-osnabrueck.de).
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
 * The Context object. It wraps the Viewer and provides basic functionality.
 * 
 * @type type
 */
var World = new AbbozzaWorld("turtle");

World.init = function() {
    this.turtle = new Turtle(document.getElementById('.topleft'));
    Abbozza.splitter.addEventListener("splitter_resize", this.resize);
    this.turtle.parent_.tabIndex="0";
    this._activateKeyboard(this.turtle.parent_);
};
    
World.resize = function(event) { 
    World.turtle.reset();
};
    
World.reset = function() {
    World.turtle.reset();
};

var svgNS = "http://www.w3.org/2000/svg";

/**
 * The turtle as view for the context.
 */

function Turtle(view) {
    this.wrapper_ = view;
    
    this.parent_ = document.createElement("div");
    this.parent_.className = "turtleParent";
    view.appendChild(this.parent_);
    
    this.view_ = document.createElement("canvas");
    this.view_.turtle = this;
    this.view_.className = "turtleIntCanvas";
    this.parent_.appendChild(this.view_);
    this.context_ = this.view_.getContext("2d");

    this.turtle_layer_ = document.createElement("div");
    this.turtle_layer_.turtle = this;
    this.parent_.appendChild(this.turtle_layer_);
    this.turtle_layer_.className = "turtleInt";

    this.svg_ = document.createElementNS(svgNS,"svg");
    this.svg_.className = "turtleIntSvg";
    this.turtle_layer_.appendChild(this.svg_);    
    this.svg_.setAttribute("width",this.turtle_layer_.offsetWidth);
    this.svg_.setAttribute("height",this.turtle_layer_.offsetHeight);
        
    this.reset();
};



Turtle.prototype.reset = function() {
    var child = this.svg_.firstChild;
    while ( child ) {
        this.svg_.removeChild(child);
        child = this.svg_.firstChild;
    }
        
    this.turtle_svg_ = document.createElementNS(svgNS,"path");
    this.turtle_svg_.setAttribute("stroke-width","3");
    this.turtle_svg_.setAttribute("fill","none");
    
    // Reset context
    this.view_.width = this.parent_.clientWidth;
    this.view_.height = this.parent_.clientHeight;
    
    this.turtle_penDown = true;
    this.turtle_hidden = false;
    this.turtle_x = this.view_.scrollWidth/2;
    this.turtle_y = this.view_.scrollHeight/2;
    this.turtle_dx = 0;
    this.turtle_dy = -1;
    this.turtle_dir = 270;
    this.turtle_color = "black";
    this.turtle_width = 1;
    
    this.context_.fillStyle = "white";
    this.context_.fillRect(0,0,this.view_.width,this.view_.height);
    this.context_.lineWidth = 1;
    this.context_.strokeStyle = "black";
    
    // this.currentPath_ = document.createElementNS(svgNS,"path");
    // this.currentPath_.setAttribute("stroke-width",this.turtle_width);
    // this.currentPath_.setAttribute("stroke","black");
    // this.currentPath_.setAttribute("d","M " + (this.view_.offsetWidth/2) + " " +  (this.view_.offsetHeight/2));
    
    // this.svg_.appendChild(this.currentPath_);
   
    this.updateTurtle();
    
    this.svg_.appendChild(this.turtle_svg_);
};



Turtle.prototype.updateTurtle = function() {
    var path = "m -10 0 a 10 10 0 0 1 20 0 a 10 10 0 0 1 -20 0 m 20 0 l -10 0";
    if ( this.turtle_penDown ) {
        path = path + " m -3 0 a 3 3 0 0 1 6 0 a 3 3 0 0 1 -6 0";
    }
    
    this.turtle_svg_.setAttribute("d",path);
    this.turtle_svg_.setAttribute("stroke",this.turtle_color);
    var transform = "";
    transform = transform + " translate(" + Number(this.turtle_x) + "," + Number(this.turtle_y) + ")";
    transform = transform + " rotate(" + Number(this.turtle_dir) + ")";
    this.turtle_svg_.setAttribute("transform", transform);
}


Turtle.prototype.setTurtlePos = function(x,y) {
    this.turtle_x = x;
    this.turtle_y = y;
    this.updateTurtle();
}

Turtle.prototype.setTurtleDir = function(dir) {
    this.turtle_dir = dir;
    while ( this.turtle_dir < 0 ) 
        this.turtle_dir = this.turtle_dir + 360;
    this.turtle_dir = this.turtle_dir % 360;
    this.turtle_dx = Math.cos(this.turtle_dir * Math.PI / 180);
    this.turtle_dy = Math.sin(this.turtle_dir * Math.PI / 180);
    
    this.updateTurtle();
}

Turtle.prototype.setTurtleColor = function(color) {
    this.turtle_color = color;
    this.updateTurtle();
}


Turtle.prototype.newPath = function() {
    /*
    var newPath = document.createElementNS(svgNS,"path");
    newPath.setAttribute("stroke-width",this.turtle_width);
    newPath.setAttribute("stroke",this.turtle_color);
    newPath.setAttribute("d","M " + (this.turtle_x) + " " +  (this.turtle_y));    
    
    this.svg_.insertBefore(newPath,this.currentPath_);
    this.currentPath_ = newPath;
    */
    // this.context_.stroke();
    // this.context_.strokeStyle = this.turtle_color;
    // this.context_.lineWidth = this.turtle_width;
    // this.context_.beginPath();
}


Turtle.prototype.clear = function() {
    this.view_.width = this.parent_.clientWidth;
    this.view_.height = this.parent_.clientHeight;
    this.context_.fillStyle = "white";
    this.context_.fillRect(0,0,this.view_.width,this.view_.height);    
}

Turtle.prototype.forward = function(dist) {
    this.context_.strokeStyle = this.turtle_color;
    this.context_.lineWidth = this.turtle_width;
    
    this.context_.beginPath();
    this.context_.moveTo(this.turtle_x,this.turtle_y);
 
    // var path = this.currentPath_.getAttribute("d");
    this.turtle_x = this.turtle_x + this.turtle_dx * dist;
    this.turtle_y = this.turtle_y + this.turtle_dy * dist;
    if ( this.turtle_penDown ) {
        this.context_.lineTo(this.turtle_x,this.turtle_y);
        // path = path + " L " + this.turtle_x + " " + this.turtle_y;
    } else {
        this.context_.moveTo(this.turtle_x,this.turtle_y);
        // path = path + " M " + this.turtle_x + " " + this.turtle_y;
    }
    // this.currentPath_.setAttribute("d",path);
 
    this.context_.stroke();
    
    this.updateTurtle();
}

Turtle.prototype.turn = function(angle) {
    this.setTurtleDir(this.turtle_dir-angle);
    this.updateTurtle();
}

Turtle.prototype.setDirection = function(angle) {
    this.setTurtleDir(360-angle);
    this.updateTurtle();
}


Turtle.prototype.setColor = function(color) {
    this.turtle_color = color;
    this.newPath();
    this.setTurtleColor(color);
}

Turtle.prototype.setRGBColor = function(red,green,blue) {
    var color = "rgb(" + red + "," + green + "," + blue + ")";
    console.log(color);
    this.turtle_color = color;
    this.newPath();
    this.setTurtleColor(color);
}

Turtle.prototype.penUp = function() {
    this.newPath();
    this.turtle_penDown = false;
    this.updateTurtle();
}

Turtle.prototype.penDown = function() {
    this.newPath();
    this.turtle_penDown = true;
    this.updateTurtle();    
}


Turtle.prototype.hide = function () {
    this.turtle_hidden = true;
    this.turtle_svg_.style.display="none";
    this.updateTurtle();
}

Turtle.prototype.show = function () {
    this.turtle_hidden = false;
    this.turtle_svg_.style.display="block";
    this.updateTurtle();    
}


Turtle.prototype.setWidth = function (width) {
    this.newPath();
    this.turtle_width = width;
    this.context_.lineWidth = width;
    this.updateTurtle();    
}


Turtle.prototype.getX = function() {
    return Math.round(this.turtle_x);
}

Turtle.prototype.getY = function() {
    return Math.round(this.turtle_y);
}

Turtle.prototype.getDirection = function() {
    return (360 - this.turtle_dir) % 360;
}

Turtle.prototype.getWidth = function() {
    return this.turtle_width;
}

Turtle.prototype.getColor = function() {
    return this.turtle_color;
}

Turtle.prototype.isHidden = function() {
    return this.turtle_hidden;
}

Turtle.prototype.isPenDown = function() {
    return this.turtle_penDown;
}

Turtle.prototype.getPixelRed = function() {
    var pixel = this.context_.getImageData(this.turtle_x,this.turtle_y,1,1)[0];
}

Turtle.prototype.getPixelGreen = function() {
    var pixel = this.context_.getImageData(this.turtle_x,this.turtle_y,1,1)[1];
}

Turtle.prototype.getPixelBlue = function() {
    var pixel = this.context_.getImageData(this.turtle_x,this.turtle_y,1,1)[2];
}


World.wrapper = function(func,args) {
    return func.apply(World.turtle,args);
}


World.createWrapper = function(func) {
    return function(arg) {
        var args= [];
        for ( var i = 0 ; i < arguments.length; i++ ) {
            args[i] = arguments[i];
        }
        return World.wrapper(World.turtle[func],args);        
    }
}

World.initSourceInterpreter = function(interpreter,scope) {
    var funcs = [
      'reset','clear','forward','turn','setDirection','setColor','penUp','penDown',
      'hide','show','setWidth','setColor','setRGBColor','getX','getY','getDirection','getWidth',
      'getColor','isHidden','isPenDown','getPixelRed','getPixelGreen',
      'getPixelBlue'
    ];
    for ( var i = 0; i < funcs.length; i++ ) {
        interpreter.setProperty(scope,funcs[i],
            interpreter.createNativeFunction( World.createWrapper(funcs[i]) )
        );        
    }
}

