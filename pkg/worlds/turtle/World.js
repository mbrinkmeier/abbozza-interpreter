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

World.initView = function (view) {
    this.turtle = new Turtle(view);
    // Abbozza.splitter.addEventListener("splitter_resize", this.resize);
    this.turtle.parent_.tabIndex = "0";
    this._activateKeyboard(this.turtle.parent_);
};

World.resize = function (event) {
    World.turtle.resize();
};

World.resetWorld = function () {
    World.turtle.reset();
};

World.saveCanvas = function () {
    var but = document.getElementById("saveHelper");
    var canvas = World.turtle.view_;
    var context = canvas.getContext("2d");
    but.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    but.click();
}

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
    // this.view_.width = 1000;
    // this.view_.height = 1000;


    this.turtle_layer_ = document.createElement("div");
    this.turtle_layer_.turtle = this;
    this.parent_.appendChild(this.turtle_layer_);
    this.turtle_layer_.className = "turtleInt";

    this.svg_ = document.createElementNS(svgNS, "svg");
    this.svg_.className = "turtleIntSvg";
    this.turtle_layer_.appendChild(this.svg_);
    this.svg_.setAttribute("width", this.turtle_layer_.offsetWidth);
    this.svg_.setAttribute("height", this.turtle_layer_.offsetHeight);

    this.reset();
}
;





Turtle.prototype.reset = function () {
    var child = this.svg_.firstChild;
    while (child) {
        this.svg_.removeChild(child);
        child = this.svg_.firstChild;
    }

    this.turtle_svg_ = document.createElementNS(svgNS, "path");
    this.turtle_svg_.setAttribute("stroke-width", "3");
    this.turtle_svg_.setAttribute("fill", "none");

    // Reset context
    this.view_.width = this.parent_.clientWidth;
    this.view_.height = this.parent_.clientHeight;

    this.svg_.setAttribute("width", this.view_.offsetWidth + "px");
    this.svg_.setAttribute("height", this.view_.offsetHeight + "px");
    this.svg_.setAttribute("viewBox", "0 0 " + this.view_.offsetWidth + " " + this.view_.offsetHeight);

    this.BBoxminX = -40; // -this.view_.scrollWidth/2;
    this.BBoxmaxX = 40; // -this.BBoxminX;
    this.BBoxminY = -40; // -this.view_.scrollHeight/2;
    this.BBoxmaxY = 40; // -this.BBoxminY;
    this.offsetX = (this.view_.offsetWidth - 80) / 2;
    this.offsetY = (this.view_.offsetHeight - 80) / 2;

    this.turtle_penDown = true;
    this.turtle_hidden = false;
    this.turtle_x = 0;
    this.turtle_y = 0;
    this.turtle_dx = 0;
    this.turtle_dy = -1;
    this.turtle_dir = 270;
    this.turtle_color = "black";
    this.turtle_width = 1;

    this.context_.fillStyle = "white";
    this.context_.fillRect(0, 0, this.view_.width, this.view_.height);
    this.context_.lineWidth = 1;
    this.context_.strokeStyle = "black";

    this.updateTurtle(true);

    this.svg_.appendChild(this.turtle_svg_);
};


Turtle.prototype.resize = function () {
    this.updateTurtle();
}

Turtle.prototype.resizeCanvas = function (newW, newH, deltaX, deltaY) {
    var oldW = this.view_.offsetWidth;
    var oldH = this.view_.offsetHeight;
    var data = this.context_.getImageData(0, 0, oldW, oldH);

    // Reset context
    this.view_.width = newW;
    this.view_.height = newH;

    this.svg_.setAttribute("width", this.view_.offsetWidth + "px");
    this.svg_.setAttribute("height", this.view_.offsetHeight + "px");
    this.svg_.setAttribute("viewBox", "0 0 " + this.view_.offsetWidth + " " + this.view_.offsetHeight);

    this.context_.putImageData(data, Math.round(deltaX), Math.round(deltaY));
}



