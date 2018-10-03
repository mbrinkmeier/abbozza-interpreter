/* 
 * Copyright 2018 michael.
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



function Splitter(parent = null, prefix = "") {
    this.parent = parent || document.body;
    this.prefix = prefix || "";

    this.largeSize = 50;
    this.smallSize = 20;
    this.currentSize = this.smallSize;

    this.minTop = 0;
    this.minBottom = 0;
    this.minLeft = 0;
    this.minRight = 0;
    
    this.activated = false;
    this.top = false;
    this.left = false;
    
    this.color = "#b0b0ff";

    this.handle = document.createElement("div");
    this.handle.splitter = this;
    this.handle.style.width = this.smallSize + "px";
    this.handle.style.height = this.smallSize + "px";
    this.handle.innerHTML = this.smallIcon();
    this.handle.isLarge = false;

    this.handle.style.position = "absolute";
    var width = this.parent.offsetWidth;
    var height = this.parent.offsetHeight;
    this.handle.style.left = "" + ((width - this.largeSize / 2) / 2) + "px";
    this.handle.style.top = "" + ((height - this.largeSize / 2) / 2) + "px";
    this.handle.style.cursor = "move";
    this.parent.appendChild(this.handle);

    this.handle.setAttribute("draggable", "true");

    this.handle.onmouseenter = this.onmouseenter;
    this.handle.onmouseleave = this.onmouseleave;
    // this.handle.onmouseover = this.onmouseover;
    this.handle.ondragstart = this.ondragstart;
    this.handle.ondrag = this.ondrag;
    this.handle.ondragend = this.ondragend;
    this.handle.ondblclick = this.ondblclick;

    this.updateViews();
};


// The large splitter icon
Splitter.prototype.largeIcon = function () {
    return "<svg>" +
            "<circle cx='25' cy='25' r='17' fill='white' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<circle cx='25' cy='25' r='7' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<line x1='25' y1='15' x2='25' y2='35' stroke='white' stroke-width='1px'/>" +
            "<line x1='15' y1='25' x2='35' y2='25' stroke='white' stroke-width='1px'/>" +
            "</svg>";
};

Splitter.prototype.largeIconTopLeft = function () {
    return "<svg>" +
            "<circle cx='25' cy='25' r='17' fill='white' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<circle cx='25' cy='25' r='7' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<line x1='25' y1='15' x2='25' y2='35' stroke='white' stroke-width='1px'/>" +
            "<line x1='15' y1='25' x2='35' y2='25' stroke='white' stroke-width='1px'/>" +
            "<path d='M 25 25 L 8 25 A 17 17 0 0 1 25 8 Z' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "</svg>";
};

Splitter.prototype.largeIconTopRight = function () {
    return "<svg>" +
            "<circle cx='25' cy='25' r='17' fill='white' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<circle cx='25' cy='25' r='7' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<line x1='25' y1='15' x2='25' y2='35' stroke='white' stroke-width='1px'/>" +
            "<line x1='15' y1='25' x2='35' y2='25' stroke='white' stroke-width='1px'/>" +
            "<path d='M 25 25 L 25 8 A 17 17 0 0 1 42 25 Z' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "</svg>";
};

Splitter.prototype.largeIconBottomRight = function () {
    return "<svg>" +
            "<circle cx='25' cy='25' r='17' fill='white' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<circle cx='25' cy='25' r='7' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<line x1='25' y1='15' x2='25' y2='35' stroke='white' stroke-width='1px'/>" +
            "<line x1='15' y1='25' x2='35' y2='25' stroke='white' stroke-width='1px'/>" +
            "<path d='M 25 25 L 42 25 A 17 17 0 0 1 25 42 Z' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "</svg>";
};

Splitter.prototype.largeIconBottomLeft = function () {
    return "<svg>" +
            "<circle cx='25' cy='25' r='17' fill='white' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<circle cx='25' cy='25' r='7' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<line x1='25' y1='15' x2='25' y2='35' stroke='white' stroke-width='1px'/>" +
            "<line x1='15' y1='25' x2='35' y2='25' stroke='white' stroke-width='1px'/>" +
            "<path d='M 25 25 L 25 42 A 17 17 0 0 1 8 25 Z' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "</svg>";
};


// The small splitter icon
Splitter.prototype.smallIcon = function () {
    return "<svg>" +
            "<circle cx='10' cy='10' r='7' fill='" + this.color + "' stroke='" + this.color + "' stroke-width='2px'/>" +
            "<line x1='10' y1='0' x2='10' y2='20' stroke='white' stroke-width='1px'/>" +
            "<line x1='0' y1='10' x2='20' y2='10' stroke='white' stroke-width='1px'/>" +
            "</svg>";
};



Splitter.prototype.updateViews = function () {
    var posX = this.handle.offsetLeft;
    var posY = this.handle.offsetTop;

    // Resize top left
    var topleft = document.getElementById(this.prefix + ".topleft");
    if (topleft != null) {
        topleft.style.position = "absolute";
        topleft.style.top = "0px";
        topleft.style.left = "0px";
        topleft.style.width = (this.handle.offsetLeft + this.currentSize / 2) + "px";
        topleft.style.height = (this.handle.offsetTop + this.currentSize / 2) + "px";
        this.minTop = Math.max(this.minTop, topleft.style.minHeight.replace("px",""));
        this.minLeft = Math.max(this.minLeft, topleft.style.minWidth.replace("px",""));
        this.checkSize(topleft);
    }

    // Resize top right
    var topright = document.getElementById(this.prefix + ".topright");
    if (topright != null) {
        topright.style.position = "absolute";
        topright.style.top = "0px";
        topright.style.left = (this.handle.offsetLeft + this.currentSize / 2) + "px";
        topright.style.right = "0px";
        topright.style.height = (this.handle.offsetTop + this.currentSize / 2) + "px";
        this.minTop = Math.max (this.minTop, topright.style.minHeight.replace("px",""));
        this.minRight = Math.max (this.minRight, topright.style.minWidth.replace("px",""));
        this.checkSize(topright);
    }

    // Resize bottom left
    var bottomleft = document.getElementById(this.prefix + ".bottomleft");
    if (bottomleft != null) {
        bottomleft.style.position = "absolute";
        bottomleft.style.top = (this.handle.offsetTop + this.currentSize / 2) + "px";
        bottomleft.style.left = "0px";
        bottomleft.style.width = (this.handle.offsetLeft + this.currentSize / 2) + "px";
        bottomleft.style.bottom = "0px";
        this.minBottom = Math.max (this.minBottom, bottomleft.style.minHeight.replace("px",""));
        this.minLeft = Math.max (this.minLeft, bottomleft.style.minWidth.replace("px",""));
        this.checkSize(bottomleft);
    }

    // Resize bottom right
    var bottomright = document.getElementById(this.prefix + ".bottomright");
    if (bottomright != null) {
        bottomright.style.position = "absolute";
        bottomright.style.top = (this.handle.offsetTop + this.currentSize / 2) + "px";
        bottomright.style.left = (this.handle.offsetLeft + this.currentSize / 2) + "px";
        bottomright.style.right = "0px";
        bottomright.style.bottom = "0px";
        this.minBottom = Math.max (this.minBottom, bottomright.style.minHeight.replace("px",""));
        this.minRight = Math.max (this.minRight, bottomright.style.minWidth.replace("px",""));
        this.checkSize(bottomright);
    }

    // Resize left
    var left = document.getElementById(this.prefix + ".left");
    if (left != null) {
        left.style.position = "absolute";
        left.style.top = "0px";
        left.style.left = "0px";
        left.style.width = (this.handle.offsetLeft + this.currentSize / 2) + "px";
        left.style.bottom = "0px";
        this.minLeft = Math.max (this.minLeft, left.style.minWidth.replace("px",""));
        this.checkSize(left);
    }

    // Resize right
    var right = document.getElementById(this.prefix + ".right");
    if (right != null) {
        right.style.position = "absolute";
        right.style.top = "0px";
        right.style.left = (this.handle.offsetLeft + this.currentSize / 2) + "px";
        right.style.right = "0px";
        right.style.bottom = "0px";
        this.minRight = Math.max (this.minRight, right.style.minWidth.replace("px",""));
        this.checkSize(right);
    }

    // Resize top
    var top = document.getElementById(this.prefix + ".top");
    if (top != null) {
        top.style.position = "absolute";
        top.style.top = "0px";
        top.style.left = "0px";
        top.style.right = "0px";
        top.style.height = (this.handle.offsetTop + this.currentSize / 2) + "px";
        this.minTop = Math.max (this.minTop, top.style.minHeight.replace("px",""));
        this.checkSize(top);
    }

    // Resize bottom
    var bottom = document.getElementById(this.prefix + ".bottom");
    if (bottom != null) {
        bottom.style.position = "absolute";
        bottom.style.bottom = "0px";
        bottom.style.left = "0px";
        bottom.style.right = "0px";
        bottom.style.top = (this.handle.offsetTop + this.currentSize / 2) + "px";
        this.minBottom = Math.max (this.minBottom, bottom.style.minHeight.replace("px",""));
        this.checkSize(bottom);
    }
    
    this.parent.dispatchEvent(new CustomEvent("splitter_resize"));
}

Splitter.prototype.checkSize = function(element) {
    if ((element.offsetWidth < 100) || ( element.offsetHeight <100) ) {
            element.style.visibility = "hidden";
        } else {
            element.style.visibility = "visible";            
        }

}


// Grow splitter icon
Splitter.prototype.grow = function () {
    if (this.handle.isLarge == false) {
        this.handle.style.width = this.largeSize + "px";
        this.handle.style.height = this.largeSize + "px";
        this.handle.innerHTML = this.largeIcon();
        this.handle.style.top = (this.handle.offsetTop - (this.largeSize - this.smallSize) / 2) + "px";
        this.handle.style.left = (this.handle.offsetLeft - (this.largeSize - this.smallSize) / 2) + "px";
        this.handle.isLarge = true;
        this.currentSize = this.largeSize;
    }
}

// Shrink splitter icon
Splitter.prototype.shrink = function () {
    if (this.handle.isLarge == true) {
        this.handle.style.width = this.smallSize + "px";
        this.handle.style.height = this.smallSize + "px";
        this.handle.innerHTML = this.smallIcon();
        this.handle.style.top = (this.handle.offsetTop + (this.largeSize - this.smallSize) / 2) + "px";
        this.handle.style.left = (this.handle.offsetLeft + (this.largeSize - this.smallSize) / 2) + "px";
        this.handle.isLarge = false;
        this.currentSize = this.smallSize;
    }
}


Splitter.prototype.onmouseenter = function (event) {
    this.splitter.grow();
}

Splitter.prototype.onmouseleave = function (event) {
    this.splitter.shrink();
}

Splitter.prototype.ondblclick = function(event) {
    var mx = this.offsetLeft + this.splitter.currentSize/2 - event.clientX;
    var my = this.offsetTop + this.splitter.currentSize/2 - event.clientY;
    var top = ( my >= 0 );
    var left = ( mx >= 0);
    
    if ( this.splitter.activated && ( this.splitter.top == top ) && (this.splitter.left == left ) ) {
        this.splitter.activated = false;        
        this.innerHTML = this.splitter.largeIcon();
        if ( this.splitter.top ) {
            this.style.top = this.splitter.minTop + "px";
        } else {
            this.style.top = (this.splitter.parent.offsetHeight - this.splitter.minBottom ) + "px";
        }
        if ( this.splitter.left ) {
            this.style.left = this.splitter.minLeft + "px";
        } else {
            this.style.left = (this.splitter.parent.offsetWidth - this.splitter.minRight ) + "px";
        }
        this.splitter.updateViews();
        console.log(this);
    } else {
        this.splitter.left = left;
        this.splitter.top = top;
        this.splitter.activated = true;
        if ( this.splitter.top && this.splitter.left ) {
            this.innerHTML = this.splitter.largeIconTopLeft();
        } else if ( !this.splitter.top && this.splitter.left ) {
            this.innerHTML = this.splitter.largeIconBottomLeft();        
        } else if ( !this.splitter.top && !this.splitter.left ) {
            this.innerHTML = this.splitter.largeIconBottomRight();                
        } else {
            this.innerHTML = this.splitter.largeIconTopRight();                        
        }    
    }
}

Splitter.prototype.onmouseover = function(event) {
    if ( !this.splitter.handle.isLarge ) {
        this.splitter.grow();
    }    
    var mx = this.offsetLeft + this.splitter.currentSize/2 - event.clientX;
    var my = this.offsetTop + this.splitter.currentSize/2 - event.clientY;
    var top = ( my >= 0 );
    var left = ( mx >= 0);
    if ( (mx > this.splitter.currentSize/2) || (my> this.splitter.currentSize/2) 
           || (mx < -this.splitter.currentSize/2) || (my < -this.splitter.currentSize/2) ) {
        this.splitter.shrink();
        return;
    }
    if ( top && left ) {
        this.innerHTML = this.splitter.largeIconTopLeft();
    } else if ( !top && left ) {
        this.innerHTML = this.splitter.largeIconBottomLeft();        
    } else if ( !top && !left ) {
        this.innerHTML = this.splitter.largeIconBottomRight();                
    } else {
        this.innerHTML = this.splitter.largeIconTopRight();                        
    }    
}


Splitter.prototype.ondragstart = function (event) {
    event = event || window.event;
    oldX = event.clientX;
    oldY = event.clientY;
}

Splitter.prototype.ondrag = function (event) {
    event = event || window.event;
    newX = this.offsetLeft + event.offsetX;
    newY = this.offsetTop + event.offsetY;
    oldX = event.clientX;
    oldY = event.clientY;

    if (this.splitter.checkPosition(newX, newY)) {
        this.style.top = (newY) + "px";
        this.style.left = (newX) + "px";
        this.splitter.updateViews();
    }
}

Splitter.prototype.ondragend = function (event) {
    event = event || window.event;
    newX = this.offsetLeft + event.offsetX;
    newY = this.offsetTop + event.offsetY;

    if (this.splitter.checkPosition(newX, newY)) {
        this.style.top = (newY) + "px";
        this.style.left = (newX) + "px";
        this.splitter.updateViews();
    }
}
/**
 * 
 * @returns {boolean} True if position is valid, false otherwise
 */
Splitter.prototype.checkPosition = function (newX, newY) {
    var parent = this.parent;
    if ((newY < -this.currentSize / 2) || (newY < this.minTop)) {
        return false;
    }
    if ((newY > parent.offsetHeight - this.currentSize / 2) || ( newY > parent.offsetHeight - this.minBottom )) {
        return false;
    }
    if ((newX < -this.currentSize / 2) || (newX < this.minLeft)) {
        return false;
    }
    if ((newX > parent.offsetWidth - this.currentSize / 2)  || ( newX > parent.offsetWidth - this.minRight )) {
        return false;
    }
    return true;
}


Splitter.prototype.addEventListener = function(event,listener) {
    this.parent.addEventListener(event,listener);
}

Splitter.prototype.removeEventListener = function(event,listener) {
    this.parent.removeEventListener(event,listener);
}