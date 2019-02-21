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
var World = new AbbozzaWorld("hathi");

var svgNS = "http://www.w3.org/2000/svg";

World.initView = function(view) {
    this.editable = true;
    this.hathi = new Hathi(view);
    this.hathi.parent_.tabIndex = "0";
    this._activateKeyboard(this.hathi.parent_);
    
    document.getElementById("speed").value = AbbozzaInterpreter.getSpeed();
    var info = document.getElementById("info");
    document.getElementById("width").value = World.hathi.width;
    document.getElementById("height").value = World.hathi.height;
    document.getElementById("size").value = World.hathi.squareSize;
    
    document.getElementById("width").oninput = function(event) {
        if ( !World.editable ) {
            document.getElementById("width").value = World.hathi.width;
            return;
        }
        World.hathi.setWidth(document.getElementById("width").value);
    }
    
    document.getElementById("height").oninput = function(event) {
        if ( !World.editable ) {
            document.getElementById("height").value = World.hathi.height;
            return;
        }
        World.hathi.setHeight(document.getElementById("height").value);
    }
    
    document.getElementById("size").oninput = function(event) {
        if ( !World.editable ) {
            document.getElementById("size").value = World.hathi.squareSize;
            return;
        }
        World.hathi.setSquareSize(document.getElementById("size").value);
    }
};

World.toDom = function() {
    return this.hathi.toDom();
};

World.fromDom = function(xml) {
    this.hathi.fromDom(xml);
};
    
World.resetWorld = function () {
    this.setEditable(true);
    this.hathi.setSize(20,20);
    this.hathi.reset();
};

World.startWorld = function() {
    this.hathi.onStart();
}


World.resize = function() {}


var svgNS = "http://www.w3.org/2000/svg";

/**
 * Hathis world as view for the context.
 */



function Hathi(view) {    
    // The prent div, containing all elements
    this.parent_ = document.createElement("div");
    this.parent_.className = "hathiParent";
    view.appendChild(this.parent_);

    // The wrapper containig the canvas and the svg elements
    this.wrapper_ = document.createElement("div");
    this.wrapper_.className = "hathiWrapper";
    this.parent_.appendChild(this.wrapper_);
    
    // The canvas to which the background is drawn
    this.view_ = document.createElement("canvas");
    this.view_.hathi = this;
    this.view_.className = "hathiView";
    this.view_.onclick = this.clicked;
    this.view_.oncontextmenu = this.rightclicked;
    this.context_ = this.view_.getContext("2d");
    this.wrapper_.appendChild(this.view_);

    // The div containing the svg above the canvas' parent
    this.svg_layer_ = document.createElement("div");
    this.svg_layer_.className = "hathiSvgLayer";
    this.parent_.appendChild(this.svg_layer_);
    
    // The svg layer
    this.hathi_svg = document.createElementNS(svgNS,"svg");
    this.hathi_svg.className = "hathiSvg";
    this.hathi_svg.onclick = this.clicked;
    this.hathi_svg.oncontextmenu = this.rightclicked;
    this.svg_layer_.appendChild(this.hathi_svg);
    
    // Hathis SVG object
    this.hathi_svg_g = document.createElementNS(svgNS,"g");
    this.hathi_svg_img = document.createElementNS(svgNS,"g");
    this.hathi_svg_i = document.createElementNS(svgNS,"image");
    this.hathi_svg_i.setAttribute("href","img/hathi_right.png");
    this.hathi_svg_i.setAttribute("width","80");
    this.hathi_svg_i.setAttribute("height","80");
    this.hathi_svg.appendChild(this.hathi_svg_g);
    this.hathi_svg_g.appendChild(this.hathi_svg_img);
    this.hathi_svg_img.appendChild(this.hathi_svg_i);
    
    // The bubbles SVG object
    this.hathi_bubble = document.createElementNS(svgNS,"g");
    this.hathi_bubble_path = document.createElementNS(svgNS,"path");
    this.hathi_bubble_path.setAttribute("stroke","black");
    this.hathi_bubble_path.setAttribute("fill","white");
    this.hathi_bubble_img = document.createElementNS(svgNS,"image");
    this.hathi_bubble_img.setAttribute("href","img/collision.png");
    this.hathi_bubble_img.setAttribute("x","103");
    this.hathi_bubble_img.setAttribute("y","-20");
    this.hathi_bubble_img.setAttribute("width","50");
    this.hathi_bubble_img.setAttribute("height","50");
    this.hathi_bubble.appendChild(this.hathi_bubble_path);
    this.hathi_bubble.appendChild(this.hathi_bubble_img);
    this.hideBubble();
   
    /*
    this.collision = document.createElementNS(svgNS,"g");
    this.collision_img = document.createElementNS(svgNS,"image");
    this.collision_img.setAttribute("href","img/collision.png");
    this.collision_img.setAttribute("width","80");
    this.collision_img.setAttribute("height","80");
    this.collision.appendChild(this.collision_img);
    */
   
    // The moving rock SVG object
    this.rock_svg_img = document.createElementNS(svgNS,"image");
    this.rock_svg_img.style.visibility = "hidden";
    this.rock_svg_img.setAttribute("href","img/rock.png");
    this.rock_svg_img.setAttribute("width","80");
    this.rock_svg_img.setAttribute("height","80");
    this.hathi_svg_g.appendChild(this.rock_svg_img);
    
    this.hathi_svg.appendChild(this.hathi_bubble);

    this.width = 20;
    this.height = 20;
    this.squareSize = 40;

    this.terminateOnFall = true;
    this.terminateOnCollision = false;
    
    this.loadImages();    
    this.reset();    
};


