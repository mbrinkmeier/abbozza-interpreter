/* 
 * Copyright 2018 mbrin.
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

/*
 * The static desktop object.
 */
var Desktop = {};

/**
 * This function attaches the desktop to the body element.
 * 
 * @returns {undefined}
 */
Desktop.init = function (rootPath) {
    this.rootPath = rootPath;
    this.dragging = false;
    this.draggedFrame = null;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.body = document.getElementsByTagName("BODY")[0];

    this.header = document.createElement("DIV");
    this.header.className = "abzHeader";
    this.body.appendChild(this.header);

    this.footer = document.createElement("DIV");
    this.footer.className = "abzFooter";
    this.body.appendChild(this.footer);
    
    this.sceneButton = document.createElement("DIV");
    this.sceneButton.className = "sceneButton";
    this.footer.appendChild(this.sceneButton);
    this.sceneButton.title = "Scenes";
    this.sceneButton.style.backgroundImage = "url('" + this.rootPath + "img/scenes.png')";

    this.iconList = document.createElement("DIV");
    this.iconList.className = "iconList";
    this.footer.appendChild(this.iconList);

    /*
     this.frameList = document.createElement("SELECT");
     this.frameList.className = "frameList";
     this.footer.appendChild(this.frameList);
     this.frameList.onchange = this.openFrame;
     var frameOption = document.createElement("OPTION");
     frameOption.frame = null;
     frameOption.textContent = "-- Fensterliste --";    
     this.frameList.appendChild(frameOption);
     */

    this.desktop = document.createElement("DIV");
    this.desktop.className = "abzDesktop";
    this.body.appendChild(this.desktop);

    this.sceneList = document.createElement("DIV");
    this.sceneList.className = "abzSceneList";
    this.desktop.appendChild(this.sceneList);
    this.sceneList.onchange = Desktop.setScene;
    this.addScene("Hide all",  null, Desktop.hideAllFrames );
    this.addScene("Cascade", this.rootPath + "img/cascade.png", Desktop.cascadeFrames );
    // this.sceneButton.onmouseenter = function(event) {
    //     Desktop.sceneList.style.visibility = "visible";
    //     Desktop.desktop.appendChild(Desktop.sceneList);
    // };
    this.sceneButton.onclick = function(event) {
        if ( Desktop.sceneList.style.visibility == "hidden" ) {
            Desktop.sceneList.style.visibility = "visible";            
        } else {
            Desktop.sceneList.style.visibility = "hidden";
        }
    };

    this.desktop.ondrop = Desktop.onDrop;
    this.desktop.ondragover = Desktop.allowDrop;
}


Desktop.addFrame = function (frame) {
    this.iconList.appendChild(frame.icon);
    this.desktop.appendChild(frame.div);
    frame.desktop = this;
    frame.show();
    frame.bringToFront();
    /*
     var frameOption = document.createElement("OPTION");
     frameOption.frame=frame;
     frameOption.textContent = frame.title;
     this.frameList.appendChild(frameOption);
     */
}


Desktop.onDrop = function (event) {
}

Desktop.allowDrop = function (event) {
    event.preventDefault();
}

Desktop.setSize = function (w, h) {
    if (typeof w == "number") {
        this.desktop.width = w + "px";
    } else {
        this.desktop.width = w;
    }

    if (typeof h == "number") {
        this.desktop.height = h + "px";
    } else {
        this.desktop.height = h;
    }
}

Desktop.openFrame = function (event) {
    frame = Desktop.frameList[Desktop.frameList.selectedIndex].frame;
    if (frame != null) {
        frame.show();
        frame.bringToFront();
        Desktop.frameList.selectedIndex = 0;
    }
};

Desktop.drag = function (event) {
    event.preventDefault();

    if (Desktop.draggedFrame != null) {
        var frame = Desktop.draggedFrame;
        frame.currentX = event.clientX - Desktop.dragStartX;
        frame.currentY = event.clientY - Desktop.dragStartY;

        frame.xOffset = frame.currentX;
        frame.yOffset = frame.currentY;

        var ending = false;
        if (frame.currentX < 0) {
            frame.currentX = 0;
            // ending = true;
        }
        if (frame.currentY < 0) {
            frame.currentY = 0;
            // ending = true;
        }
        if ( frame.currentX > Desktop.desktop.offsetWidth - 20 ) {
            frame.currentX = Desktop.desktop.offsetWidth - 20;
        }
        if ( frame.currentY > Desktop.desktop.offsetHeight - 20 ) {
            frame.currentY = Desktop.desktop.offsetHeight - 20;
        }
        frame.setPosition(frame.currentX, frame.currentY);
        
        if  ( ending ) {
            Desktop.dragEnd(frame);
        }
    }
};


