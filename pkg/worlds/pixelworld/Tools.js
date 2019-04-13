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
 ** The class for Pixels 
 **/

Pixel = function(x,y) {
    this.x = x;
    this.y = y;
}

Pixel.prototype.getX = function() { return this.x; }
Pixel.prototype.getY = function() { return this.y; }
Pixel.prototype.setX = function(x) { this.x = x; }
Pixel.prototype.setY = function(y) { this.y = y; }
Pixel.prototype.setColor = function(color) { World.pixelworld.set(this,color); }
Pixel.prototype.getColor = function() { return World.pixelworld.getColor(this); }

Pixel.createWrapper = function(name) {
    var funcName = name;
    var func = Pixel.prototype[funcName];
    return function() {
        return func.apply(this.data,Array.from(arguments));
    }
}

Pixel.setColorWrapper = function(color) {
    // Speed run has to stop for update of view
    AbbozzaInterpreter.currentThread.nonBlocking = true;
    this.data.setColor(color.data);
}

Pixel.createGetColorWrapper = function(interpreter) {
    var inter = interpreter;
    return function() {
        var col = this.data.getColor();
        var obj = inter.createObjectProto(inter.COLOR_PROTO);
        // interpreter.setProperty(obj,'red',col.red);
        // interpreter.setProperty(obj,'green',col.green);
        // interpreter.setProperty(obj,'blue',col.blue);
        obj.data = col;
        return obj;
    }
}


/**
 ** The class for colors
 */

Color = function(r,g,b) {
    this.red = r;
    this.green = g;
    this.blue = b;
}

Color.prototype.getRed = function() { return this.red; }
Color.prototype.getGreen = function() { return this.green; }
Color.prototype.getBlue = function() { return this.blue; }
Color.prototype.setRed = function(r) { this.red = r; }
Color.prototype.setGreen = function(g) { this.green = g; }
Color.prototype.setBlue = function(b) { this.blue = b; }


Color.createWrapper = function(name) {
    var funcName = name;
    var func = Color.prototype[funcName];
    return function() {
        return func.apply(this.data,Array.from(arguments));
    }
}