Hathi.UP = 1;
Hathi.RIGHT = 0;
Hathi.LEFT = 2;
Hathi.DOWN = 3;

Hathi.EMPTY = 0;
Hathi.ROCK = -1;
Hathi.HOLE = -2;
Hathi.TREE = -3;
Hathi.OASIS = -4;
Hathi.BANANA = 1;
Hathi.COLLISION = -5;
Hathi.FILLED = -6;

Hathi.OK = 0;
Hathi.BUMPED_TREE = 1;
Hathi.FELL_INTO_HOLE = 2;
Hathi.NO_BANANA = 3;


Hathi.prototype.loadImages = function() {
    this.numberOfBackgrounds = 10;
    this.backgroundImages = [];    
    this.backgroundImages[0] = this.loadImage("img/background0.png");
    this.backgroundImages[1] = this.backgroundImages[0];
    this.backgroundImages[2] = this.backgroundImages[0];
    this.backgroundImages[3] = this.backgroundImages[0];
    this.backgroundImages[4] = this.backgroundImages[0];
    this.backgroundImages[5] = this.backgroundImages[0];
    this.backgroundImages[6] = this.backgroundImages[0];
    this.backgroundImages[7] = this.backgroundImages[0];
    this.backgroundImages[8] = this.loadImage("img/background1.png");
    this.backgroundImages[9] = this.loadImage("img/background2.png");
    
    this.wallImages = [];
    this.wallImages[0] = this.loadImage("img/holeT0.png");
    this.wallImages[1] = this.loadImage("img/holeT1.png");
    this.wallImages[2] = this.loadImage("img/holeB0.png");
    this.wallImages[3] = this.loadImage("img/holeB1.png");
    this.wallImages[4] = this.loadImage("img/holeL0.png");
    this.wallImages[5] = this.loadImage("img/holeL1.png");
    this.wallImages[6] = this.loadImage("img/holeR0.png");
    this.wallImages[7] = this.loadImage("img/holeR1.png");
    this.wallImages[8] = this.loadImage("img/filled.png");
    this.wallImages[9] = this.loadImage("img/rockwall.png");   

    this.images=[];
    this.images[-Hathi.ROCK] = this.loadImage("img/rock.png");
    this.images[-Hathi.TREE] = this.loadImage("img/tree2.png");
    this.images[-Hathi.OASIS] = this.loadImage("img/oasis.png");
    this.images[-Hathi.BANANA] = this.loadImage("img/banana.png");
    this.images[-Hathi.COLLISION] = this.loadImage("img/collision.png");
       
    this.hathiImages = [];
    this.hathiImages[Hathi.UP] = this.loadImage("img/hathi_back.png");
    this.hathiImages[Hathi.LEFT] = this.loadImage("img/hathi_left.png");
    this.hathiImages[Hathi.RIGHT] = this.loadImage("img/hathi_right.png");
    this.hathiImages[Hathi.DOWN] = this.loadImage("img/hathi_front.png");
};


Hathi.prototype.loadImage = function(path, redraw = true) {
    var pic = document.createElement("img");
    pic.style.display = "none";
    pic.src = path;

    if ( redraw ) {
        var hathi = this;
        pic.onload = function (event) {
            hathi.redraw();
        };
    }
    return pic;
}


