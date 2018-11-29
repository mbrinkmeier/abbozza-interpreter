/**
 * @license
 * abbozza!
 *
 * Copyright 2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var World = new AbbozzaWorld("array");


World.initView = function(view) {
    this.sort = new ArrayWorld(view);
    var array = this.array;
    Abbozza.splitter.addEventListener("splitter_resize", this.resize);
    
    var info = document.getElementById("info");
    // info.contentDocument.getElementById("anispeed").value = (50-World.hanoi.duration/100);
    
    // info.contentDocument.getElementById("anispeed").oninput = function(event) {
    //     World.hanoi.duration = 100 * (50-Number(this.value));
    // }
};


World.resize = function(event) {
    this.sort.resize();
};



var svgNS = "http://www.w3.org/2000/svg";

/**
 * The class Sort
 */
function ArrayWorld(parent) {
    this.parent = parent;
    this.wrapper = document.createElement("div");
    this.wrapper.className = "arrayWrapper";
    
    this.parent.style.overflow = "auto";
    this.view = document.createElement("div");
    this.view.className = "arrayView";
    
    this.svg = document.createElementNS(svgNS,"svg");
    this.svg.className = "arraySvg";
    this.view.appendChild(this.svg);
    this.wrapper.appendChild(this.view);
    this.parent.appendChild(this.wrapper);
    
    this.topOffset = 50;
    this.duration = 500;    
    this.squareSize = 50;
    this.reset(30);
    
    this.redraw();
}



ArrayWorld.prototype.reset = function(elements) {
    elements = Number(elements);
    if ( elements <= 0 ) discs = 1;
    if ( elements > 100 ) discs = 100;
        
    this.numberOfElements = elements;
    this.values = [];
    this.elementSvg = [];
    this.valueSvg = [];
    this.squareSize = 50;

    this.resize();

    // Create elements
    for ( var i = 0; i < this.numberOfElements; i++ ) {
        var svg = document.createElementNS(svgNS,"rect");
        svg.setAttribute("height", this.squareSize + "px");
        svg.setAttribute("width", this.squareSize + "px");
        svg.setAttribute("stroke-width","1");
        svg.setAttribute("stroke","black");
        svg.setAttribute("fill","white");
        svg.setAttribute("x", (i+1)*this.squareSize + "px");
        svg.setAttribute("y",this.topOffset + "px");
        this.svg.appendChild(svg);
        this.elementSvg.push(svg);
        
        var min = 1;
        var max = 1000;
        
        this.values.push(Math.floor(min + Math.random() * (max-min)));
        var val = document.createElementNS(svgNS,"text");
        val.textContent = this.values[i];
        this.svg.appendChild(val);
        var bb = val.getBBox();
        val.setAttribute("text-anchor","middle");
        val.setAttribute("x",((i+1)*(this.squareSize) + (this.squareSize/2) )+ "px");
        val.setAttribute("y",(this.topOffset + (this.squareSize/2) + (bb.height/4)) + "px");
        this.valueSvg.push(val);
        
        var label = document.createElementNS(svgNS,"text");
        label.textContent = i;
        this.svg.appendChild(label);
        bb = label.getBBox();
        label.setAttribute("text-anchor","middle");
        label.setAttribute("x",((i+1)*(this.squareSize) + (this.squareSize/2) )+ "px");
        label.setAttribute("y",(this.topOffset - bb.height/2) + "px");
    }
    
    this.redraw();
};


ArrayWorld.prototype.resize = function() {    
    var width = this.view.offsetWidth;
    var height = this.view.offsetHeight;
    this.view.style.width = (this.squareSize*(this.numberOfElements+2)) + "px";
    this.svg.setAttribute("width",(this.squareSize*(this.numberOfElements+2)) + "px");
    this.svg.setAttribute("height",height);
    
    this.redraw();
};

/**
 * Draw the elements
 * 
 * @returns {undefined}
 */
ArrayWorld.prototype.redraw = function() {
}




World.wrapper = function(func,args) {
    return func.apply(World.hanoi,args);
}


World.createWrapper = function(func) {
    return function(arg) {
        var args= [];
        for ( var i = 0 ; i < arguments.length; i++ ) {
            args[i] = arguments[i];
        }
        return World.wrapper(World.hanoi[func],args);        
    }
}

World.initSourceInterpreter = function(interpreter,scope) {
    var funcs = [
      'moveDisc','getNumberOfDiscs','getSize','reset'
    ];
    for ( var i = 0; i < funcs.length; i++ ) {
        interpreter.setProperty(scope,funcs[i],
            interpreter.createNativeFunction( World.createWrapper(funcs[i]) )
        );        
    }
}

