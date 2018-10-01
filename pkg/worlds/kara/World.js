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
var World = {
    kara: null,
    
    init: function () {
        this.kara = new Kara(document.getElementById('.topleft'));
        // ColorMgr.catColor['cat.TURTLE'] = "#00FF00";
    },

    getId: function () {
        return "kara";
    }
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
    this.pic_kara_up_.src = "/abbozza/world/kara.png";

    this.pic_kara_right_ = document.createElement("img");
    this.pic_kara_right_.style.display = "none";
    this.pic_kara_right_.src = "/abbozza/world/kara_right.png";

    this.pic_kara_left_ = document.createElement("img");
    this.pic_kara_left_.style.display = "none";
    this.pic_kara_left_.src = "/abbozza/world/kara_left.png";

    this.pic_kara_down_ = document.createElement("img");
    this.pic_kara_down_.style.display = "none";
    this.pic_kara_down_.src = "/abbozza/world/kara_down.png";

    this.pic_rock_ = document.createElement("img");
    this.pic_rock_.style.display = "none";
    this.pic_rock_.src = "/abbozza/world/rock.png";

    this.pic_shamrock_ = document.createElement("img");
    this.pic_shamrock_.style.display = "none";
    this.pic_shamrock_.src = "/abbozza/world/shamrock.png";

    this.pic_mushroom_ = document.createElement("img");
    this.pic_mushroom_.style.display = "none";
    this.pic_mushroom_.src = "/abbozza/world/mushroom.png";

    this.pic_tree_ = document.createElement("img");
    this.pic_tree_.style.display = "none";
    this.pic_tree_.onload = function (event) {
        World.kara.redraw();
    };
    this.pic_tree_.src = "/abbozza/world/tree.png";

    this.width = 20;
    this.height = 20;
    this.squareSize = 40;


    this.karaX = 0;
    this.karaY = 0;
    this.karaDir = 0;
    this.karaDX = 1;
    this.karaDY = 0;

    this.reset();
    
    this.put(Kara.MUSHROOM,2,0);
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

    this.field = [];
    for (var x = 0; x < this.width; x++) {
        var line = []
        for (var y = 0; y < this.height; y++) {
            line.push(0);
        }
        this.field.push(line);
    }

    this.view_.width = this.width * this.squareSize;
    this.view_.height = this.height * this.squareSize;

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
    this.context_.fillStyle = "#d0ffd0";
    // this.context_.fillStyle = "#d0d0d0";
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
            } else {
                // Collision!!
                this.collision();
                return;
            }
        } else {
            // Collision!!
            this.collision();
            return;
        }
    } else {
        this.karaX = newX;
        this.karaY = newY;
    }
    this.drawSquare(oldX, oldY);
    this.drawSquare(this.karaX, this.karaY);
};


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
}


Kara.prototype.rightclicked = function(event) {
    var kara = World.kara;
    var x = Math.floor(event.offsetX/kara.squareSize);
    var y = Math.floor(event.offsetY/kara.squareSize);
    
    if (( x != kara.karaX ) || ( y != kara.karaY )) {
        var oldX = kara.karaX;
        var oldY = kara.karaY;
        kara.karaX = x;
        kara.karaY = y;
        kara.put(Kara.EMPTY,x,y);
        kara.drawSquare(oldX,oldY);
        kara.drawSquare(x,y);
    }
    
}
