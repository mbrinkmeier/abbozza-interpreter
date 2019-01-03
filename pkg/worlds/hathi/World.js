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
 * The turtle as view for the context.
 */


function Hathi(view) {
    
    this.parent_ = document.createElement("div");
    this.parent_.className = "hathiParent";
    view.appendChild(this.parent_);

    this.wrapper_ = document.createElement("div");
    this.wrapper_.className = "hathiWrapper";
    this.parent_.appendChild(this.wrapper_);
    
    this.view_ = document.createElement("canvas");
    this.view_.hathi = this;
    this.view_.className = "hathiView";
    this.view_.onclick = this.clicked;
    this.view_.oncontextmenu = this.rightclicked;
    this.context_ = this.view_.getContext("2d");
    this.wrapper_.appendChild(this.view_);

    this.svg_layer_ = document.createElement("div");
    this.svg_layer_.className = "hathiSvgLayer";
    this.parent_.appendChild(this.svg_layer_);
    
    /*
    // Preload the images
    this.pic_hathi_up_ = document.createElement("img");
    this.pic_hathi_up_.style.display = "none";
    this.pic_hathi_up_.src = "img/hathi_back.png";
    this.pic_hathi_up_.onload = function (event) {
        World.hathi.redraw();
    };

    this.pic_hathi_right_ = document.createElement("img");
    this.pic_hathi_right_.style.display = "none";
    this.pic_hathi_right_.src = "img/hathi_right.png";
    this.pic_hathi_right_.onload = function (event) {
        World.hathi.redraw();
    };


    this.pic_hathi_left_ = document.createElement("img");
    this.pic_hathi_left_.style.display = "none";
    this.pic_hathi_left_.src = "img/hathi_left.png";
    this.pic_hathi_left_.onload = function (event) {
        World.hathi.redraw();
    };

    this.pic_hathi_down_ = document.createElement("img");
    this.pic_hathi_down_.style.display = "none";
    this.pic_hathi_down_.src = "img/hathi_front.png";
    this.pic_hathi_down_.onload = function (event) {
        World.hathi.redraw();
    };
    */

    // The svg layer
    this.hathi_svg = document.createElementNS(svgNS,"svg");
    this.hathi_svg.className = "hathiSvg";
    this.hathi_svg.onclick = this.clicked;
    this.hathi_svg.oncontextmenu = this.rightclicked;
    
    this.svg_layer_.appendChild(this.hathi_svg);
    
    // Hathi
    this.hathi_svg_g = document.createElementNS(svgNS,"g");
    this.hathi_svg_img = document.createElementNS(svgNS,"image");
    this.hathi_svg_img.setAttribute("href","img/hathi_right.png");
    this.hathi_svg_img.setAttribute("width","80");
    this.hathi_svg_img.setAttribute("height","80");
    this.hathi_svg.appendChild(this.hathi_svg_g);
    this.hathi_svg_g.appendChild(this.hathi_svg_img);
    
    
    this.rock_svg_img = document.createElementNS(svgNS,"image");
    this.rock_svg_img.style.visibility = "hidden";
    this.rock_svg_img.setAttribute("href","img/rock.png");
    this.rock_svg_img.setAttribute("width","80");
    this.rock_svg_img.setAttribute("height","80");
    this.hathi_svg.appendChild(this.rock_svg_img);

    
    /*
    this.pic_rock_ = document.createElement("img");
    this.pic_rock_.style.display = "none";
    this.pic_rock_.src = "img/rock.png";
    this.pic_rock_.onload = function (event) {
        World.hathi.redraw();
    };
    */
   
    /*
    this.pic_peanut_ = document.createElement("img");
    this.pic_peanut_.style.display = "none";
    this.pic_peanut_.src = "img/peanut.png";
    this.pic_peanut_.onload = function (event) {
        World.hathi.redraw();
    };
    */
   
    /*
    this.pic_hole_ = document.createElement("img");
    this.pic_hole_.style.display = "none";
    this.pic_hole_.src = "img/hole.png";
    this.pic_hole_.onload = function (event) {
        World.hathi.redraw();
    };
    */

    /*
    this.pic_tree_ = document.createElement("img");
    this.pic_tree_.style.display = "none";
    this.pic_tree_.src = "img/tree.png";
    this.pic_tree_.onload = function (event) {
        World.hathi.redraw();
    };

    this.pic_oasis_ = document.createElement("img");
    this.pic_oasis_.style.display = "none";
    this.pic_oasis_.src = "img/oasis.png";
    this.pic_oasis_.onload = function (event) {
       World.hathi.redraw();
    };
    */
   
    this.width = 20;
    this.height = 20;
    this.squareSize = 40;

    this.loadImages();
    
    this.reset();
    
    this.put(Hathi.ROCK,2,0);
    this.put(Hathi.HOLE,6,0);
    this.redraw();
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
Hathi.PEANUT = 1;


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
    this.backgroundImages[7] = this.loadImage("img/background1.png");
    this.backgroundImages[8] = this.backgroundImages[7];
    this.backgroundImages[9] = this.loadImage("img/background2.png");
    
    this.holeImages = [];
    this.holeImages[0] = this.loadImage("img/hole0.png");
    this.holeImages[1] = this.loadImage("img/hole1.png");
    this.holeImages[2] = this.loadImage("img/hole2.png");
    this.holeImages[3] = this.loadImage("img/hole3.png");
    this.holeImages[4] = this.loadImage("img/hole4.png");
    this.holeImages[5] = this.loadImage("img/hole5.png");
    this.holeImages[6] = this.loadImage("img/hole6.png");
    this.holeImages[7] = this.loadImage("img/hole7.png");
    this.holeImages[8] = this.loadImage("img/hole8.png");
    this.holeImages[9] = this.loadImage("img/hole9.png");
    this.holeImages[10] = this.loadImage("img/hole10.png");
    this.holeImages[11] = this.loadImage("img/hole11.png");
    this.holeImages[12] = this.loadImage("img/hole12.png");
    this.holeImages[13] = this.loadImage("img/hole13.png");
    this.holeImages[14] = this.loadImage("img/hole14.png");
    this.holeImages[15] = this.loadImage("img/hole15.png");
    
    this.images=[];
    this.images[-Hathi.ROCK] = this.loadImage("img/rock.png");
    this.images[-Hathi.TREE] = this.loadImage("img/tree.png");
    this.images[-Hathi.OASIS] = this.loadImage("img/oasis.png");
    this.images[-Hathi.PEANUT] = this.loadImage("img/peanut.png");
    
    /*
    this.imageSvgs = [];
    
    var g = document.createElementNS(svgNS,"g");
    g.id = "svgRock";
    var img = document.createElementNS(svgNS,"image");
    img.setAttribute("href","img/rock.png");
    img.setAttribute("width","80");
    img.setAttribute("height","80");
    g.appendChild(img);
    this.imageSvgs[-Hathi.ROCK] = g;
    
    g = document.createElementNS(svgNS,"g");
    g.id = "svgTree";
    var img = document.createElementNS(svgNS,"image");
    img.setAttribute("href","img/tree.png");
    img.setAttribute("width","80");
    img.setAttribute("height","80");
    g.appendChild(img);
    this.imageSvgs[-Hathi.TREE] = g;
    
    g = document.createElementNS(svgNS,"g");
    g.id = "svgOasis";
    var img = document.createElementNS(svgNS,"image");
    img.setAttribute("href","img/oasis.png");
    img.setAttribute("width","80");
    img.setAttribute("height","80");
    g.appendChild(img);
    this.imageSvgs[-Hathi.OASIS] = g;

    g = document.createElementNS(svgNS,"g");
    g.id = "svgPeanut";
    var img = document.createElementNS(svgNS,"image");
    img.setAttribute("href","img/peanut.png");
    img.setAttribute("width","80");
    img.setAttribute("height","80");
    g.appendChild(img);
    this.imageSvgs[-Hathi.PEANUT] = g;
    */
   
    this.hathiImages = [];
    this.hathiImages[Hathi.UP] = this.loadImage("img/hathi_back.png");
    this.hathiImages[Hathi.LEFT] = this.loadImage("img/hathi_left.png");
    this.hathiImages[Hathi.RIGHT] = this.loadImage("img/hathi_right.png");
    this.hathiImages[Hathi.DOWN] = this.loadImage("img/hathi_front.png");
}


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


