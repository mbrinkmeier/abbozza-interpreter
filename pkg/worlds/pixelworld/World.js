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
var World = new AbbozzaWorld("pixelworld");

var svgNS = "http://www.w3.org/2000/svg";

World.initView = function(view) {
    this.pixelworld = new PixelWorld(view);
    this.pixelworld.parent.tabIndex = "0";
    this._activateKeyboard(this.pixelworld.parent);
    
    document.getElementById("speed").value = AbbozzaInterpreter.getSpeed();
    var info = document.getElementById("info");
    document.getElementById("width").value = this.pixelworld.width;
    document.getElementById("height").value = this.pixelworld.height;
    document.getElementById("zoom").value = this.pixelworld.squareSize;
    
    /*
     * Add event listeners to control elements
     */
    document.getElementById("width").oninput = function(event) {
        World.pixelworld.setWidth(document.getElementById("width").value);
    }
    
    document.getElementById("height").oninput = function(event) {
        World.pixelworld.setHeight(document.getElementById("height").value);
    }
    
    document.getElementById("zoom").oninput = function(event) {
        World.pixelworld.setSquareSize(document.getElementById("zoom").value);
    }
};

World.toDom = function() {
    return this.pixelworld.toDom();
};

World.fromDom = function(xml) {
    this.pixelworld.fromDom(xml);
};
    
World.resetWorld = function () {
    this.setEditable(true);
    this.pixelworld.reset();
};

World.startWorld = function() {
}


World.resize = function() {}


World.addVariableBlocks = function(list) {
    list.push("pixel_var_pixel");
    list.push("pixel_var_color");
}

World.addTypes = function(list) {
    list.push("#PIXEL");
    list.push("#COLOR");
}

World.addTypesToMenu = function(list) {
    list.push([_("pixel.Pixel"),"#PIXEL"]);
    list.push([_("pixel.Color"),"#COLOR"]);
}

World.getBlockForSymbolEntry = function(entry, workspace) {
    if ( entry[1] == "#PIXEL" ) {
        var block = workspace.newBlock("pixel_var_pixel");
        block.getField("NAME").setText(entry[0]);
        return block
    } else if ( entry[1] == "#COLOR" ) {
        var block = workspace.newBlock("pixel_var_color");
        block.getField("NAME").setText(entry[0]);
        return block
    }
    return null;
}

/**
 * PixelWorlds world as view for the context.
 */



function PixelWorld(view) {    
    // The prent div, containing all elements
    this.parent = document.createElement("div");
    this.parent.className = "pixelworldParent";
    view.appendChild(this.parent);
    
    // The canvas to which the background is drawn
    this.canvas = document.createElement("canvas");
    this.canvas.pixelworld = this;
    this.canvas.className = "pixelworldView";
    this.canvas.onclick = this.clicked;
    this.canvas.oncontextmenu = this.rightclicked;
    this.context = this.canvas.getContext("2d");
    this.parent.appendChild(this.canvas);

    this.setSize(200,200);
    this.squareSize = 2;
    this.bananas = 0;

    this.reset();    
};



PixelWorld.prototype.reset = function() {
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0,0,this.width,this.height);
};


PixelWorld.prototype.resize = function() {
    var data = null;

    if ( this.canvas.width != 0 ) {
        data = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
    }
    var parHeight = this.parent.offsetHeight;
    var parWidth = this.parent.ossfetWidth;
    
    document.getElementById("width").value = this.width;
    document.getElementById("height").value = this.height;
    document.getElementById("zoom").value = this.squareSize;
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.reset();

    this.canvas.style.zoom = this.squareSize;
    
    if ( data != null ) { this.context.putImageData(data,0,0); }
};

/**
 * Set the width of the canvas.
 * 
 * @param {type} w The width
 */
PixelWorld.prototype.setWidth = function(w) {
    this.width = Number(w);
    document.getElementById("width").value = this.width;
    this.resize();
}

/**
 * Set the height of the canvas.
 * 
 * @param {type} h The height
 */
PixelWorld.prototype.setHeight = function(h) {
    this.height = Number(h);
    document.getElementById("height").value = this.height;
    this.resize();
}

/**
 * Set the dimension of the canvas.
 * 
 * @param {type} w The width
 * @param {type} h The height
 */
PixelWorld.prototype.setSize = function(w,h) {
    this.width = Number(w);
    this.height = Number(h);
    this.resize();
}

/**
 * Fill the canvas with the given color
 * 
 * @param {type} color The color
 */
PixelWorld.prototype.clear = function(color = null) {
    this.context.fillStyle = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
    this.context.fillRect(0,0,this.width,this.height);
}


/**
 * Set the color of a specific pixel.
 * 
 * @param {type} x
 * @param {type} y
 * @param {type} r
 * @param {type} g
 * @param {type} b
 */
PixelWorld.prototype.setPixel = function(x,y,r,g,b) {
    var pixel = this.context.getImageData(x,y,1,1);
    pixel.data[0] = r;
    pixel.data[1] = g;
    pixel.data[2] = b;
    pixel.data[3] = 255;
    this.context.putImageData(pixel,x,y);
}

/**
 * Set the color of a given pixel
 * 
 * @param {type} pixel
 * @param {type} color
 * @returns {undefined}
 */
