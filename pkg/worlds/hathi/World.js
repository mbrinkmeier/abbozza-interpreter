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

    
    this.hathi_svg = document.createElementNS(svgNS,"svg");
    this.hathi_svg.className = "hathiSvg";
    this.hathi_svg.onclick = this.clicked;
    this.hathi_svg.oncontextmenu = this.rightclicked;
    
    this.svg_layer_.appendChild(this.hathi_svg);
    
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

    
    this.pic_rock_ = document.createElement("img");
    this.pic_rock_.style.display = "none";
    this.pic_rock_.src = "img/rock.png";
    this.pic_rock_.onload = function (event) {
        World.hathi.redraw();
    };

    this.pic_peanut_ = document.createElement("img");
    this.pic_peanut_.style.display = "none";
    this.pic_peanut_.src = "img/peanut.png";
    this.pic_peanut_.onload = function (event) {
        World.hathi.redraw();
    };

    this.pic_hole_ = document.createElement("img");
    this.pic_hole_.style.display = "none";
    this.pic_hole_.src = "img/hole.png";
    this.pic_hole_.onload = function (event) {
        World.hathi.redraw();
    };

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

    this.width = 20;
    this.height = 20;
    this.squareSize = 40;

    this.reset();
    
    this.put(Hathi.ROCK,2,0);
    this.redraw();
};

Hathi.EMPTY = 0;
Hathi.ROCK = -1;
Hathi.HOLE = -2;
Hathi.TREE = -3;
Hathi.OASIS = -4;
Hathi.PEANUT = 1;


Hathi.prototype.reset = function () {
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
    var h = this.height * this.squareSize;

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
    this.reset();
    this.redraw();
}