Desktop.dragEnd = function (event) {
    Desktop.dragging = false;
    Desktop.draggedFrame = null;
    document.removeEventListener("mousemove", Desktop.drag, false);
    document.removeEventListener("mouseup", Desktop.dragEnd, false);
};


Desktop.dragFrame = function (frame) {
    if (Desktop.dragging == false) {
        Desktop.dragging = true;
        Desktop.draggedFrame = frame;
        Desktop.desktop.appendChild(frame.div);
        Desktop.dragStartX = event.clientX - frame.div.offsetLeft;
        Desktop.dragStartY = event.clientY - frame.div.offsetTop;
        frame.xOffset = 0;
        frame.yOffset = 0;
        document.addEventListener("mousemove", Desktop.drag, false);
        document.addEventListener("mouseup", Desktop.dragEnd, false);
    }
};


Desktop.resizing = function (event) {
    event.preventDefault();

    if (Desktop.resizedFrame != null) {
        var frame = Desktop.resizedFrame;
        frame.currentX = event.clientX - Desktop.dragStartX;
        frame.currentY = event.clientY - Desktop.dragStartY;
        
        var w = frame.startWidth + frame.currentX;
        var h = frame.startHeight + frame.currentY;
       
        frame.setSize(w,h);
    }
};


Desktop.resizeEnd = function (event) {
    Desktop.dragging = false;
    Desktop.resizedFrame = null;
    document.removeEventListener("mousemove", Desktop.resizing, false);
    document.removeEventListener("mouseup", Desktop.resizeEnd, false);
};


Desktop.resizeFrame = function(frame) {
    if (Desktop.dragging == false) {
        Desktop.dragging = true;
        Desktop.resizedFrame = frame;
        Desktop.desktop.appendChild(frame.div);
        Desktop.dragStartX = event.clientX;
        Desktop.dragStartY = event.clientY;
        frame.startWidth = frame.div.offsetWidth;
        frame.startHeight = frame.div.offsetHeight;
        document.addEventListener("mousemove", Desktop.resizing, false);
        document.addEventListener("mouseup", Desktop.resizeEnd, false);
    }    
}


Desktop.setScene = function (event) {
    var scene = Desktop.sceneList[Desktop.sceneList.selectedIndex].sceneFunc;
    if (scene != null) {
        Desktop.sceneList.selectedIndex = 0;
        scene.call(Desktop);
    }
};


Desktop.addScene = function(text,icon,sceneFunc) {
    var sceneOption = document.createElement("SPAN");
    sceneOption.scene = null;
    if ( icon ) {
        sceneOption.style.backgroundImage = "url(" + icon + ")";
    } else {
        sceneOption.textContent = text;
    }
    sceneOption.setAttribute("title",text);
    sceneOption.sceneFunc = sceneFunc;
    sceneOption.onclick = function(event) {
        Desktop.sceneList.style.visibility = "hidden";
        sceneFunc.call(Desktop); 
    };
    this.sceneList.appendChild(sceneOption);    
}


Desktop.hideAllFrames = function() {
    console.log(Desktop.desktop.children);
    for ( var i = 0; i < Desktop.desktop.children.length; i++ ) {
        var child = Desktop.desktop.children[i];
        if ( child.frame && child.frame.hide ) child.frame.hide();
    }
}

Desktop.cascadeFrames = function() {
    console.log(Desktop.desktop.children);
    var ypos = 0;
    var xpos = 0;
    var height = Desktop.desktop.offsetHeight-2;
    var width = Desktop.desktop.offsetWidth-2   ;
    for ( var i = 0; i < Desktop.desktop.children.length; i++ ) {
        var child = Desktop.desktop.children[i];
        if ( child.frame ) { 
            var frame = child.frame;
            frame.show();
            frame.setSize(width,height);
            frame.setPosition(xpos,ypos);
            xpos = xpos + 32;
            ypos = ypos + 32;
            height = height - 32;
            width = width - 32;
        }
    }
}
