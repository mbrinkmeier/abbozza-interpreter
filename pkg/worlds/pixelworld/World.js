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
    this.setPixel(10,10,255,0,0);
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
 * Set width of the canvas
 * 
 * @param {type} w
 * @returns {undefined}
 */
PixelWorld.prototype.setWidth = function(w) {
    this.width = Number(w);
    document.getElementById("width").value = this.width;
    this.resize();
}

PixelWorld.prototype.setHeight = function(w) {
    this.height = Number(w);
    document.getElementById("height").value = this.height;
    this.resize();
}

PixelWorld.prototype.setSize = function(w,h) {
    this.width = Number(w);
    this.height = Number(h);
    this.resize();
}


PixelWorld.prototype.setPixel = function(x,y,r,g,b) {
    var pixel = this.context.getImageData(x,y,1,1);
    pixel.data[0] = r;
    pixel.data[1] = g;
    pixel.data[2] = b;
    pixel.data[3] = 255;
    this.context.putImageData(pixel,x,y);
}


PixelWorld.prototype.set = function(pixel,color) {
    var data = this.context.getImageData(pixel.x,pixel.y,1,1);
    data.data[0] = color.red;
    data.data[1] = color.green;
    data.data[2] = color.blue;
    data.data[3] = 255;
    this.context.putImageData(data,pixel.x,pixel.y);
}


PixelWorld.prototype.getColor = function(color,pixel) {
    var data = this.context.getImageData(pixel.x,pixel.y,1,1);
    color.red = data.data[0];
    color.green = data.data[1];
    color.blue = data.data[2];
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
    console.log("hier");
    this.squareSize = Number(w);
    // this.reset(false,true);
    this.resize();
}




/**
 * 
 * @param {type} func
 * @param {type} args
 * @returns {unresolved}
 */
World.wrapper = function(func,args) {
    return func.apply(World.pixelworld,args);
};


World.createWrapper = function(func) {
    return function(arg) {
        var args= [];
        for ( var i = 0 ; i < arguments.length; i++ ) {
            args[i] = arguments[i];
        }
        return World.wrapper(World.pixelworld[func],args);        
    };
};

World.initSourceInterpreter = function(interpreter,scope) {
    var funcs = [
      'setPixel','getPixelRed','getPixelGreen','getPixelBlue','setDrawColor'
    ];
    AbbozzaInterpreter.createNativeWrappersByName(interpreter,scope,World.pixelworld,funcs);
    
    // Add wrappers for Pixel
    // 
    // Stack constructor.
    var pixelWrapper = function(x,y) {
        if (interpreter.calledWithNew()) {
            // Called as new Stack().
            this.data = new Pixel(x,y);
            return this;
        } else {
            return null;
        }
    };
    interpreter.PIXEL = interpreter.createNativeFunction(pixelWrapper, true);
    interpreter.setProperty(scope, 'Pixel', interpreter.PIXEL);
    
    wrapper = function(x) { this.data.setX(x); };
    interpreter.setNativeFunctionPrototype(interpreter.PIXEL, 'setX', wrapper);
    
    wrapper = function(y) { this.data.setY(y); };
    interpreter.setNativeFunctionPrototype(interpreter.PIXEL, 'setY', wrapper);

    wrapper = function() { return this.data.getX(); };
    interpreter.setNativeFunctionPrototype(interpreter.PIXEL, 'getX', wrapper);
    
    wrapper = function() { return this.data.getY(); };
    interpreter.setNativeFunctionPrototype(interpreter.PIXEL, 'getY', wrapper);

    wrapper = function(color) { this.data.setColor(color.data); };
    interpreter.setNativeFunctionPrototype(interpreter.PIXEL, 'setColor', wrapper);

    wrapper = function() { return this.data.getColor(); };
    interpreter.setNativeFunctionPrototype(interpreter.PIXEL, 'getColor', wrapper);
    
    
    // Add wrappers for Color
    // 
    // Stack constructor.
    var colorWrapper = function(r,g,b) {
        if (interpreter.calledWithNew()) {
            // Called as new Stack().
            this.data = new Color(r,g,b);
            return this;
        } else {
            return null;
        }
    };
    interpreter.COLOR = interpreter.createNativeFunction(colorWrapper, true);
    interpreter.setProperty(scope, 'Color', interpreter.COLOR);
    
    wrapper = function() { return this.data.getRed(); };
    interpreter.setNativeFunctionPrototype(interpreter.COLOR, 'getRed', wrapper);

    wrapper = function() { return this.data.getGreen(); };
    interpreter.setNativeFunctionPrototype(interpreter.COLOR, 'getGreen', wrapper);

    wrapper = function() { return this.data.getBlue(); };
    interpreter.setNativeFunctionPrototype(interpreter.COLOR, 'getBlue', wrapper);

    wrapper = function(r) { return this.data.setRed(r); };
    interpreter.setNativeFunctionPrototype(interpreter.COLOR, 'setRed', wrapper);

    wrapper = function(r) { return this.data.setGreen(r); };
    interpreter.setNativeFunctionPrototype(interpreter.COLOR, 'setGreen', wrapper);

    wrapper = function(r) { return this.data.setBlue(r); };
    interpreter.setNativeFunctionPrototype(interpreter.COLOR, 'setBlue', wrapper);
};


