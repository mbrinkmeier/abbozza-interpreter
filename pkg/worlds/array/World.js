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
    this.arrayWorld = new ArrayWorld(view);
    // Abbozza.splitter.addEventListener("splitter_resize", World.resize);
    
    // var anislider = document.getElementById("anislider");
    var anispeed = document.getElementById("anispeed");
    anispeed.value = (50-World.arrayWorld.duration/100);
    // Abbozza.worldControl.appendChild(anislider);
    
    // var zoomslider = document.getElementById("zoomslider");
    var zoom = document.getElementById("zoom");
    zoom.value = 100;
    // Abbozza.worldControl.appendChild(zoomslider);
     
    anispeed.oninput = function(event) {
         World.arrayWorld.duration = 100 * (50-Number(this.value));
    };
    
    zoom.oninput = function(event) {
         World.arrayWorld.setZoom(this.value);
    };
};

World.resetWorld = function () {
    this.arrayWorld.reset();
};



World.resize = function(event) {
    World.arrayWorld.resize();
};



var svgNS = "http://www.w3.org/2000/svg";

/**
 * The class ArrayWorld provides the view
 * 
 * @param {dvi} parent The parent div, containing the World 
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
    
    this.variableWrapper = document.createElement("div");
    this.variableWrapper.className = "variableWrapper";
    this.wrapper.appendChild(this.variableWrapper);

    this.topOffset = 50;
    this.duration = 500;    
    this.squareSize = 50;
    this.numberOfElements = 10;
    
    this.reset();
    
    this.redrawNeeded = false;
    this.redraw();
}


/**
 * Reset the array to the given length and fill it with random values.
 * 
 * @param {int} elements The number of elements in the array
 * @param {string} order The order of the random elementsS
 */
ArrayWorld.prototype.reset = function() {
    
    // Remove all elements and values
    while (this.svg.firstChild) {
        this.svg.removeChild(this.svg.firstChild);
    }
  
    this.values = [];
    this.elementSvg = [];
    this.valueSvg = [];

    // Remove variables
    while (this.variableWrapper.firstChild) {
        this.variableWrapper.removeChild(this.variableWrapper.firstChild);
    }
    this.vars = [];
    this.varSvg = [];

    if ( this.indices != null ) {
        for ( var i = 0 ; i < this.indices.length; i++ ) {
            var svg = this.indexSvg[i];
            try {
                this.svg.removeChild(svg);
            }
           catch (ex) {}
        }
    }
    this.indices = [];
    this.indexSvg = [];

    this.fill(this.numberOfElements,0,100,"RANDOM");
    this.resize();
};

/**
 * Change the size of the array and fill it.
 * 
 * @param {type} elements The number of elements
 * @param {type} order
 * @returns {undefined}
 */
ArrayWorld.prototype.fill = function(elements,min=1,max=100,order = "RANDOM") {
    
    elements = Number(elements);    
    this.numberOfElements = elements;

 
    // Create elements
    for ( var i = 0; i < this.numberOfElements; i++ ) {
        var svg = this.elementSvg[i]; 
        if ( svg == null ) {
            svg = document.createElementNS(svgNS,"rect");
            this.elementSvg[i] = svg;
            this.svg.appendChild(svg);
        }
        svg.setAttribute("height", this.squareSize + "px");
        svg.setAttribute("width", this.squareSize + "px");
        svg.setAttribute("stroke-width","1");
        svg.setAttribute("stroke","black");
        svg.setAttribute("fill","white");
        svg.setAttribute("x", (i+1)*this.squareSize + "px");
        svg.setAttribute("y",this.topOffset + "px");
    }
 
    // Remove additional elements
    //for ( var i = this.numberOfElements; i < this.elementSvg.length; i++ ) {
    //    this.svg.removeChild(this.elementSvg[i]);
    //    this.elementSvg[i] = null;
    //}
    
    this.values = [];
    for ( var i = 0; i < this.numberOfElements; i++ ) {
        var value = Math.floor(min + Math.random() * (max-min)); 
        this.values[i] = value; 
        if ( order == "DESC" ) {
            var l = this.values.length-1;
            while ( (l>0) && ( this.values[l-1] < value ) ) {
                this.values[l] = this.values[l-1];
                l = l-1;
            }
            this.values[l] = value;
        } else if ( order == "ASC" ) {
            var l = this.values.length-1;
            while ( (l>0) && ( this.values[l-1] > value ) ) {
                this.values[l] = this.values[l-1];
                l = l-1;
            }
            this.values[l] = value;
        }
    }
    
    for ( var i = 0; i < this.numberOfElements; i++ ) {
        var val = this.valueSvg[i];
        if ( val == null ) {
            val = document.createElementNS(svgNS,"text");
            this.valueSvg[i] = val;
        }
        val.textContent = this.values[i];
        this.svg.appendChild(val);
        var bb = val.getBBox();
        val.setAttribute("text-anchor","middle");
        val.setAttribute("x","0px");
        val.setAttribute("y",(this.topOffset + (this.squareSize/2) + (bb.height/4)) + "px");
        var shift = ((i+1)*(this.squareSize) + (this.squareSize/2) );
        val.setAttribute("transform","translate(" + shift + ",0)");
    }

    // Remove additional values and valueSvgs
    for ( var i = this.numberOfElements; i < this.valueSvg.length; i++ ) {
        this.svg.removeChild(this.valueSvg[i]);
        this.valueSvg[i] = null;
    }

    this.resize();
};