Hathi.prototype.reset = function(newBackground = true, restore = true) {
    this.offsetY = 0;
    this.hathiX = 0;
    this.hathiY = 0;
    this.hathiDir = 0;
    this.hathiDX = 1;
    this.hathiDY = 0;
    this.moved = false;
    // this.hideCollision();
    this.collX = 0;
    this.collY = 0;
    this.collX2 = 0;
    this.collY2 = 0;

    var oldField = this.field;

    // Reset the fields
    if ( newBackground ) this.background = [];
    this.field = [];
    this.svgs = [];
    for ( var x = 0; x < 40; x++) {
        if ( newBackground ) this.background[x] = [];
        this.field[x] = [];
        this.svgs[x] = [];
        for ( var y = 0; y < 40; y++) {
            if ( newBackground ) {
                this.background[x][y] = Math.floor((Math.random() * this.numberOfBackgrounds));
            }
            this.field[x][y] = Hathi.EMPTY;
            this.svgs[x][y] = null;
        }
    }
   
    // Remove all svg children
    while ( this.hathi_svg_g.hasChildNodes() ) {
        this.hathi_svg_g.removeChild(this.hathi_svg_g.firstChild);
    }
    // Add hathi
    this.hathi_svg.appendChild(this.hathi_svg_g);
    // Add bubble
    this.hathi_svg.appendChild(this.hathi_bubble);
    
    var defs = document.createElementNS(svgNS,"defs");
    var clippath = document.createElementNS(svgNS,"clipPath");
    clippath.id="clipping";
    var path = document.createElementNS(svgNS,"rect");
    path.setAttribute("x","0");
    path.setAttribute("y","0");
    path.setAttribute("width",this.squareSize + "px");
    path.setAttribute("height",(3*this.squareSize/2 - 4) + "px");
    clippath.appendChild(path);
    defs.appendChild(clippath);
    this.hathi_svg_g.appendChild(defs);

    
    if ( restore ) {
        for (var x = 0; x < this.width; x++) {
            var svgline = [];
            var line = []
            var bkgline = []
            for (var y = 0; y < this.height; y++) {
                if ( oldField && oldField[x] && oldField[x][y] ) {
                    this.field[x][y] = oldField[x][y];
                } else {
                    this.field[x][y] = 0;
                }
            
                var type = this.field[x][y];
                var img = null;
                if ( type != 0 ) { 
                    this.put(type,x,y);
                }            
            }
        }
    }
    
    this.resize();
};


Hathi.prototype.resize = function() {
    var parHeight = this.parent_.offsetHeight;
    var parWidth = this.parent_.ossfetWidth;
    
    document.getElementById("width").value = this.width;
    document.getElementById("height").value = this.height;

    var oldField = this.field;
    
    this.field = [];
    for (var x = 0; x < this.width; x++) {
        var line = []
        for (var y = 0; y < this.height; y++) {
            if ( oldField && oldField[x] && oldField[x][y] ) {
                line.push(oldField[x][y]);
            } else {
                line.push(0);
            }
        }
        this.field.push(line);
    }
    
    this.hathi_svg_img.setAttribute("width",this.squareSize);
    this.hathi_svg_img.setAttribute("height",this.squareSize);
    this.hathi_svg_i.setAttribute("width",this.squareSize);
    this.hathi_svg_i.setAttribute("height",this.squareSize);
    this.rock_svg_img.setAttribute("width",this.squareSize);
    this.rock_svg_img.setAttribute("height",this.squareSize);
    // this.collision_img.setAttribute("width",this.squareSize);
    // this.collision_img.setAttribute("height",this.squareSize);
    
    var w = (this.width+2) * this.squareSize;
    var h = (this.height+2) * this.squareSize;

    if ( parHeight > h ) {
        this.offsetY = (parHeight - h)/2;    
    } else {
        this.offsetY = 0;       
    }
    
    this.wrapper_.style.width = w + "px";
    this.wrapper_.style.height = h + "px";
    this.wrapper_.style.marginTop = this.offsetY + "px";
    
    this.view_.width = w;
    this.view_.height = h;
    
    this.svg_layer_.style.width = w + "px";
    this.svg_layer_.style.height = h + "px";
    this.svg_layer_.style.marginTop = this.offsetY + "px";
    
    this.hathi_svg.setAttribute("width",w+"px");
    this.hathi_svg.setAttribute("height",h+"px");
    this.hathi_svg.setAttribute("viewBox","0 0 " + w + " " + h);
    
    this.redraw();        
};


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


Hathi.prototype.setWidth = function(w) {
    this.width = Number(w);
    document.getElementById("width").value = this.width;
    this.resize();
    this.redraw();
}

Hathi.prototype.setHeight = function(w) {
    this.height = Number(w);
    document.getElementById("height").value = this.height;
    this.resize();
    this.redraw();
}