Hathi.prototype.reset = function(newBackground = true) {
    this.offsetY = 0;
    this.hathiX = 0;
    this.hathiY = 0;
    this.hathiDir = 0;
    this.hathiDX = 1;
    this.hathiDY = 0;
    this.moved = false;
    this.hideCollision();
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
    while ( this.hathi_svg.hasChildNodes() ) {
        this.hathi_svg.removeChild(this.hathi_svg.firstChild);
    }
    // Add hathi
    this.hathi_svg.appendChild(this.hathi_svg_g);
    // this.hathi_svg.appendChild(this.rock_svg_img);
    
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
    
    this.resize();   
};


Hathi.prototype.resize = function() {
    var parHeight = this.parent_.offsetHeight;
    var parWidth = this.parent_.ossfetWidth;
    
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
    this.rock_svg_img.setAttribute("width",this.squareSize);
    this.rock_svg_img.setAttribute("height",this.squareSize);
    
    var w = this.width * this.squareSize;
    var h = this.height * this.squareSize + this.squareSize/2;

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
    this.hideCollision();
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
    document.getElementById("width").value = this.width;
    document.getElementById("height").value = this.height;
    this.resize();
}

Hathi.prototype.setSquareSize = function(w) {
    this.squareSize = Number(w);
    this.reset(false);
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
        this.context_.moveTo(0, this.squareSize * i + this.squareSize/2);
        this.context_.lineTo(this.view_.width, this.squareSize * i + this.squareSize/2);
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
};