World.setEditable = function(editable) {
    this.editable = editable;
}



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

/*
 * 
 * @returns {Hathi}
 */
Hathi = function() {}

Hathi.prototype.onStart = function() {
    // this.hideCollision();
    this.hideBubble();
}


Hathi.prototype.setHathi = function(x,y,dir) {
    this.hathiX = x;
    this.hathiY = y;
    this.hathiDir = dir % 4;
    switch (this.hathiDir) {
        case 0:
            this.hathiDX = 1;
            this.hathiDY = 0;
            break;
        case 1:
            this.hathiDX = 0;
            this.hathiDY = -1;
            break;
        case 2:
            this.hathiDX = -1;
            this.hathiDY = 0;
            break;
        case 3:
            this.hathiDX = 0;
            this.hathiDY = 1;
            break;
    }
    this.redraw();
}





Hathi.prototype.drawGrid = function() {
    // draw fields onto the canvas
    var hlen = this.height * this.squareSize;
    this.context_.strokeStyle = "#316428";
    this.context_.lineWidth = 0;
    this.context_.fillStyle = "#316428";
    this.context_.fillRect(0, 0, this.view_.width, this.view_.height);
    for (var i = 0; i <= this.width; i++) {
        this.context_.moveTo(this.squareSize * i, this.squareSize/2 );
        this.context_.lineTo(this.squareSize * i, hlen+ this.squareSize/2);
        this.context_.stroke();
    }
    for (var i = 0; i <= this.height; i++) {
        this.context_.moveTo(this.squareSize, this.squareSize * (i+1));
        this.context_.lineTo(this.view_.width-this.squareSize, this.squareSize * (i+1));
        this.context_.stroke();
    }
}

Hathi.prototype.redraw = function () {
    this.drawGrid();
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.drawSquare(x, y);
        }
    }
    if ( this.bubble_shown ) {
        this.showBubble();
    }
};