Hathi.prototype.setSize = function(w,h) {
    this.width = Number(w);
    this.height = Number(h);
    this.resize();
}

Hathi.prototype.setSquareSize = function(w) {
    this.squareSize = Number(w);
    this.reset(false,true);
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

    if (this.field[x][y] <= 0) {
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
        }
    } else {
        this.context_.drawImage(this.images[-Hathi.BANANA], xpos, ypos, siz, siz);
        if (this.field[x][y] > 1) {
            this.context_.strokeStyle = "black";
            this.context_.fillStyle = "white";
            this.context_.font = "bold " + this.squareSize / 2 + "px arial";
            var w = this.context_.measureText(this.field[x][y]).width;
            this.context_.fillText(this.field[x][y], xpos + siz / 2 - (w / 2) - siz/5 , ypos + 4 * siz / 6 - siz/4);
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


Hathi.prototype.showBubble = function(img = null) {
    if ( img != null ) {
       this.hathi_bubble_img.setAttribute("href",img);
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
}


Hathi.prototype.hideBubble = function() {
    this.bubble_shown = false;
    this.hathi_bubble. style.display = "none";
}


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



Hathi.prototype.get = function(x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    return this.field[x][y];
}


Hathi.prototype.turnRight = function () {
    this.hideBubble();
    this.hathiDir = (this.hathiDir + 3) % 4;
    var dum = this.hathiDX;
    this.hathiDX = -this.hathiDY;
    this.hathiDY = dum;
    this.drawSquare(this.hathiX, this.hathiY);
};

Hathi.prototype.turnLeft = function () {
    this.hideBubble();
    this.hathiDir = (this.hathiDir + 1) % 4;
    var dum = this.hathiDX;
    this.hathiDX = this.hathiDY;
    this.hathiDY = -dum;
    this.drawSquare(this.hathiX, this.hathiY);
};


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


Hathi.prototype.steppedForward = function() {
   return this.moved;
}


Hathi.prototype.isEmpty = function(x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    return ( this.field[x][y] == 0 );
};

Hathi.prototype.onCollisionWithBorder = function () {
    this.showBubble("img/stopsign.png");
    return Hathi.OK;
};

Hathi.prototype.onCollisionWithRock = function () {
    this.showBubble("img/stopsign.png");
    return Hathi.OK;
};

Hathi.prototype.onCollisionWithTree = function () {
    this.showBubble("img/stopsign.png");
    if ( this.terminateOnCollision ) {
        return Hathi.BUMPED_TREE;
    } else {
        return Hathi.OK;
    }
};

Hathi.prototype.onFall = function () {
    this.showBubble("img/stopsign.png");
    if ( this.terminateOnFall ) {
        return Hathi.FELL_INTO_HOLE;
    } else {
        return Hathi.OK;
    }
};

Hathi.prototype.noBanana = function() {
    this.showBubble("img/nobanana.png");
    return Hathi.NO_BANANA;
};

Hathi.prototype.isOnBanana = function() {
    return ( this.field[this.hathiX][this.hathiY] > 0 );
};

Hathi.prototype.isOn = function(type) {
    return ( this.field[this.hathiX][this.hathiY] == type );
};


Hathi.prototype.pickUpBanana = function() {
    if ( this.field[this.hathiX][this.hathiY] <= 0 ) {
        return this.noBanana();
    }
    
    if (this.bananas < 64 ) {
        this.field[this.hathiX][this.hathiY]--;
        this.bananas++;
        this.drawSquare(this.hathiX,this.hathiY);
        this.showBubble("img/banana.png");
    } else {
        this.showBubble("img/banana.png");        
    }
    return Hathi.OK;
};


Hathi.prototype.dropBanana = function() {
    if ( this.field[this.hathiX][this.hathiY] < 0 ) {
        // this.onCollision();
        return;
    }
    if ( this.bananas > 0 ) {
        this.field[this.hathiX][this.hathiY]++;
        this.bananas--;
        this.showBubble();
    } else {
        this.showBubble();        
    }
    this.drawSquare(this.hathiX,this.hathiY);
};

Hathi.prototype.getBananas = function() {
    return this.bananas;
}


Hathi.prototype.isForwardEmpty = function() {
    return this.isEmpty(this.hathiX+this.hathiDX,this.hathiY+this.hathiDY);
};

Hathi.prototype.isForward = function(type) {
    var x = (this.hathiX+this.hathiDX+this.width) % this.width;
    var y = (this.hathiY+this.hathiDY+this.height) % this.height;
    return ( this.field[x][y] == type );
};


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
            if ( hathi.field[x][y] < -4 ) hathi.field[x][y] = 1;
            hathi.put(hathi.field[x][y],x,y);
        }
    }
    hathi.drawSquare(x,y,true);
};