/**
 * Resize the view, wrapper and svg, if the parent container is resized.
 * 
 */
ArrayWorld.prototype.resize = function() {    
    var width = this.parent.offsetWidth;
    var height = this.parent.offsetHeight;
    if ( width > this.squareSize*(this.numberOfElements+2) ) {
        this.wrapper.style.width = (width + "px");
        // this.view.style.width = (width + "px");
        // this.svg.style.width = (width + "px");
    } else {
        this.wrapper.style.width = (this.squareSize*(this.numberOfElements+4)) + "px";
    }
    this.view.style.width = (this.squareSize*(this.numberOfElements+4)) + "px";        
    this.svg.setAttribute("width",(this.squareSize*(this.numberOfElements+4)) + "px");
    this.svg.setAttribute("height",(this.squareSize*4) + "px");
       
    this.redraw();
};

/**
 * Repositions the index elements and updates variables.
 */
ArrayWorld.prototype.redraw = function() {
    var ypos = (this.squareSize*3);

    for ( var i = 0 ; i < this.indices.length; i++ ) {
        var name = this.indices[i];
        var val = AbbozzaInterpreter.getSymbol(name);
        if ( val == undefined ) val = -1;
        var svg = this.indexSvg[i];
        var xpos = ((val+1)*(this.squareSize) + (this.squareSize/2));
        svg.setAttribute("transform",
            "translate(" + xpos + "," + ypos + ")"
        );
    }

    for ( i = 0 ; i < this.vars.length; i++ ) {
        var name = this.vars[i];
        var val = AbbozzaInterpreter.getSymbol(name);
        var svg = this.varSvg[i];
        svg.textContent = name + " = " + val;
    }

};

/**
 * Set the zoom factor of the svg.
 * The zoom factor can be a value between 10 (0.1) and 200 (2.0).
 * 
 * @param {type} factor the zoom factor.
 * @returns {undefined}
 */
ArrayWorld.prototype.setZoom = function(factor) {
    var zoomFactor = (1.0 * factor/100.0);
    var dx = -(1-zoomFactor) * (this.view.offsetWidth/2);
    var dy = -(1-zoomFactor) * (this.view.offsetHeight/2);
    this.svg.setAttribute("transform","matrix(" +  zoomFactor + ",0,0," + zoomFactor +"," + dx + "," + dy +")");
}

/**
 * Redarw indices and variabels after wach step.
 * 
 * @returns {undefined}
 */
World.stepWorld = function() {
    World.arrayWorld.redraw();
}

/**
 * Returns the length of the array.
 * 
 * @returns {int}
 */
ArrayWorld.prototype.getLength = function() {
    return this.numberOfElements;
    this.redrawNeeded = false;
}

/**
 * Get the value at the given index.
 * 
 * @param {type} index The index
 * @returns {Array}
 */
ArrayWorld.prototype.get = function(index) {
    if (( index >= 0 ) && (index < this.values.length )) { 
        return this.values[index];
        this.redrawNeeded = false;
    }
    Abbozza.throwException(1,_("err.illegal_index"));
}

/**
 * Sets the value at the given index.
 * 
 * @param {type} index The index of the position to be set.
 * @param {type} value The new value.
 * @returns {undefined}
 */
ArrayWorld.prototype.set = function(index, value) {
    if (( index >= 0 ) && (index < this.values.length )) { 
        this.values[index] = value;
        this.valueSvg[index].textContent = value;
        this.redrawNeeded = false;
    } else {
        Abbozza.throwException(1,_("err.illegal_index"));
    }
}

/**
 * Swaps two positions in the array and animates it.
 * 
 * @param {type} index
 * @param {type} index2
 * @returns {undefined}
 */