Hathi.prototype.drawSquare = function (x, y, neighbors = false) {
    
    if ( (x<0) || (x >= this.width)) return;
    if ( (y<0) || (y >= this.height)) return;
    
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;

    var xpos = (x+1) * this.squareSize + 1;
    var ypos = (y+1) * this.squareSize + 1;
    var siz = this.squareSize - 2;

    
    // Draw empty square as basis
    this.context_.fillStyle = "#316428";
    this.context_.fillRect((x+1) * this.squareSize, (y+1) * this.squareSize,
            this.squareSize, this.squareSize
            );
    this.context_.fillStyle = "#316428";
    this.context_.fillRect(
            (x+1) * this.squareSize + 1, (y+1) * this.squareSize + 1,
            this.squareSize - 2, this.squareSize - 2
            );

    this.context_.drawImage(this.backgroundImages[this.background[x][y]],xpos,ypos,siz,siz);

    if ((this.field[x][y] <= 0) && (this.field[x][y] > Hathi.BASKET )) {
        switch (this.field[x][y]) {
            case Hathi.EMPTY:
                break;
            case Hathi.ROCK:
                // The rock is an svg
                break;
            case Hathi.TREE:
                // The tree is an svg
                break;
            case Hathi.FILLED:
            case Hathi.HOLE:
                // The hole is drawn to the canvas
                if ( ( y > 0 ) && ( this.field[x][y-1] == Hathi.HOLE ) ) {
                    this.context_.drawImage(this.wallImages[0], xpos, ypos, siz, siz);
                } else if ( ( y > 0 ) && ( this.field[x][y-1] == Hathi.FILLED ) ) {
                    this.context_.drawImage(this.wallImages[9], xpos, ypos, siz, siz);
                } else {
                    this.context_.drawImage(this.wallImages[1], xpos, ypos, siz, siz);                    
                }
                                
                if ( ( y < this.height-1 ) && ( this.field[x][y+1] == Hathi.HOLE ) ) {
                    this.context_.drawImage(this.wallImages[2], xpos, ypos, siz, siz);
                } else {
                    this.context_.drawImage(this.wallImages[3], xpos, ypos, siz, siz);                    
                }

                if ( ( x == this.width-1) || (( x < this.width-1 ) && ( this.field[x+1][y] != Hathi.HOLE )) ) {
                    this.context_.drawImage(this.wallImages[6], xpos, ypos, siz, siz);                                            
                } else {
                    if ( ( x < this.width-1) && ( y > 0 ) && ( this.field[x+1][y-1] != Hathi.HOLE) ) {
                        this.context_.drawImage(this.wallImages[7], xpos, ypos, siz, siz);                                        
                    }
                }
                
                if ( (x==0) || (( x > 0 ) && ( this.field[x-1][y] != Hathi.HOLE ))) {
                    this.context_.drawImage(this.wallImages[4], xpos, ypos, siz, siz);                                            
                } else {
                    if ( ( x > 0 ) &&  ( y > 0 ) && (this.field[x-1][y-1] != Hathi.HOLE) ) {
                        this.context_.drawImage(this.wallImages[5], xpos, ypos, siz, siz);                                        
                    }
                }
                
                if ( this.field[x][y] == Hathi.FILLED ) {
                    this.context_.drawImage(this.wallImages[8], xpos, ypos, siz, siz);                                                            
                }
                
                break;
            case Hathi.OASIS:
                // The oasis is drawn to the canvas
                this.context_.drawImage(this.images[-Hathi.OASIS], xpos, ypos, siz, siz);
                break;
            case Hathi.BASKET:
                // The oasis is drawn to the canvas
                this.context_.drawImage(this.images[-Hathi.BASKET], xpos, ypos, siz, siz);
                break;
        }
    } else {
        if ( this.field[x][y] > 0 ) {
            this.context_.drawImage(this.images[-Hathi.BANANA], xpos, ypos, siz, siz);
            if (this.field[x][y] > 1) {
                this.context_.strokeStyle = "black";
                this.context_.fillStyle = "white";
                this.context_.font = "bold " + this.squareSize / 2 + "px arial";
                var w = this.context_.measureText(this.field[x][y]).width;
                this.context_.fillText(this.field[x][y], xpos + siz / 2 - (w / 2) - siz/5 , ypos + 4 * siz / 6 - siz/4);
            }
        } else {
            this.context_.drawImage(this.images[-Hathi.BASKET], xpos, ypos, siz, siz);            
            this.context_.strokeStyle = "black";
            this.context_.fillStyle = "white";
            this.context_.font = "bold " + this.squareSize / 2 + "px arial";
            var v = -this.field[x][y] + Hathi.BASKET;
            var w = this.context_.measureText(v).width;
            this.context_.fillText(v, xpos + siz/2 - w/2, ypos + 5 * siz / 6);
        }
    }

    if ((this.hathiX == x) && (this.hathiY == y)) {
        var pic;
        var href;
        switch (this.hathiDir) {
            case 0 : // RIGHT
                pic = this.pic_hathi_right_;
                href = "img/hathi_right.png";
                break;
            case 1 : // UP
                pic = this.pic_hathi_up_;
                href = "img/hathi_back.png";
                break;
            case 2 : // LEFT
                pic = this.pic_hathi_left_;
                href = "img/hathi_left.png";
                break;
            case 3 : // DOWN
                pic = this.pic_hathi_down_;
                href = "img/hathi_front.png";
                break;
        }
        this.hathi_svg_i.setAttribute("href",href);
        this.hathi_svg_img.setAttribute("transform","translate(" + (xpos+1) + "," + (ypos+1-siz/4) + ")");
        this.moveHathiTo(this.hathiX,this.hathiY);
    }
    
    if (neighbors) {
        this.drawSquare(x-1,y,false);
        this.drawSquare(x+1,y,false);
        this.drawSquare(x,y-1,false);
        this.drawSquare(x,y+1,false);
        this.drawSquare(x-1,y-1,false);
        this.drawSquare(x+1,y-1,false);
        this.drawSquare(x-1,y+1,false);
        this.drawSquare(x+1,y+1,false);
    }
};


Hathi.prototype.showCollision = function() {
    // Upper left corner of collision
    var x = (this.hathiX+1) * this.squareSize + this.hathiDX * this.squareSize/2+1;
    var y = (this.hathiY+1) * this.squareSize + this.hathiDY * this.squareSize/2+1;
    var siz = this.squareSize-2;
    
    this.hathi_svg_g.appendChild(this.collision);
    this.collision.setAttribute("transform","translate(" + x + "," + y + ")");
}

Hathi.prototype.hideCollision = function() {
    if ( this.collision.parentNode == this.hathi_svg_g ) {
        this.hathi_svg_g.removeChild(this.collision);
    }
}