Hathi.prototype.drawGrid = function() {
    // draw fields onto the canvas
    var hlen = this.height * this.squareSize;
    this.context_.strokeStyle = "#0fff0f";
    this.context_.lineWidth = 0;
    this.context_.fillStyle = "#d0ffd0";
    this.context_.fillRect(0, 0, this.view_.width, this.view_.height);
    for (var i = 0; i <= this.width; i++) {
        this.context_.moveTo(this.squareSize * i, 0);
        this.context_.lineTo(this.squareSize * i, hlen);
        this.context_.stroke();
    }
    for (var i = 0; i <= this.height; i++) {
        this.context_.moveTo(0, this.squareSize * i );
        this.context_.lineTo(this.view_.width, this.squareSize * i );
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

Hathi.prototype.drawSquare = function (x, y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    // Draw empty square as basis
    this.context_.fillStyle = "#0fff0f";
    this.context_.fillRect(x * this.squareSize, y * this.squareSize,
            this.squareSize, this.squareSize
            );
    this.context_.fillStyle = "#d0ffd0";
    this.context_.fillRect(
            x * this.squareSize + 1, y * this.squareSize + 1,
            this.squareSize - 2, this.squareSize - 2
            );

    var xpos = x * this.squareSize + 1;
    var ypos = y * this.squareSize + 1;
    var siz = this.squareSize - 2;

    if (this.field[x][y] <= 0) {
        switch (this.field[x][y]) {
            case Hathi.EMPTY:
                break;
            case Hathi.ROCK:
                // The rock is drawn to the canvas                
                this.context_.drawImage(this.pic_rock_, xpos, ypos, siz, siz);
                break;
            case Hathi.TREE:
                // The tree is drawn to the canvas
                this.context_.drawImage(this.pic_tree_, xpos, ypos, siz, siz);
                break;
            case Hathi.HOLE:
                // The hole is drawn to the canvas
                this.context_.drawImage(this.pic_hole_, xpos, ypos, siz, siz);
                break;
            case Hathi.OASIS:
                // The oasis is drawn to the canvas
                this.context_.drawImage(this.pic_oasis_, xpos, ypos, siz, siz);
                break;
        }
    } else {
        this.context_.drawImage(this.pic_peanut_, xpos, ypos, siz, siz);
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



Hathi.prototype.put = function (type, x, y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    this.field[x][y] = type;
    this.drawSquare(x, y);
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
                // this.put(Hathi.ROCK,newX+this.hathiDX,newY+this.hathiDY);
                this.put(Hathi.EMPTY,newX,newY);
                // this.drawSquare(newX+this.hathiDX,newY+this.hathiDY);
                // this.drawSquare(newX,newY);
                this.hathiX = newX;
                this.hathiY = newY;
                this.moved = true;
                this.moveHathi(oldX,oldY,newX,newY);
                this.moveRock(newX,newY,newX+this.hathiDX,newY+this.hathiDY);
            } else if ( this.field[newX+this.hathiDX][newY+this.hathiDY] == Hathi.HOLE ) {
                // Fill hole with rock
                // this.put(Hathi.EMPTY,newX+this.hathiDX,newY+this.hathiDY);
                this.put(Hathi.EMPTY,newX,newY);                
                // this.drawSquare(newX+this.hathiDX,newY+this.hathiDY);
                this.drawSquare(newX,newY);
                this.hathiX = newX;
                this.hathiY = newY;
                this.moved = true;
                this.moveRock(newX,newY,newX+this.hathiDX,newY+this.hathiDY,true);
                this.moveHathi(oldX,oldY,newX,newY);
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
    this.drawSquare(oldX, oldY);
    
    return 0;
};


Hathi.prototype.moveHathi = function(oldX,oldY,newX,newY) {
    var nx = newX * this.squareSize;
    var ny = newY * this.squareSize;
    var ox = oldX * this.squareSize;
    var oy = oldY * this.squareSize;
        var anim = this.hathi_svg_img.animate(
            [
                { transform: "translate(" + ox + "px," + oy + "px)" },
                { transform: "translate(" + nx + "px," + ny + "px)" }
            ],
            {
                duration: 250,
                additive: "replace",
                accumulate: "sum"
            });
        Abbozza.waitForAnimation(anim, function() { 
            World.hathi.drawSquare(World.hathi.hathiX,World.hathi.hathiY);
        });    
}

Hathi.prototype.moveRock = function(oldX,oldY,newX,newY,vanish = false) {
    var nx = newX * this.squareSize;
    var ny = newY * this.squareSize;
    var ox = oldX * this.squareSize;
    var oy = oldY * this.squareSize;
    this.rock_svg_img.setAttribute("transform-origin",(this.squareSize/2) + "px " + (this.squareSize/2) + "px");
    this.rock_svg_img.setAttribute("transform","translate(" + ox + "," + oy + ")");
    this.rock_svg_img.style.visibility = "visible";
    var keyframes;
    var duration;
    if ( vanish ) {
        keyframes = [
                { transform: "matrix(1.0,0,0,1.0," + ox + "," + oy + ")" },
                { transform: "matrix(1.0,0,0,1.0," + nx + "," + ny + ")" },
                // { transform: "matrix(0.1,0,0,0.1," + (nx+this.squareSize/2) + "," + (ny+this.squareSize/2) + ")" }
                { transform: "matrix(0.1,0,0,0.1," + nx + "," + ny + ")" }
            ];         
        duration = 500;
    } else {
        keyframes = [
                { transform: "translate(" + ox + "px," + oy + "px)" },
                { transform: "translate(" + nx + "px," + ny + "px)" }
            ]; 
        duration = 250;
    }
    var anim = this.rock_svg_img.animate(
            keyframes,
            {
                duration: duration,
                additive: "replace",
                accumulate: "sum"
            });
        Abbozza.waitForAnimation(anim, function() { 
            World.hathi.rock_svg_img.style.visibility = "hidden";
            if ( vanish ) {
                World.hathi.put(Hathi.EMPTY,newX,newY);                
            } else {
                World.hathi.put(Hathi.ROCK,newX,newY);
            }
            World.hathi.drawSquare(newX,newY);
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
    var y = Math.floor((event.offsetY-hathi.offsetY)/hathi.squareSize);
    hathi.hideCollision();
    
    if ( event.ctrlKey && (hathi.field[x][y] > 0)) {
        hathi.field[x][y]++;
    } else {
        if (( x == hathi.hathiX ) && ( y == hathi.hathiY )) {
            hathi.turnRight();
        } else {
            hathi.field[x][y]--;
            if ( hathi.field[x][y] < -4 ) hathi.field[x][y] = 1;
        }
    }
    hathi.drawSquare(x,y);
};


Hathi.prototype.rightclicked = function(event) { 
    if ( !World.editable ) return;
    
    var hathi = World.hathi;
    var x = Math.floor(event.offsetX/hathi.squareSize);
    var y = Math.floor((event.offsetY-hathi.offsetY)/hathi.squareSize);
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