ArrayWorld.prototype.swap = function(index, index2) {
    if ( ( index >= 0 ) && (index < this.values.length ) &&
          ( index2 >= 0 ) && (index2 < this.values.length )  ) {
        var xs = ((index+1)*(this.squareSize) + (this.squareSize/2));
        var xe = ((index2+1)*(this.squareSize) + (this.squareSize/2));
        var fromSvg = this.valueSvg[index];
        var fromAnim = fromSvg.animate(
        [
            { transform: "translate(" + xs + "px,0px)" },
            { transform: "translate(" + xs + "px,-" + this.squareSize + "px" },
            { transform: "translate(" + xe + "px,-" + this.squareSize + "px" },
            { transform: "translate(" + xe + "px,0px)" }
        ], {
            duration: Number(this.duration),
            fill: "both",
            accumulate : "sum",
            additive: "sum"
        }
        );
        if ( index != index2) {
            var toSvg = this.valueSvg[index2];
            var toAnim = toSvg.animate(
            [
                { transform: "translate(" + xe + "px,0px)" },
                { transform: "translate(" + xe + "px," + this.squareSize + "px" },
                { transform: "translate(" + xs + "px," + this.squareSize + "px" },
                { transform: "translate(" + xs + "px,0px)" }
            ], {
                duration: Number(this.duration),
                fill: "both",
                accumulate : "sum",
                additive: "sum"
            }
            );
        }
        var arr = this;
        if ( index != index2 ) { Abbozza.waitForAnimation(toAnim, null); }
        Abbozza.waitForAnimation(fromAnim,
            function(event) {
                var dummy = arr.values[index];
                arr.values[index] = arr.values[index2];
                arr.valueSvg[index] = toSvg;
                arr.values[index2] = dummy;
                arr.valueSvg[index2] = fromSvg;
                fromSvg.setAttribute("transform","translate(" + xe + ",0)");
                toSvg.setAttribute("transform","translate(" + xs + ",0)");
                arr.redrawNeeded = false;
           }
        );
    } else {
        Abbozza.throwException(1,_("err.illegal_index",null));
    }
}


ArrayWorld.prototype.showAsIndex = function(varname,color) {
    this.indices.push(varname);
    var svg = document.createElementNS(svgNS,"g");
    this.svg.appendChild(svg);
    this.indexSvg.push(svg);
    var svgText = document.createElementNS(svgNS,"text");
    svgText.textContent = varname;
    svgText.setAttribute("text-anchor","middle");
    svg.appendChild(svgText);
    var bb = svgText.getBBox();
    var svgRect = document.createElementNS(svgNS,"rect");
    svgRect.setAttribute("fill","white");
    svgRect.setAttribute("stroke",color);
    svgRect.setAttribute("stroke-width","3px");
    svgRect.setAttribute("width",bb.width+20);
    svgRect.setAttribute("height",bb.height+10);
    svgRect.setAttribute("x",-bb.width/2-10);
    svgRect.setAttribute("y",-bb.height/2-10);
    svgRect.setAttribute("rx",3);
    svgRect.setAttribute("ry",3);
    var svgPath = document.createElementNS(svgNS,"path");
    svgPath.setAttribute("d",
        "M0,-50 L-3,-20 L3,-20 Z"
    );
    svgPath.setAttribute("fill",color);
    svgPath.setAttribute("stroke",color);
    svg.insertBefore(svgPath,svgText);
    svg.insertBefore(svgRect,svgText);
    var val = AbbozzaInterpreter.getSymbol(varname);
    if ( val == undefined ) val = 0;
    var ypos = (this.squareSize*3);
    var xpos = ((val+1)*(this.squareSize) + (this.squareSize/2));
    svg.setAttribute("transform",
        "translate(" + xpos + "," + ypos + ")"
    );
}

ArrayWorld.prototype.showAsVariable = function(varname,color = "#000000") {
    this.vars.push(varname);
    var svg = document.createElement("DIV");
    svg.className = "variableView";
    svg.textContent = varname + " = ???";
    this.variableWrapper.appendChild(svg);
    this.varSvg.push(svg);
}



World.wrapper = function(func,args) {
    return func.apply(World.arrayWorld,args);
}


World.createWrapper = function(func) {
    return function(arg) {
        var args= [];
        for ( var i = 0 ; i < arguments.length; i++ ) {
            args[i] = arguments[i];
        }
        return World.wrapper(World.arrayWorld[func],args);        
    }
}

World.initSourceInterpreter = function(interpreter,scope) {
    AbbozzaInterpreter.createWrappers( interpreter, scope,
        [
            [ "fill"       ,World.arrayWorld,World.arrayWorld.fill       ,false,true ],
            [ "swap"       ,World.arrayWorld,World.arrayWorld.swap       ,false,true ],
            [ "reset"      ,World.arrayWorld,World.arrayWorld.reset      ,false,true ],
            [ "showAsIndex",World.arrayWorld,World.arrayWorld.showAsIndex,false,true ],
            [ "showAsVariable",World.arrayWorld,World.arrayWorld.showAsVariable,false,true ],
            [ "getLength"  ,World.arrayWorld,World.arrayWorld.getLength  ,false,false],
            [ "set"        ,World.arrayWorld,World.arrayWorld.set        ,false,true ],
            [ "get"        ,World.arrayWorld,World.arrayWorld.get        ,false,false]
        ]
    );
}