Hathi.prototype.showBubble = function(img = null, text = "") {
    if ( img != null ) {
       this.hathi_bubble_img.setAttribute("href",img);
       this.hathi_bubble_img.style.display="inline";
   } else {
       this.hathi_bubble_img.style.display="none";        
    }
    
    this.bubble_shown = true;
    this.hathi_bubble.style.display = "block";
    var xpos = (this.hathiX+1)*this.squareSize;
    var ypos = (this.hathiY+1)*this.squareSize;
    var ixpos;
    var iypos;
    switch ( this.hathiDir ) {
        case 0:  // RIGHT
            this.hathi_bubble_path.setAttribute("d","M80,30 l15,-5 l0,15 a3,3 0 0,1 3,3 l50,0 a3,3 0 0,1 3,-3 l0,-50 a3,3 0 0,1 -3,-3 l -50,0 ,a3,3 0 0,1, -3,3 l0,25 Z");
            ixpos = 98;
            iypos = -10;
            break;
        case 1: // UP
        case 3: //DOWN
            ixpos = 15;
            iypos = -73;
            this.hathi_bubble_path.setAttribute("d","M40,-5 l5,-15 l20,0 a3,3 0 0,1 3,-3 l0,-50 a3,3 0 0,1 -3,-3 l-50,0 a3,3 0 0,1 -3,3 l0,50 a3,3 0 0,1 3,3 l20,0 Z");
            break;
        case 2: // LEFT
            ixpos = -68;
            iypos = -10;
            this.hathi_bubble_path.setAttribute("d","M0,30 l-15,-5 l0,15 a3,3 0 0,1 -3,3 l-50,0 a-3,3 0 0,1 -3,-3 l0,-50 a3,3 0 0,1 3,-3 l50,0 a3,3 0 0,1, 3,3 l0,25 Z");
            break;
    }
    var scale = this.squareSize/80.0;
    this.hathi_bubble.setAttribute("transform","translate(" + xpos + "," + ypos + ")");
    this.hathi_bubble_path.setAttribute("transform","scale(" + scale + ")");
    this.hathi_bubble_img.setAttribute("transform","scale(" + scale + ")");
    this.hathi_bubble_img.setAttribute("x",ixpos);
    this.hathi_bubble_img.setAttribute("y",iypos);
    this.hathi_bubble_text.setAttribute("transform","scale(" + scale + ")");
    
    if ( text != "" ) {
        this.hathi_bubble_text.setAttribute("x",ixpos+25);
        this.hathi_bubble_text.setAttribute("y",iypos+40);
        this.hathi_bubble_text.textContent = text;
        this.hathi_bubble_img.style.opacity = 0.25;
    } else {
        this.hathi_bubble_text.textContent = "";
        this.hathi_bubble_img.style.opacity = 1;
    }
}


Hathi.prototype.showTextBubble = function(text) {
    // Set text
    img = null;
    this.hathi_bubble_img.style.display="none";        

    if ( text != "" ) {
        this.hathi_bubble_text.textContent = text;
        this.hathi_bubble_img.style.opacity = 0.25;
    } else {
        this.hathi_bubble_text.textContent = "";
        this.hathi_bubble_img.style.opacity = 1;
    }
    var width = this.hathi_bubble_text.getComputedTextLength()+20;

    this.bubble_shown = true;
    this.hathi_bubble.style.display = "block";
    var xpos = (this.hathiX+1)*this.squareSize;
    var ypos = (this.hathiY+1)*this.squareSize;
    var ixpos;
    var iypos;
    switch ( this.hathiDir ) {
        case 0:  // RIGHT
            // this.hathi_bubble_path.setAttribute("d","M80,30 l15,-5 l0,15 a3,3 0 0,1 3,3 l" + width + ",0 a3,3 0 0,1 3,-3 l0,-50 a3,3 0 0,1 -3,-3 l -" + width + ",0 ,a3,3 0 0,1, -3,3 l0,25 Z");
            // ixpos = 98;
            // iypos = -10;
            // break;
        case 2: // LEFT
            // ixpos = -20-width;
            // iypos = -10;
            // this.hathi_bubble_path.setAttribute("d","M0,30 l-15,-5 l0,15 a3,3 0 0,1 -3,3 l-" + width + ",0 a-3,3 0 0,1 -3,-3 l0,-50 a3,3 0 0,1 3,-3 l" + width + ",0 a3,3 0 0,1, 3,3 l0,25 Z");
            // break;
        case 1: // UP
        case 3: //DOWN
            ixpos = 40;
            iypos = -73;
            this.hathi_bubble_path.setAttribute("d","M40,-5 l5,-15 l" + ((width-10)/2) + "20,0 a3,3 0 0,1 3,-3 l0,-50 a3,3 0 0,1 -3,-3 l-" + width + ",0 a3,3 0 0,1 -3,3 l0,50 a3,3 0 0,1 3,3 l" + ((width-10)/2) + ",0 Z");
            break;
    }
    var scale = this.squareSize/80.0;
    this.hathi_bubble.setAttribute("transform","translate(" + xpos + "," + ypos + ")");
    this.hathi_bubble_path.setAttribute("transform","scale(" + scale + ")");
    this.hathi_bubble_img.setAttribute("transform","scale(" + scale + ")");
    this.hathi_bubble_img.setAttribute("x",ixpos);
    this.hathi_bubble_img.setAttribute("y",iypos);
    this.hathi_bubble_text.setAttribute("transform","scale(" + scale + ")");

    if ( text != "" ) {
        this.hathi_bubble_text.setAttribute("x",ixpos);
        this.hathi_bubble_text.setAttribute("y",iypos+40);
    }
}

/**
 * 
 * @returns {undefined}
 */
Hathi.prototype.hideBubble = function() {
    this.bubble_shown = false;
    this.hathi_bubble. style.display = "none";
}

/**
 * 
 * @returns {undefined}
 */
Hathi.prototype.clear = function() {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.field[x][y] = 0;
        }
    }    
}

/**
 * Put an svg of the given type into the world
 * 
 * @param {type} type
 * @param {type} x
 * @param {type} y
 * @returns {Hathi.prototype.put.img|Element}
 */