Hathi.prototype.drawSquare = function (x, y, neighbors = false) {
    
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;

    var xpos = x * this.squareSize + 1;
    var ypos = y * this.squareSize + 1 + this.squareSize/2;
    var siz = this.squareSize - 2;

    /*
    var svg = this.svgs[x][y];
    if ( svg != null ) {
        svg.setAttribute("transform","translate(" + xpos + "," + ypos + ")");
        svg.setAttribute("width",siz+"px");
        svg.setAttribute("height",siz+"px");
        svg.setAttribute("viewBox","0 0 " + siz + " " + siz);
    }
    */
   
    // Draw empty square as basis

    
    this.context_.fillStyle = "#316428";
    this.context_.fillRect(x * this.squareSize, y * this.squareSize+ this.squareSize/2,
            this.squareSize, this.squareSize
            );
    this.context_.fillStyle = "#316428";
    this.context_.fillRect(
            x * this.squareSize + 1, y * this.squareSize + this.squareSize/2+ 1,
            this.squareSize - 2, this.squareSize - 2
            );

    this.context_.drawImage(this.backgroundImages[this.background[x][y]],xpos,ypos,siz,siz);

    if (this.field[x][y] <= 0) {
        switch (this.field[x][y]) {
            case Hathi.EMPTY:
                break;
            case Hathi.ROCK:
                // The rock is drawn to the canvas                
                // this.context_.drawImage(this.images[-Hathi.ROCK], xpos, ypos, siz, siz);
                break;
            case Hathi.TREE:
                // The tree is drawn to the canvas
                // this.context_.drawImage(this.images[-Hathi.TREE], xpos, ypos, siz, siz);
                break;
            case Hathi.HOLE:
                // The hole is drawn to the canvas
                var border = 0;
                if ( ( y > 0 ) && ( this.field[x][y-1] == Hathi.HOLE ) ) {
                    border = border + 1;
                }
                if ( ( x < this.width-1) && ( this.field[x+1][y] == Hathi.HOLE ) ) {
                    border = border + 2;
                }
                if ( ( y < this.height-1 ) && ( this.field[x][y+1] == Hathi.HOLE ) ) {
                    border = border + 4;
                }
                if ( ( x > 0 ) && ( this.field[x-1][y] == Hathi.HOLE ) ) {
                    border = border + 8;
                }
                this.context_.drawImage(this.holeImages[border], xpos, ypos, siz, siz);
                
                /*
                if ( this.field[x][y-1] == Hathi.HOLE) {
                    this.context_.drawImage(this.images[-Hathi.HOLE], xpos, ypos, siz, siz);
                } else {
                    this.context_.drawImage(this.images[-Hathi.HOLEWALL], xpos, ypos, siz, siz);                    
                }
                */
                break;
            case Hathi.OASIS:
                // The oasis is drawn to the canvas
                // this.context_.drawImage(this.images[-Hathi.OASIS], xpos, ypos, siz, siz);
                break;
        }
    } else {
        this.context_.drawImage(this.images[-Hathi.PEANUT], xpos, ypos, siz, siz);
        if (this.field[x][y] > 1) {
            this.context_.strokeStyle = "black";
            this.context_.fillStyle = "white";
            this.context_.font = "bold " + this.squareSize / 2 + "px arial";
            var w = this.context_.measureText(this.field[x][y]).width;
            this.context_.fillText(this.field[x][y], xpos + siz / 2 - (w / 2), ypos + 4 * siz / 6);
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
        this.hathi_svg_img.setAttribute("href",href);
        this.hathi_svg_img.setAttribute("transform","translate(" + xpos + "," + ypos + ")");
    }
    
    if (neighbors) {
        this.drawSquare(x-1,y,false);
        this.drawSquare(x+1,y,false);
        this.drawSquare(x,y-1,false);
        this.drawSquare(x,y+1,false);
    }
};


Hathi.prototype.showCollision = function() {
    // Upper left corner of collision
    var x = this.hathiX * this.squareSize + this.hathiDX * this.squareSize/2+1;
    var y = this.hathiY * this.squareSize + this.hathiDY * this.squareSize/2+1+this.offsetY;
    this.collX = this.hathiX;
    this.collY = this.hathiY;
    this.collX2 = this.hathiX + this.hathiDX;
    this.collY2 = this.hathiY + this.hathiDY;    
    var siz = this.squareSize-2;
    
    this.context_.drawImage(this.pic_collision_, x, y, siz, siz);
}

Hathi.prototype.hideCollision = function() {
    if ( this.collX ) {
        this.drawSquare(this.collX,this.collY);
        this.drawSquare(this.collX2,this.collY2);
    }
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
       img.setAttribute("href","img/tree.png");
       img.setAttribute("height","120");
    } else if ( type == Hathi.OASIS ) {
       img.setAttribute("href","img/oasis.png");
       img.setAttribute("height","80");
    }
    img.setAttribute("width","80");
    this.putSvgAt(img,x,y);
    
    // this.drawSquare(x,y,true);
    
    return img;
};

