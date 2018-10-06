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
var World = new AbbozzaWorld("kara");


World.init = function() {
    this.kara = new Kara(document.getElementById('.topleft'));
    
    document.getElementById("speed").value = AbbozzaInterpreter.getSpeed();
    var info = document.getElementById("info");
    info.contentDocument.getElementById("width").value = World.kara.width;
    info.contentDocument.getElementById("height").value = World.kara.height;
    info.contentDocument.getElementById("size").value = World.kara.squareSize;
    
    info.contentDocument.getElementById("width").oninput = function(event) {
        World.kara.setWidth(info.contentDocument.getElementById("width").value);
    }
    
    info.contentDocument.getElementById("height").oninput = function(event) {
        World.kara.setHeight(info.contentDocument.getElementById("height").value);
    }
    
    info.contentDocument.getElementById("size").oninput = function(event) {
        World.kara.setSize(info.contentDocument.getElementById("size").value);
    }
};

World.toDom = function() {
    return this.kara.toDom();
};

World.fromDom = function(xml) {
    this.kara.fromDom(xml);
};
    
World.reset = function () {
    this.widzh = 20;
    this.height = 20;
    this.kara.reset();
};

World.onStart = function() {
    this.kara.onStart();
}


var svgNS = "http://www.w3.org/2000/svg";

/**
 * The turtle as view for the context.
 */

function Kara(view) {

    this.parent_ = document.createElement("div");
    this.parent_.className = "karaParent";
    view.appendChild(this.parent_);

    this.view_ = document.createElement("canvas");
    this.view_.kara = this;
    this.view_.className = "karaView";
    this.parent_.appendChild(this.view_);

    this.view_.onclick = this.clicked;
    this.view_.oncontextmenu = this.rightclicked;
    
    this.context_ = this.view_.getContext("2d");

    this.pic_kara_up_ = document.createElement("img");
    this.pic_kara_up_.style.display = "none";
    this.pic_kara_up_.src = "kara.png";

    this.pic_kara_right_ = document.createElement("img");
    this.pic_kara_right_.style.display = "none";
    this.pic_kara_right_.src = "kara_right.png";

    this.pic_kara_left_ = document.createElement("img");
    this.pic_kara_left_.style.display = "none";
    this.pic_kara_left_.src = "kara_left.png";

    this.pic_kara_down_ = document.createElement("img");
    this.pic_kara_down_.style.display = "none";
    this.pic_kara_down_.src = "kara_down.png";

    this.pic_collision_ = document.createElement("img");
    this.pic_collision_.style.display = "none";
    this.pic_collision_.src = "collision.png";

    this.pic_rock_ = document.createElement("img");
    this.pic_rock_.style.display = "none";
    this.pic_rock_.src = "rock.png";

    this.pic_shamrock_ = document.createElement("img");
    this.pic_shamrock_.style.display = "none";
    this.pic_shamrock_.src = "shamrock.png";

    this.pic_mushroom_ = document.createElement("img");
    this.pic_mushroom_.style.display = "none";
    this.pic_mushroom_.src = "mushroom.png";

    this.pic_tree_ = document.createElement("img");
    this.pic_tree_.style.display = "none";
    this.pic_tree_.onload = function (event) {
        World.kara.redraw();
    };
    this.pic_tree_.src = "tree.png";

    this.width = 20;
    this.height = 20;
    this.squareSize = 40;


    this.karaX = 0;
    this.karaY = 0;
    this.karaDir = 0;
    this.karaDX = 1;
    this.karaDY = 0;
    this.moved = false;
    this.collX = 0;
    this.collY = 0;
    this.collX2 = 0;
    this.collY2 = 0;

    this.reset();
    
    this.put(Kara.ROCK,2,0);
};

Kara.EMPTY = 0;
Kara.ROCK = -1;
Kara.MUSHROOM = -2;
Kara.TREE = -3;
Kara.SHAMROCK = 1;


Kara.prototype.reset = function () {
    this.karaX = 0;
    this.karaY = 0;
    this.karaDir = 0;
    this.karaDX = 1;
    this.karaDY = 0;
    // this.squareSize = 40;    

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

    this.view_.width = this.width * this.squareSize;
    this.view_.height = this.height * this.squareSize;

    this.view_.onclick = this.clicked;
    this.view_.oncontextmenu = this.rightclicked;

    // draw fields
    this.context_.strokeStyle = "#0fff0f";
    this.context_.lineWidth = 0;
    this.context_.fillStyle = "#d0ffd0";
    this.context_.fillRect(0, 0, this.view_.width, this.view_.height);
    for (var i = 0; i <= this.width; i++) {
        this.context_.moveTo(this.squareSize * i, 0);
        this.context_.lineTo(this.squareSize * i, this.view_.height);
        this.context_.stroke();
    }
    for (var i = 0; i <= this.height; i++) {
        this.context_.moveTo(0, this.squareSize * i);
        this.context_.lineTo(this.view_.width, this.squareSize * i);
        this.context_.stroke();
    }
};