Hathi.prototype.put = function (type, x, y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    this.field[x][y] = type;

    if ( type == Hathi.EMPTY ) {
        this.removeSvgAt(x,y);
        return null;
    }

    var img = null;
    img = document.createElementNS(svgNS,"image");
    if ( type == Hathi.ROCK ) {
       img.setAttribute("href","img/rock.png");
       img.setAttribute("height","120");
    } else if ( type == Hathi.TREE ) {
       img.setAttribute("href","img/tree2.png");
       img.setAttribute("height","120");
    }
    img.setAttribute("width","78");
    this.putSvgAt(img,x,y);
    
    return img;
};

// Puts the svg at the given position.
Hathi.prototype.putSvgAt = function(svg,x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    if ( svg == null ) return;
    var oldSvg = this.svgs[x][y];
    this.svgs[x][y] = svg;
    
    if ( (oldSvg != null) && (oldSvg != svg)) {
        this.hathi_svg_g.insertBefore(svg,oldSvg);
        this.hathi_svg_g.removeChild(oldSvg);
    } else {
        // Insert svg at correct position
        var nx = x;
        var ny = y;
        while ( ((this.svgs[nx][ny] == svg) || (this.svgs[nx][ny] == null)) && ( ny < this.height) ) {
            nx = nx+1;
            if ( nx >= this.width ) {
                ny = ny +1;
                nx = 0;
            }
        }
        if ( this.svgs[nx][ny] != null ) {
            var s = this.svgs[nx][ny];
            this.hathi_svg_g.insertBefore(svg,s);
        } else {
            this.hathi_svg_g.appendChild(svg);
        }
    }

    var xpos = (x+1) * this.squareSize + 1;
    var ypos = (y+1) * this.squareSize + 1;
    var siz = this.squareSize - 2;

    svg.setAttribute("width",siz+"px");
    if ( (this.field[x][y] == Hathi.TREE) || (this.field[x][y] == Hathi.ROCK) ) {
        svg.setAttribute("height",((3*siz)/2)+"px");
        svg.setAttribute("transform","translate(" + xpos  + "," + ( ypos - this.squareSize/2 ) + ")");
        svg.setAttribute("clip-path","url(#clipping)");
    } else {
        svg.setAttribute("height",siz+"px");        
        svg.setAttribute("transform","translate(" + xpos + "," + (ypos) + ")");
    }
    // svg.setAttribute("viewBox","0 0 " + siz + " " + siz);
};


// Puts the svg at the given position.
Hathi.prototype.moveHathiTo = function(x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;

    var oldSvg = this.svgs[x][y];
    
    if (oldSvg != null) {
        this.hathi_svg_g.insertBefore(this.hathi_svg_img,oldSvg);
        this.hathi_svg_g.insertBefore(oldSvg,this.hathi_svg_img);
    } else {
        // Insert svg at correct position
        var nx = x;
        var ny = y;
        while ( (this.svgs[nx][ny] == null) && ( ny < this.height) ) {
            nx = nx+1;
            if ( nx >= this.width ) {
                ny = ny +1;
                nx = 0;
            }
        }
        if ( this.svgs[nx][ny] != null ) {
            var s = this.svgs[nx][ny];
            this.hathi_svg_g.insertBefore(this.hathi_svg_img,s);
        } else {
            this.hathi_svg_g.appendChild(this.hathi_svg_img);
        }
    }
};


/**
 * Remove the svg
 * 
 * @param {type} x
 * @param {type} y
 * @returns {undefined}
 */
Hathi.prototype.removeSvgAt = function(x,y) {
  var svg = this.svgs[x][y];  
  if ( svg ) {
      this.svgs[x][y] = null;
      this.hathi_svg_g.removeChild(svg);
  }
};


/**
 * Get the item at the given position.
 * 
 * @param {type} x
 * @param {type} y
 * @returns {Hathi.prototype@arr;@arr;field}
 */
Hathi.prototype.get = function(x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    return this.field[x][y];
}


/**
 * Hathi turns right
 */
Hathi.prototype.turnRight = function () {
    this.hideBubble();
    this.hathiDir = (this.hathiDir + 3) % 4;
    var dum = this.hathiDX;
    this.hathiDX = -this.hathiDY;
    this.hathiDY = dum;
    this.drawSquare(this.hathiX, this.hathiY);
};

/**
 * Hathi turns left
 */
Hathi.prototype.turnLeft = function () {
    this.hideBubble();
    this.hathiDir = (this.hathiDir + 1) % 4;
    var dum = this.hathiDX;
    this.hathiDX = this.hathiDY;
    this.hathiDY = -dum;
    this.drawSquare(this.hathiX, this.hathiY);
};

/*
 * Hathi makes one step forward.
 * @returns {Number} Hathi.OK if the step was possible
 */