// Puts the svg at the given position.
Hathi.prototype.putSvgAt = function(svg,x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    if ( svg == null ) return;
    var oldSvg = this.svgs[x][y];
    this.svgs[x][y] = svg;
    
    if ( oldSvg != null) {
        this.hathi_svg.insertBefore(svg,oldSvg);
        this.hathi_svg.removeChild(oldSvg);
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
            this.hathi_svg.insertBefore(svg,s);
        } else {
            this.hathi_svg.appendChild(svg);
        }
    }

    var xpos = x * this.squareSize + 1;
    var ypos = y * this.squareSize + 1;
    var siz = this.squareSize - 2;

    svg.setAttribute("width",siz+"px");
    if ( (this.field[x][y] == Hathi.TREE) || (this.field[x][y] == Hathi.ROCK) ) {
        svg.setAttribute("height",((3*siz)/2)+"px");
        svg.setAttribute("transform","translate(" + xpos  + "," + ( ypos ) + ")");
    } else {
        svg.setAttribute("height",siz+"px");        
        svg.setAttribute("transform","translate(" + xpos + "," + (ypos + this.squareSize/2) + ")");
    }
    svg.setAttribute("viewBox","0 0 " + siz + " " + siz);
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
      this.hathi_svg.removeChild(svg);
  }
};



Hathi.prototype.get = function(x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    return this.field[x][y];
}


Hathi.prototype.turnRight = function () {
    this.hathiDir = (this.hathiDir + 3) % 4;
    var dum = this.hathiDX;
    this.hathiDX = -this.hathiDY;
    this.hathiDY = dum;
    this.drawSquare(this.hathiX, this.hathiY);
};