Kara.prototype.onStart = function() {
    this.hideCollision();
}


Kara.prototype.setWidth = function(w) {
    this.width = Number(w);
    this.reset();
    this.redraw();
}

Kara.prototype.setHeight = function(w) {
    this.height = Number(w);
    this.reset();
    this.redraw();
}

Kara.prototype.setSize = function(w) {
    this.squareSize = Number(w);
    this.reset();
    this.redraw();
}

Kara.prototype.redraw = function () {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.drawSquare(x, y);
        }
    }
};

Kara.prototype.drawSquare = function (x, y) {
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
            case Kara.EMPTY:
                break;
            case Kara.ROCK:
                this.context_.drawImage(this.pic_rock_, xpos, ypos, siz, siz);
                break;
            case Kara.TREE:
                this.context_.drawImage(this.pic_tree_, xpos, ypos, siz, siz);
                break;
            case Kara.MUSHROOM:
                this.context_.drawImage(this.pic_mushroom_, xpos, ypos, siz, siz);
                break;
        }
    } else {
        this.context_.drawImage(this.pic_shamrock_, xpos, ypos, siz, siz);
        if (this.field[x][y] > 1) {
            this.context_.strokeStyle = "black";
            this.context_.fillStyle = "white";
            this.context_.font = "bold " + this.squareSize / 2 + "px arial";
            var w = this.context_.measureText(this.field[x][y]).width;
            this.context_.fillText(this.field[x][y], xpos + siz / 2 - (w / 2), ypos + 4 * siz / 6);
        }
    }

    if ((this.karaX == x) && (this.karaY == y)) {
        var pic;
        switch (this.karaDir) {
            case 0 : // RIGHT
                pic = this.pic_kara_right_;
                break;
            case 1 : // UP
                pic = this.pic_kara_up_;
                break;
            case 2 : // LEFT
                pic = this.pic_kara_left_;
                break;
            case 3 : // DOWN
                pic = this.pic_kara_down_;
                break;
        }
        this.context_.drawImage(pic, xpos, ypos, siz, siz);
    }
};


Kara.prototype.showCollision = function() {
    // Upper left corner of collision
    var x = this.karaX * this.squareSize + this.karaDX * this.squareSize/2+1;
    var y = this.karaY * this.squareSize + this.karaDY * this.squareSize/2+1;
    this.collX = this.karaX;
    this.collY = this.karaY;
    this.collX2 = this.karaX + this.karaDX;
    this.collY2 = this.karaY + this.karaDY;    
    var siz = this.squareSize-2;
    
    this.context_.drawImage(this.pic_collision_, x, y, siz, siz);
}

Kara.prototype.hideCollision = function() {
    if ( this.collX ) {
        this.drawSquare(this.collX,this.collY);
        this.drawSquare(this.collX2,this.collY2);
    }
}


Kara.prototype.put = function (type, x, y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    this.field[x][y] = type;
    this.drawSquare(x, y);
};

Kara.prototype.turnRight = function () {
    this.karaDir = (this.karaDir + 3) % 4;
    var dum = this.karaDX;
    this.karaDX = -this.karaDY;
    this.karaDY = dum;
    this.drawSquare(this.karaX, this.karaY);
};

Kara.prototype.turnLeft = function () {
    this.karaDir = (this.karaDir + 1) % 4;
    var dum = this.karaDX;
    this.karaDX = this.karaDY;
    this.karaDY = -dum;
    this.drawSquare(this.karaX, this.karaY);
};