Hathi.prototype.forward = function () {
    this.hideBubble();

    var oldX = this.hathiX;
    var oldY = this.hathiY;
    var newX = ( this.hathiX + this.hathiDX );
    var newY = ( this.hathiY + this.hathiDY );
    
    // Don't move, if the new position would be outside of the world.
    if (( newX < 0 ) || (newX >= this.width) || (newY < 0) || (newY >= this.height)) {
        this.moved=false;
        this.onCollisionWithBorder();
        return Hathi.OK;
    }

    if ( this.field[newX][newY] < 0 ) {
        if ( this.field[newX][newY] == Hathi.ROCK ) {
            // Push the rock
            if ( this.isEmpty(newX+this.hathiDX,newY+this.hathiDY) ) {
                this.hathiX = newX;
                this.hathiY = newY;
                this.moved = true;
                this.moveRock(oldX,oldY,newX,newY,newX+this.hathiDX,newY+this.hathiDY);
                this.moveHathi(oldX,oldY,newX,newY);
            } else if ( this.field[newX+this.hathiDX][newY+this.hathiDY] == Hathi.HOLE ) {
                // Fill hole with rock
                this.hathiX = newX;
                this.hathiY = newY;
                this.moved = true;
                this.moveHathi(oldX,oldY,newX,newY);
                this.moveRock(oldX,oldY,newX,newY,newX+this.hathiDX,newY+this.hathiDY,true);
            } else {
                // Collide but don't abort!
                this.moved = false;
                return this.onCollisionWithRock();
            }
        } else if ( this.field[newX][newY] == Hathi.TREE ) {
            // Collide and don't abort!
            this.moved = false;
            return this.onCollisionWithTree();
        } else if ( this.field[newX][newY] == Hathi.HOLE ) {
            // Collide and abort!
            this.moved = false;
            return this.onFall();
            // return Hathi.FELL_INTO_HOLE;
        } else {
            // Do not collide!
            this.hathiX = newX;
            this.hathiY = newY;
            this.moved = true;
            this.moveHathi(oldX,oldY,newX,newY);
        }
    } else {
        this.hathiX = newX;
        this.hathiY = newY;
        this.moved = true;
        this.moveHathi(oldX,oldY,newX,newY);
    }
    return Hathi.OK;
};


/**
 * Animate Hathi
 * @param {type} oldX
 * @param {type} oldY
 * @param {type} newX
 * @param {type} newY
 * @param {type} falling
 * @returns {undefined}
 */
Hathi.prototype.moveHathi = function(oldX,oldY,newX,newY,falling = false) {
    var nx = (newX+1) * this.squareSize;
    var ny = (newY+1) * this.squareSize;
    var ox = (oldX+1) * this.squareSize;
    var oy = (oldY+1) * this.squareSize;
    if ( !falling ) {
        var anim = this.hathi_svg_img.animate(
            [
                { transform: "translate(" + (ox+2) + "px," + (oy + 3 - this.squareSize/4) + "px)" },
                { transform: "translate(" + (nx+2) + "px," + (ny + 3 - this.squareSize/4) + "px)" }
            ],
            {
                duration: 250,
                additive: "replace",
                accumulate: "sum"
            });
        Abbozza.waitForAnimation(anim, function() { 
            World.hathi.drawSquare(World.hathi.hathiX,World.hathi.hathiY);
        });    
    } else {
      World.hathi.onFall();
    }
};

/**
 * Animate rock
 * @param {type} hathiX
 * @param {type} hathiY
 * @param {type} oldX
 * @param {type} oldY
 * @param {type} newX
 * @param {type} newY
 * @param {type} vanish
 * @returns {undefined}
 */