Hathi.prototype.turnLeft = function () {
    this.hathiDir = (this.hathiDir + 1) % 4;
    var dum = this.hathiDX;
    this.hathiDX = this.hathiDY;
    this.hathiDY = -dum;
    this.drawSquare(this.hathiX, this.hathiY);
};


Hathi.prototype.forward = function () {
    var oldX = this.hathiX;
    var oldY = this.hathiY;
    var newX = ( this.hathiX + this.hathiDX + this.width ) % this.width;
    var newY = ( this.hathiY + this.hathiDY + this.height ) % this.height;

    if ( this.field[newX][newY] < 0 ) {
        if ( this.field[newX][newY] == Hathi.ROCK ) {
            // Push the rock
            if ( this.isEmpty(newX+this.hathiDX,newY+this.hathiDY) ) {
                this.hathiX = newX;
                this.hathiY = newY;
                this.moved = true;
                this.moveRock(oldX,oldY,newX,newY,newX+this.hathiDX,newY+this.hathiDY);
                // this.moveHathi(oldX,oldY,newX,newY);
            } else if ( this.field[newX+this.hathiDX][newY+this.hathiDY] == Hathi.HOLE ) {
                // Fill hole with rock
                // this.put(Hathi.EMPTY,newX+this.hathiDX,newY+this.hathiDY);
                // this.put(Hathi.EMPTY,newX,newY);                
                // this.drawSquare(newX+this.hathiDX,newY+this.hathiDY);
                // this.drawSquare(newX,newY,true);
                this.hathiX = newX;
                this.hathiY = newY;
                this.moved = true;
                this.moveRock(oldX,oldY,newX,newY,newX+this.hathiDX,newY+this.hathiDY,true);
                // this.moveHathi(oldX,oldY,newX,newY);
            } else {
                // Collision without abort!
                this.collision();
                this.moved = false;
                return 0;
            }
        } else if ( this.field[newX][newY] == Hathi.TREE ) {
            // Collision with out abort!
            this.collision();
            this.moved = false;
            return 0;
        } else {
            // Collision with abort
            this.collision();
            this.showCollision();
            this.moved = false;
            return 2;
        }
    } else {
        this.hathiX = newX;
        this.hathiY = newY;
        this.moved = true;
        this.moveHathi(oldX,oldY,newX,newY);
    }
    // this.drawSquare(oldX, oldY);
    this.redraw();
    return 0;
};



Hathi.prototype.moveHathi = function(oldX,oldY,newX,newY) {
    var nx = newX * this.squareSize;
    var ny = newY * this.squareSize;
    var ox = oldX * this.squareSize;
    var oy = oldY * this.squareSize;
        var anim = this.hathi_svg_img.animate(
            [
                { transform: "translate(" + ox + "px," + (oy+2 + this.squareSize/2) + "px)" },
                { transform: "translate(" + nx + "px," + (ny+2 + this.squareSize/2) + "px)" }
            ],
            {
                duration: 250,
                additive: "replace",
                accumulate: "sum"
            });
        Abbozza.waitForAnimation(anim, function() { 
            World.hathi.drawSquare(World.hathi.hathiX,World.hathi.hathiY);
        });    
};