PixelWorld.prototype.set = function(pixel,color) {
    var data = this.context.getImageData(pixel.x,pixel.y,1,1);
    data.data[0] = color.red;
    data.data[1] = color.green;
    data.data[2] = color.blue;
    data.data[3] = 255;
    this.context.putImageData(data,pixel.x,pixel.y);
}

/**
 * Get the coor of a specific pixel
 * 
 * @param {type} pixel
 * @returns {Color}
 */
PixelWorld.prototype.getColor = function(pixel) {
    var data = this.context.getImageData(pixel.x,pixel.y,1,1);
    var color = new Color(data.data[0],data.data[1],data.data[2]);
    return color;
}


PixelWorld.prototype.getPixelRed = function(x,y) {
    var pixel = this.context.getImageData(x,y,1,1);
    return pixel.data[0];
}

PixelWorld.prototype.getPixelGreen = function(x,y) {
    var pixel = this.context.getImageData(x,y,1,1);
    return pixel.data[1];
}

PixelWorld.prototype.getPixelBlue = function(x,y) {
    var pixel = this.context.getImageData(x,y,1,1);
    return pixel.data[2];
}


PixelWorld.prototype.setDrawColor = function(color) {
    this.context.strokeStyle = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
    this.context.fillStyle = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
}

PixelWorld.prototype.drawRect = function(pixel1,pixel2) {
    this.context.strokeRect(pixel1.x,pixel1.y,pixel2.x,pixel2.y);
}

PixelWorld.prototype.fillRect = function(pixel1,pixel2) {
    this.context.fillRect(pixel1.x,pixel1.y,pixel2.x,pixel2.y);
}


PixelWorld.prototype.toDom = function() {
    var root = document.createElement("world");
    root.setAttribute("width",this.width);
    root.setAttribute("height",this.height);    
    return root;
};

/**
 * 
 * @param {type} xml
 * @returns {undefined}
 */
PixelWorld.prototype.fromDom = function(xml) {
    this.width = Number(xml.getAttribute("width"));
    this.height = Number(xml.getAttribute("height"));

    this.resize();
    this.reset();
};


PixelWorld.prototype.setSquareSize = function(w) {
    this.squareSize = Number(w);
    this.resize();
}


World.setEditable = function(editable) {
    this.editable = editable;
}



/**
 * Initialize the source interpreter
 * 
 * @param {type} interpreter
 * @param {type} scope
 * @returns {World.initSourceInterpreter}
 */
World.initSourceInterpreter = function(interpreter,scope) {
    // Create wrappers for al operations having only parameters of basic types.
    var funcs = [
      'getPixelRed','getPixelGreen','getPixelBlue','setDrawColor'
    ];
    AbbozzaInterpreter.createNativeWrappersByName(interpreter,scope,World.pixelworld,funcs,false);
   
    var funcs = [
      'setPixel'
    ];
    AbbozzaInterpreter.createNativeWrappersByName(interpreter,scope,World.pixelworld,funcs,true);

    var clearWrapper = function(color) {
        AbbozzaInterpreter.currentThread.nonBlocking = true;
        World.pixelworld.clear(color.data);
    }
    interpreter.setProperty(scope, 'clear', interpreter.createNativeFunction(clearWrapper, false));
    
    
    // Add wrappers for Color
    // 
    // Color constructor.
    var colorWrapper = function(r,g,b) {
        if (interpreter.calledWithNew()) {
            this.data = new Color(r,g,b);
            var result = this;
        } else {
            var result = this;
        }
        return result;
    };
    interpreter.COLOR = interpreter.createNativeFunction(colorWrapper, true);
    interpreter.setProperty(scope, 'Color', interpreter.COLOR);
    interpreter.COLOR_PROTO = interpreter.COLOR.properties['prototype'];
    interpreter.createNativeFunction(colorWrapper, true);

    functions = ['getRed', 'getBlue', 'getGreen',
                     'setRed', 'setGreen', 'setBlue'];
    for ( var i = 0; i < functions.length ; i++ ) {
        interpreter.setNativeFunctionPrototype(interpreter.COLOR, functions[i], Color.createWrapper(functions[i]));
    }
    
    // Pixel constructor.
    var pixelWrapper = function(x,y) {
        if (interpreter.calledWithNew()) {
            this.data = new Pixel(x,y);
            var result = this;
        } else {
            var result = this;
        }
        return result;
    };
    interpreter.PIXEL = interpreter.createNativeFunction(pixelWrapper, true);
    interpreter.setProperty(scope, 'Pixel', interpreter.PIXEL);
    interpreter.PIXEL_PROTO = interpreter.PIXEL.properties['prototype'];
    interpreter.createNativeFunction(pixelWrapper, true);

    var functions = ['getX', 'getY', 'setX', 'setY' ];
    for ( var i = 0; i < functions.length ; i++ ) {
        interpreter.setNativeFunctionPrototype(interpreter.PIXEL, functions[i], Pixel.createWrapper(functions[i]));
    }    
    interpreter.setNativeFunctionPrototype(interpreter.PIXEL, 'setColor', Pixel.setColorWrapper);
    interpreter.setNativeFunctionPrototype(interpreter.PIXEL, 'getColor', Pixel.createGetColorWrapper(interpreter));

};
 
/* 
PixelWorld.createWrapper = function(interpreter,func) {
    var method = func;
    return interpreter.createNativeFunction(
        function() {
            console.log("wrapper");
            console.log(this);
            console.log(this.data);
           return method.apply(this.data,Array.from(arguments));
        }       
    );
}
*/