Hathi.prototype.moveRock = function(hathiX,hathiY,oldX,oldY,newX,newY,vanish = false) {
    newX = ( newX + this.width ) % this.width;
    newY = ( newY + this.height ) % this.height;
    oldX = ( oldX + this.width ) % this.width;
    oldY = ( oldY + this.height ) % this.height;
    var hx = (hathiX+1) * this.squareSize;
    var hy = (hathiY+1) * this.squareSize;
    var nx = (newX+1) * this.squareSize;
    var ny = (newY+1) * this.squareSize;
    var ox = (oldX+1) * this.squareSize;
    var oy = (oldY+1) * this.squareSize;
    var svg = this.svgs[oldX][oldY];
    
    var keyframes;
    var hframes;
    var duration;
    if ( vanish ) {
        
        /*
        keyframes = [
                { transform: "translate(" + ox + "px," + (oy - this.squareSize/2 + 2 + this.squareSize/2) + "px)" },
                { transform: "translate(" + nx + "px," + (ny + 2) + "px )" },
                { transform: "translate(" + (nx + this.squareSize/2) + "px," + (ny+this.squareSize) + "px) scale(0.1)", y: 20 }
            ];  
        */
        keyframes = {
            transform : [ "translate(" + ox + "px," + (oy + 2 - this.squareSize/2) + "px)" ,
                          "translate(" + nx + "px," + (ny + 2 - this.squareSize/2) + "px )",
                          "translate(" + nx + "px," + (ny + 2 - this.squareSize/2) + "px )"
                        ],
            y : [ "0","0", (this.squareSize/2) ]
        };
        hframes = [
               { transform: "translate(" + hx + "px," + (hy+2 - this.squareSize/4) + "px)" },
               { transform: "translate(" + ox + "px," + (oy+2 - this.squareSize/4) + "px)" },
               { transform: "translate(" + ox + "px," + (oy+2 - this.squareSize/4) + "px)" }
            ];  
        duration = 500;
        if ( ( newY < this.height-1) && (this.field[newX][newY+1] == Hathi.HOLE) ) {
            svg.setAttribute("clip-path","unset");
        }
    } else {
        keyframes = [
                { transform: "translate(" + ox + "px," + (oy + 2 - this.squareSize/2 ) + "px)" },
                { transform: "translate(" + nx + "px," + (ny + 2 - this.squareSize/2 ) + "px)" }
            ]; 
            hframes =             [
               { transform: "translate(" + hx + "px," + (hy+2 - this.squareSize/4) + "px)" },
               { transform: "translate(" + ox + "px," + (oy+2 - this.squareSize/4) + "px)" }
            ];
        duration = 250;
    }
    
    var hanim = this.hathi_svg_img.animate(hframes,
            {
                duration: duration,
                additive: "replace",
                accumulate: "sum"
            });
    
    // var anim = this.rock_svg_img.animate(
    var anim = svg.animate(
            keyframes,
            {
                duration: duration,
                additive: "replace",
                accumulate: "sum"
            });
        Abbozza.waitForAnimation(anim, function() { 
            if ( vanish ) {
                World.hathi.field[oldX][oldY] = Hathi.EMPTY;
                World.hathi.field[newX][newY] = Hathi.FILLED;
                World.hathi.svgs[oldX][oldY] = null;
                World.hathi.svgs[newX][newY] = null;
                World.hathi.hathi_svg_g.removeChild(svg);
            } else {
                World.hathi.field[oldX][oldY] = Hathi.EMPTY;
                World.hathi.field[newX][newY] = Hathi.ROCK;
                World.hathi.svgs[oldX][oldY] = null;
                World.hathi.putSvgAt(svg,newX,newY);
            }
            World.hathi.drawSquare(newX,newY,true);
        });    
}

/**
 * Check if Hathis last tep was successfull
 * @returns {Boolean}
 */
Hathi.prototype.steppedForward = function() {
   return this.moved;
}

/**
 * Check if the field is empty, only contains bananas
 * or a basket.
 * @param {type} x
 * @param {type} y
 * @returns {unresolved}
 */
Hathi.prototype.isEmpty = function(x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    return ( (this.field[x][y] >= 0) || (this.field[x][y] == Hathi.OASIS) || (this.field[x][y] == Hathi.BASKET) );
};

/**
 * 
 * @returns {Number}
 */
Hathi.prototype.onCollisionWithBorder = function () {
    this.showBubble("img/stopsign.png");
    return Hathi.OK;
};

/**
 * 
 * @returns {Number}
 */
Hathi.prototype.onCollisionWithRock = function () {
    this.showBubble("img/stopsign.png");
    return Hathi.OK;
};

/**
 * 
 * @returns {Number}
 */
Hathi.prototype.onCollisionWithTree = function () {
    this.showBubble("img/stopsign.png");
    if ( this.terminateOnCollision ) {
        return Hathi.BUMPED_TREE;
    } else {
        return Hathi.OK;
    }
};

/**
 * 
 * @returns {Number}
 */
Hathi.prototype.onFall = function () {
    this.showBubble("img/stopsign.png");
    if ( this.terminateOnFall ) {
        return Hathi.FELL_INTO_HOLE;
    } else {
        return Hathi.OK;
    }
};

/**
 * 
 * @returns {Number}
 */
Hathi.prototype.noBanana = function() {
    this.showBubble("img/nobanana.png");
    if ( this.terminateOnNoBanana) {
        return Hathi.NO_BANANA;
    } else {
        return Hathi.OK;
    }
};

/**
 * 
 * @returns {Boolean}
 */
Hathi.prototype.isOnBanana = function() {
    return ( this.field[this.hathiX][this.hathiY] > 0 );
};

/**
 * 
 * @returns {Boolean}
 */
Hathi.prototype.isOnBasket = function() {
    return ( this.field[this.hathiX][this.hathiY] <= Hathi.BASKET );
};

/**
 * 
 * @param {type} type
 * @returns {Boolean}
 */
Hathi.prototype.isOn = function(type) {
    return ( this.field[this.hathiX][this.hathiY] == type );
};

/**
 * 
 * @returns {Number}
 */
Hathi.prototype.pickUpBanana = function() {
    // If there is no banana on the field
    if ( (this.field[this.hathiX][this.hathiY] <= 0) && (this.field[this.hathiX][this.hathiY] >= Hathi.BASKET ) ) {
        return this.noBanana();
    }
    
    if ( this.field[this.hathiX][this.hathiY] > 0 ) {
        // pick a banana from the ground
        this.field[this.hathiX][this.hathiY]--;
        this.bananas++;
        this.drawSquare(this.hathiX,this.hathiY);
        this.showBubble("img/banana.png", this.bananas );
    } else {
        // pick a banana from a basket
        this.field[this.hathiX][this.hathiY]++;
        this.bananas++;
        this.drawSquare(this.hathiX,this.hathiY);
        this.showBubble("img/banana.png", this.bananas);        
    }
    return Hathi.OK;
};