Kara.prototype.forward = function () {
    var oldX = this.karaX;
    var oldY = this.karaY;
    var newX = ( this.karaX + this.karaDX + this.width ) % this.width;
    var newY = ( this.karaY + this.karaDY + this.height ) % this.height;

    if ( this.field[newX][newY] < 0 ) {
        if ( this.field[newX][newY] == Kara.MUSHROOM ) {
            // Push the mushroom
            if ( this.isEmpty(newX+this.karaDX,newY+this.karaDY) ) {
                this.put(Kara.MUSHROOM,newX+this.karaDX,newY+this.karaDY);
                this.put(Kara.EMPTY,newX,newY);
                this.drawSquare(newX+this.karaDX,newY+this.karaDY);
                this.drawSquare(newX,newY);
                this.karaX = newX;
                this.karaY = newY;
                this.moved = true;
            } else {
                // Collision without abort!
                this.collision();
                this.moved = false;
                return 0;
            }
        } else if ( this.field[newX][newY] == Kara.TREE ) {
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
        this.karaX = newX;
        this.karaY = newY;
        this.moved = true;
    }
    this.drawSquare(oldX, oldY);
    this.drawSquare(this.karaX, this.karaY);
    
    return 0;
};


Kara.prototype.steppedForward = function() {
   return this.moved;
}


Kara.prototype.isEmpty = function(x,y) {
    x = ( x + this.width ) % this.width;
    y = ( y + this.height ) % this.height;
    return ( this.field[x][y] == 0 );
};

Kara.prototype.collision = function () {
};

Kara.prototype.isOnShamrock = function() {
    return ( this.field[this.karaX][this.karaY] > 0 );
};

Kara.prototype.pickUpShamrock = function() {
    if ( this.field[this.karaX][this.karaY] <= 0 ) {
        this.collision();
        return;
    }
    this.field[this.karaX][this.karaY]--;
    this.drawSquare(this.karaX,this.karaY);
};


Kara.prototype.dropShamrock = function() {
    if ( this.field[this.karaX][this.karaY] < 0 ) {
        this.collision();
        return;
    }
    this.field[this.karaX][this.karaY]++;
    this.drawSquare(this.karaX,this.karaY);
};



Kara.prototype.isForwardEmpty = function() {
    return this.isEmpty(this.karaX+this.karaDX,this.karaY+this.karaDY);
};

Kara.prototype.isForward = function(type) {
    var x = (this.karaX+this.karaDX+this.width) % this.width;
    var y = (this.karaY+this.karaDY+this.height) % this.height;
    return ( this.field[x][y] == type );
};

Kara.prototype.clicked = function(event) {
    var kara = World.kara;
    var x = Math.floor(event.offsetX/kara.squareSize);
    var y = Math.floor(event.offsetY/kara.squareSize);
    kara.hideCollision();
    
    if ( event.ctrlKey && (kara.field[x][y] > 0)) {
        kara.field[x][y]++;
    } else {
        if (( x == kara.karaX ) && ( y == kara.karaY )) {
            kara.turnRight();
        } else {
            kara.field[x][y]--;
            if ( kara.field[x][y] < -3 ) kara.field[x][y] = 1;
        }
    }
    kara.drawSquare(x,y);
};


Kara.prototype.rightclicked = function(event) { 
    var kara = World.kara;
    var x = Math.floor(event.offsetX/kara.squareSize);
    var y = Math.floor(event.offsetY/kara.squareSize);
    kara.hideCollision();
    
    if (( x != kara.karaX ) || ( y != kara.karaY )) {
        var oldX = kara.karaX;
        var oldY = kara.karaY;
        kara.karaX = x;
        kara.karaY = y;
        kara.put(Kara.EMPTY,x,y);
        kara.drawSquare(oldX,oldY);
        kara.drawSquare(x,y);
    } else {
        kara.turnRight();
        kara.drawSquare(x,y);
    }
    
};


Kara.prototype.toDom = function() {
    var root = document.createElement("world");
    root.setAttribute("width",this.width);
    root.setAttribute("height",this.height);
    
    var kara = document.createElement("kara");
    kara.setAttribute("x", this.karaX);
    kara.setAttribute("y", this.karaY);
    kara.setAttribute("dir", this.karaDir);
    root.appendChild(kara);
    
    var el;
    
    for ( var row = 0; row < this.height; row++ ) {
        for ( var col = 0 ; col < this.width ; col++ ) {
            if ( this.field[col][row] != 0 ) {
                switch ( this.field[col][row] ) {
                    case Kara.ROCK:
                        el = document.createElement("rock");
                        break;
                    case Kara.TREE:
                        el = document.createElement("tree");
                        break;
                    case Kara.MUSHROOM:
                        el = document.createElement("mushroom");
                        break;
                    default:
                        el = document.createElement("shamrock");
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


Kara.prototype.fromDom = function(xml) {
    this.width = Number(xml.getAttribute("width"));
    this.height = Number(xml.getAttribute("height"));
    
    this.reset();
    
    for ( var idx = 0; idx < xml.children.length; idx++) {
        var child = xml.children[idx];
        if ( child ) {
            if ( child.nodeName == "kara" ) {
                this.karaX = Number(child.getAttribute("x"));
                this.karaY = Number(child.getAttribute("y"));
                this.karaDir = Number(child.getAttribute("dir"));
            } else {
                var type;
                if ( child.nodeName == "rock" ) type = Kara.ROCK;
                else if ( child.nodeName == "tree" ) type = Kara.TREE;
                else if ( child.nodeName == "mushroom" ) type = Kara.MUSHROOM;
                else if ( child.nodeName == "shamrock" ) type = child.getAttribute("count");
                var x = Number(child.getAttribute("x"));
                var y = Number(child.getAttribute("y"));
                this.field[x][y] = Number(type);
            }
        }
    }
    this.redraw();
};