Turtle.prototype.updateTurtle = function (penChanged = false) {
    var dx = 0;
    var dy = 0;

    var oldW = this.BBoxmaxX - this.BBoxminX;
    var oldH = this.BBoxmaxY - this.BBoxminY;

    // Resize bounding box and store shift
    if (this.turtle_x < this.BBoxminX + 40) {
        dx = -(this.turtle_x - 40) + this.BBoxminX;
        this.BBoxminX = this.turtle_x - 40;
    }
    if (this.turtle_x > this.BBoxmaxX - 40)
        this.BBoxmaxX = this.turtle_x + 40;
    if (this.turtle_y < this.BBoxminY + 40) {
        dy = -(this.turtle_y - 40) + this.BBoxminY;
        this.BBoxminY = this.turtle_y - 40;
    }
    if (this.turtle_y > this.BBoxmaxY - 40)
        this.BBoxmaxY = this.turtle_y + 40;

    var newW = this.BBoxmaxX - this.BBoxminX;
    var newH = this.BBoxmaxY - this.BBoxminY;

    if (newW < this.view_.offsetWidth) {
        dx = ((this.view_.offsetWidth - newW) / 2 - this.BBoxminX - this.offsetX);
        this.offsetX = (this.view_.offsetWidth - newW) / 2 - this.BBoxminX;
        newW = this.view_.offsetWidth;
    } else {
        dx = (-this.BBoxminX - this.offsetX);
        this.offsetX = -this.BBoxminX;
    }

    if (newH < this.view_.offsetHeight) {
        dy = ((this.view_.offsetHeight - newH) / 2 - this.BBoxminY - this.offsetY);
        this.offsetY = (this.view_.offsetHeight - newH) / 2 - this.BBoxminY;
        newH = this.view_.offsetHeight;
    } else {
        dy = -this.BBoxminY - this.offsetY;
        this.offsetY = -this.BBoxminY;
    }

    if ((newH != this.view_.offsetWidth) || (newW != this.view_.offsetHeight)) {
        this.resizeCanvas(newW, newH, dx, dy);
    }


    if (penChanged) {
        var path = "m -10 0 a 10 10 0 0 1 20 0 a 10 10 0 0 1 -20 0 m 20 0 l -10 0";
        if (this.turtle_penDown) {
            path = path + " m -3 0 a 3 3 0 0 1 6 0 a 3 3 0 0 1 -6 0";
        }
        this.turtle_svg_.setAttribute("d", path);
    }

    this.turtle_svg_.setAttribute("stroke", this.turtle_color);
    var transform = "";
    var x = Number(this.turtle_x) + this.offsetX; // - this.BBoxminX;
    var y = Number(this.turtle_y) + this.offsetY; // - this.BBoxminY;

    transform = transform + " translate(" + x + "," + y + ")";
    transform = transform + " rotate(" + Number(this.turtle_dir) + ")";
    this.turtle_svg_.setAttribute("transform", transform);
}


Turtle.prototype.setTurtlePos = function (x, y) {
    this.turtle_x = x;
    this.turtle_y = y;
    this.updateTurtle();
}

Turtle.prototype.setTurtleDir = function (dir) {
    this.turtle_dir = dir;
    while (this.turtle_dir < 0)
        this.turtle_dir = this.turtle_dir + 360;
    this.turtle_dir = this.turtle_dir % 360;
    this.turtle_dx = Math.cos(this.turtle_dir * Math.PI / 180);
    this.turtle_dy = Math.sin(this.turtle_dir * Math.PI / 180);

    this.updateTurtle();
}

Turtle.prototype.setTurtleColor = function (color) {
    this.turtle_color = color;
    this.updateTurtle(true);
}


Turtle.prototype.newPath = function () {
}


Turtle.prototype.clear = function () {
    this.view_.width = this.parent_.clientWidth;
    this.view_.height = this.parent_.clientHeight;
    this.context_.fillStyle = "white";
    this.context_.fillRect(0, 0, this.view_.width, this.view_.height);
}

Turtle.prototype.forward = function (dist) {

    var x = this.turtle_x;
    var y = this.turtle_y;

    this.turtle_x = this.turtle_x + this.turtle_dx * dist;
    this.turtle_y = this.turtle_y + this.turtle_dy * dist;
    this.updateTurtle();
    this.context_.strokeStyle = this.turtle_color;
    this.context_.lineWidth = this.turtle_width;

    this.context_.beginPath();
    // this.context_.moveTo(x -this.BBoxminX,y - this.BBoxminY);
    this.context_.moveTo(x + this.offsetX, y + this.offsetY);

    if (this.turtle_penDown) {
        // this.context_.lineTo(this.turtle_x -this.BBoxminX,this.turtle_y - this.BBoxminY);
        this.context_.lineTo(this.turtle_x + this.offsetX, this.turtle_y + this.offsetY);
    } else {
        this.context_.moveTo(this.turtle_x + this.offsetX, this.turtle_y + this.offsetY);
    }

    this.context_.stroke();
}