/**
 * Drop a banana
 * @returns {undefined|Number}
 */
Hathi.prototype.dropBanana = function() {
    var result;
    
    if ( (this.field[this.hathiX][this.hathiY] < 0) && (this.field[this.hathiX][this.hathiY] > Hathi.BASKET) ) {
        this.showBubble("img/nobanana.png");
        result = Hathi.NO_BANANA_DROP;
        return;
    }
    
    if ( this.bananas > 0 ) {
        if (this.field[this.hathiX][this.hathiY] <=  Hathi.BASKET ) {
            this.field[this.hathiX][this.hathiY]--;
        } else {
            this.field[this.hathiX][this.hathiY]++;
        }
        this.bananas--;
        result = Hathi.OK;
    } else {
        this.showBubble("img/nobanana.png");
        if ( this.terminateOnNoBananaDrop ) {
            result = Hathi.NO_BANANA;
        } else {
            result = Hathi.OK;
        }
    }
    this.drawSquare(this.hathiX,this.hathiY);
     
    return result;
};

/**
 * Returns Hathis collected bananas
 * @returns {Number}
 */
Hathi.prototype.getBananas = function() {
    this.showBubble("img/banana.png",this.bananas);
    return this.bananas;
}

/**
 * Returns bananas on ground
 * @returns {Number}
 */
Hathi.prototype.getBananasOnField = function() {
    if ( (this.field[this.hathiX][this.hathiY] > Hathi.BASKET) && (this.field[this.hathiX][this.hathiY] < 0) ) {
        this.showBubble("img/nobanana.png",0);
        return 0;
    }
    var v = 0;
    if ( this.field[this.hathiX][this.hathiY] < 0 ) {
        v = -Number(this.field[this.hathiX][this.hathiY]) + Hathi.BASKET;
        this.showBubble("img/basket.png",v);
    } else {
        v = this.field[this.hathiX][this.hathiY];
        this.showBubble("img/banana.png",v);
    }
    return v;
}

/**
 * 
 * @returns {unresolved}
 */
Hathi.prototype.isForwardEmpty = function() {
    return this.isEmpty(this.hathiX+this.hathiDX,this.hathiY+this.hathiDY);
};

/**
 * 
 * @param {type} type
 * @returns {Boolean}
 */
Hathi.prototype.isForward = function(type) {
    var x = (this.hathiX+this.hathiDX+this.width) % this.width;
    var y = (this.hathiY+this.hathiDY+this.height) % this.height;
    return ( this.field[x][y] == type );
};

/**
 * 
 * @param {type} text
 * @returns {undefined}
 */
Hathi.prototype.say = function(text) {
    this.showTextBubble(text);
}

/**
 * 
 * @param {type} event
 * @returns {undefined}
 */
Hathi.prototype.clicked = function(event) {
    if ( !World.editable ) return;
    
    var hathi = World.hathi;
    var x = Math.floor(event.offsetX/hathi.squareSize)-1;
    var y = Math.floor(event.offsetY/hathi.squareSize)-1;
    if ( y<0 ) y = 0;
    
    // hathi.hideCollision();
    hathi.hideBubble();
    
    if ( event.ctrlKey && (hathi.field[x][y] > 0)) {
        hathi.field[x][y] = (hathi.field[x][y] + 1) % 33;
        if ( hathi.field[x][y] == 0 ) hathi.field[x][y] = 1;
    } else {
        if (( x == hathi.hathiX ) && ( y == hathi.hathiY )) {
            hathi.turnRight();
        } else {
            hathi.field[x][y]--;
            if ( hathi.field[x][y] == -5 ) {
                hathi.field[x][y] = Hathi.BASKET;
            } else if ( hathi.field[x][y] < Hathi.BASKET ) {
                hathi.field[x][y] = 1;
            }
            hathi.put(hathi.field[x][y],x,y);
        }
    }
    hathi.drawSquare(x,y,true);
};


/**
 * 
 * @param {type} event
 * @returns {undefined}
 */
Hathi.prototype.rightclicked = function(event) { 
    if ( !World.editable ) return;
    
    var hathi = World.hathi;
    var x = Math.floor(event.offsetX/hathi.squareSize) - 1;
    var y = Math.floor(event.offsetY/hathi.squareSize) - 1;
    if ( y < 0 ) y = 0;
    // hathi.hideCollision();
    
    if (( x != hathi.hathiX ) || ( y != hathi.hathiY )) {
        var oldX = hathi.hathiX;
        var oldY = hathi.hathiY;
        hathi.hathiX = x;
        hathi.hathiY = y;
        // hathi.put(Hathi.EMPTY,x,y);
        hathi.drawSquare(oldX,oldY);
        hathi.drawSquare(x,y);
    } else {
        hathi.turnRight();
        hathi.drawSquare(x,y);
    }
    
};