Hathi.prototype.rightclicked = function(event) { 
    if ( !World.editable ) return;
    
    var hathi = World.hathi;
    var x = Math.floor(event.offsetX/hathi.squareSize) - 1;
    var y = Math.floor(event.offsetY/hathi.squareSize) - 1;
    if ( y<0 ) y = 0;
    // hathi.hideCollision();
    
    if (( x != hathi.hathiX ) || ( y != hathi.hathiY )) {
        var oldX = hathi.hathiX;
        var oldY = hathi.hathiY;
        hathi.hathiX = x;
        hathi.hathiY = y;
        hathi.put(Hathi.EMPTY,x,y);
        hathi.drawSquare(oldX,oldY);
        hathi.drawSquare(x,y);
    } else {
        hathi.turnRight();
        hathi.drawSquare(x,y);
    }
    
};


Hathi.prototype.toDom = function() {
    var root = document.createElement("world");
    root.setAttribute("width",this.width);
    root.setAttribute("height",this.height);
    
    var hathi = document.createElement("hathi");
    hathi.setAttribute("x", this.hathiX);
    hathi.setAttribute("y", this.hathiY);
    hathi.setAttribute("dir", this.hathiDir);
    root.appendChild(hathi);
    
    var el;
    
    for ( var row = 0; row < this.height; row++ ) {
        for ( var col = 0 ; col < this.width ; col++ ) {
            if ( this.field[col][row] != 0 ) {
                switch ( this.field[col][row] ) {
                    case Hathi.ROCK:
                        el = document.createElement("rock");
                        break;
                    case Hathi.TREE:
                        el = document.createElement("tree");
                        break;
                    case Hathi.HOLE:
                        el = document.createElement("hole");
                        break;
                    case Hathi.OASIS:
                        el = document.createElement("oasis");
                        break;
                    default:
                        el = document.createElement("banana");
                        el.setAttribute("count", this.field[col][row]);
                        break;
                        
                }
                el.setAttribute("x", col);
                el.setAttribute("y", row);
                root.appendChild(el);
            }
        }
    }
    return root;
};


Hathi.prototype.fromDom = function(xml) {
    this.width = Number(xml.getAttribute("width"));
    this.height = Number(xml.getAttribute("height"));
    
    this.reset(true,false);
    
    for ( var idx = 0; idx < xml.children.length; idx++) {
        var child = xml.children[idx];
        if ( child ) {
            if ( child.nodeName == "hathi" ) {
                this.hathiX = Number(child.getAttribute("x"));
                this.hathiY = Number(child.getAttribute("y"));
                this.hathiDir = Number(child.getAttribute("dir"));
            } else {
                var type;
                var x = Number(child.getAttribute("x"));
                var y = Number(child.getAttribute("y"));
                if ( child.nodeName == "rock" ) type = Hathi.ROCK;
                else if ( child.nodeName == "tree" ) {
                    type = Hathi.TREE;
                } else if ( child.nodeName == "rock" ) {
                    type = Hathi.ROCK;
                } else if ( child.nodeName == "oasis" ) type = Hathi.OASIS;
                else if ( child.nodeName == "banana" ) type = child.getAttribute("count");
                this.field[x][y] = Number(type);
                this.put(type,x,y);
            }
        }
    }
    this.redraw();
};


World.wrapper = function(func,args) {
    return func.apply(World.hathi,args);
};


World.createWrapper = function(func) {
    return function(arg) {
        var args= [];
        for ( var i = 0 ; i < arguments.length; i++ ) {
            args[i] = arguments[i];
        }
        return World.wrapper(World.hathi[func],args);        
    };
};

World.initSourceInterpreter = function(interpreter,scope) {
    var funcs = [
      'turnRight','turnLeft','forward','steppedForward',
      'isOnBanana','pickUpBanana','dropBanana','isForwardEmpty',
      'isForward'
    ];
    AbbozzaInterpreter.createNativeWrappersByName(interpreter,scope,World.hathi,funcs);
    /*
    for ( var i = 0; i < funcs.length; i++ ) {
        interpreter.setProperty(scope,funcs[i],
            interpreter.createNativeFunction( World.createWrapper(funcs[i]) )
        );        
    }
    */
};


World.setEditable = function(editable) {
    this.editable = editable;
}