Turtle.prototype.backward = function (dist) {
    this.forward(-1.0 * dist);
}


Turtle.prototype.turn = function (angle) {
    this.setTurtleDir(this.turtle_dir - angle);
    this.updateTurtle();
}

Turtle.prototype.turnLeft = function (angle) {
    this.setTurtleDir(this.turtle_dir - angle);
    this.updateTurtle();
}

Turtle.prototype.turnRight = function (angle) {
    this.setTurtleDir(this.turtle_dir + angle);
    this.updateTurtle();
}


Turtle.prototype.setDirection = function (angle) {
    this.setTurtleDir(360 - angle);
    this.updateTurtle();
}


Turtle.prototype.setColor = function (color) {
    this.turtle_color = color;
    this.newPath();
    this.setTurtleColor(color);
}

Turtle.prototype.setRGBColor = function (red, green, blue) {
    var color = "rgb(" + red + "," + green + "," + blue + ")";
    this.turtle_color = color;
    this.newPath();
    this.setTurtleColor(color);
}

Turtle.prototype.penUp = function () {
    this.newPath();
    this.turtle_penDown = false;
    this.updateTurtle(true);
}

Turtle.prototype.penDown = function () {
    this.newPath();
    this.turtle_penDown = true;
    this.updateTurtle(true);
}


Turtle.prototype.hide = function () {
    this.turtle_hidden = true;
    this.turtle_svg_.style.display = "none";
    this.updateTurtle();
}

Turtle.prototype.show = function () {
    this.turtle_hidden = false;
    this.turtle_svg_.style.display = "block";
    this.updateTurtle();
}


Turtle.prototype.setWidth = function (width) {
    this.newPath();
    this.turtle_width = width;
    this.context_.lineWidth = width;
    this.updateTurtle();
}


Turtle.prototype.getX = function () {
    return Math.round(this.turtle_x);
}

Turtle.prototype.getY = function () {
    return Math.round(this.turtle_y);
}

Turtle.prototype.getDirection = function () {
    return (360 - this.turtle_dir) % 360;
}

Turtle.prototype.getWidth = function () {
    return this.turtle_width;
}

Turtle.prototype.getColor = function () {
    return this.turtle_color;
}

Turtle.prototype.isHidden = function () {
    return this.turtle_hidden;
}

Turtle.prototype.isPenDown = function () {
    return this.turtle_penDown;
}

Turtle.prototype.getPixelRed = function () {
    var pixel = this.context_.getImageData(this.turtle_x + this.offsetX, this.turtle_y + this.offsetY, 1, 1)[0];
}

Turtle.prototype.getPixelGreen = function () {
    var pixel = this.context_.getImageData(this.turtle_x + this.offsetX, this.turtle_y + this.offsetY, 1, 1)[1];
}

Turtle.prototype.getPixelBlue = function () {
    var pixel = this.context_.getImageData(this.turtle_x + this.offsetX, this.turtle_y + this.offsetY, 1, 1)[2];
}


World.wrapper = function (func, args) {
    return func.apply(World.turtle, args);
}


World.createWrapper = function (func) {
    return function (arg) {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        return World.wrapper(World.turtle[func], args);
    }
}

World.initSourceInterpreter = function (interpreter, scope) {
    var funcs = [
        'reset', 'clear', 'forward', 'backward', 'turn', 'turnLeft', 'turnRight', 'setDirection', 'setColor', 'penUp', 'penDown',
        'hide', 'show', 'setWidth', 'setColor', 'setRGBColor', 'getX', 'getY', 'getDirection', 'getWidth',
        'getColor', 'isHidden', 'isPenDown', 'getPixelRed', 'getPixelGreen',
        'getPixelBlue'
    ];
    AbbozzaInterpreter.createNativeWrappersByName(interpreter,scope,World.turtle,funcs);
    /*
    for (var i = 0; i < funcs.length; i++) {
        interpreter.setProperty(scope, funcs[i],
                AbbozzaInterpreter.createWrapper(interpreter,false,World.turtle,World.turtle[funcs[i]])
                        // interpreter.createNativeFunction(World.createWrapper(funcs[i]))
                );
    }
    */
}