Hathi.prototype.moveRock = function(hathiX,hathiY,oldX,oldY,newX,newY,vanish = false) {
    newX = ( newX + this.width ) % this.width;
    newY = ( newY + this.height ) % this.height;
    oldX = ( oldX + this.width ) % this.width;
    oldY = ( oldY + this.height ) % this.height;
    var hx = hathiX * this.squareSize;
    var hy = hathiY * this.squareSize;
    var nx = newX * this.squareSize;
    var ny = newY * this.squareSize;
    var ox = oldX * this.squareSize;
    var oy = oldY * this.squareSize;
    var svg = this.svgs[oldX][oldY];
    
    var keyframes;
    var duration;
    if ( vanish ) {
        keyframes = [
                { transform: "translate(" + ox + "px," + (oy - this.squareSize/2 + 2 + this.squareSize/2) + "px)" },
                { transform: "translate(" + nx + "px," + (ny + 2) + "px )" },
                { transform: "translate(" + (nx + this.squareSize/2) + "px," + (ny+this.squareSize) + "px) scale(0.1)" }
            ];         
        duration = 500;
    } else {
        keyframes = [
                { transform: "translate(" + ox + "px," + (oy - this.squareSize/2 + 2 + this.squareSize/2) + "px)" },
                { transform: "translate(" + nx + "px," + (ny + 2) + "px)" }
            ]; 
        duration = 250;
    }
    
    var hanim = this.hathi_svg_img.animate(
            [
               { transform: "translate(" + hx + "px," + (hy+2+ this.squareSize/2) + "px)" },
               { transform: "translate(" + ox + "px," + (oy+2+ this.squareSize/2) + "px)" }
            ],
            {
                duration: 250,
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
            // World.hathi.rock_svg_img.style.visibility = "hidden";
            if ( vanish ) {
                World.hathi.field[oldX][oldY] = Hathi.EMPTY;
                World.hathi.field[newX][newY] = Hathi.EMPTY;
                World.hathi.svgs[oldX][oldY] = null;
                World.hathi.svgs[newX][newY] = null;
                World.hathi.hathi_svg.removeChild(svg);
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

Hathi.prototype.collision = function () {
};

Hathi.prototype.isOnPeanut = function() {
    return ( this.field[this.hathiX][this.hathiY] > 0 );
};

Hathi.prototype.pickUpPeanut = function() {
    if ( this.field[this.hathiX][this.hathiY] <= 0 ) {
        this.collision();
        return;
    }
    this.field[this.hathiX][this.hathiY]--;
    this.drawSquare(this.hathiX,this.hathiY);
};


Hathi.prototype.dropPeanut = function() {
    if ( this.field[this.hathiX][this.hathiY] < 0 ) {
        this.collision();
        return;
    }
    this.field[this.hathiX][this.hathiY]++;
    this.drawSquare(this.hathiX,this.hathiY);
};



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
    var x = Math.floor(event.offsetX/hathi.squareSize);
    var y = Math.floor((event.offsetY-hathi.offsetY-hathi.squareSize/2)/hathi.squareSize);
    if ( y<0 ) y = 0;
    
    hathi.hideCollision();
    
    if ( event.ctrlKey && (hathi.field[x][y] > 0)) {
        hathi.field[x][y]++;
        // hathi.put(hathi.field[x][y],x,y);
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
    var x = Math.floor(event.offsetX/hathi.squareSize);
    var y = Math.floor((event.offsetY-hathi.offsetY-hathi.squareSize/2)/hathi.squareSize);
    if ( y<0) y = 0;
    hathi.hideCollision();
    
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
                        el = document.createElement("peanut");
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
    
    this.reset();
    
    for ( var idx = 0; idx < xml.children.length; idx++) {
        var child = xml.children[idx];
        if ( child ) {
            if ( child.nodeName == "hathi" ) {
                this.hathiX = Number(child.getAttribute("x"));
                this.hathiY = Number(child.getAttribute("y"));
                this.hathiDir = Number(child.getAttribute("dir"));
            } else {
                var type;
                if ( child.nodeName == "rock" ) type = Hathi.ROCK;
                else if ( child.nodeName == "tree" ) type = Hathi.TREE;
                else if ( child.nodeName == "rock" ) type = Hathi.ROCK;
                else if ( child.nodeName == "oasis" ) type = Hathi.OASIS;
                else if ( child.nodeName == "peanut" ) type = child.getAttribute("count");
                var x = Number(child.getAttribute("x"));
                var y = Number(child.getAttribute("y"));
                this.field[x][y] = Number(type);
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
      'isOnPeanut','pickUpPEanut','dropPEanut','isForwardEmpty',
      'isForward'
    ];
    for ( var i = 0; i < funcs.length; i++ ) {
        interpreter.setProperty(scope,funcs[i],
            interpreter.createNativeFunction( World.createWrapper(funcs[i]) )
        );        
    }
};


World.setEditable = function(editable) {
    this.editable = editable;
}