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

var World = new AbbozzaWorld("hanoi");

World.initView = function(view) {
    this.hanoi = new Hanoi(view);
    var hanoi = this.hanoi;
    Abbozza.splitter.addEventListener("splitter_resize", this.resize);
    
    var info = document.getElementById("info");
    info.contentDocument.getElementById("speed").value = (50-World.hanoi.duration/100);
    info.contentDocument.getElementById("discs").value = World.hanoi.numberOfDiscs;
    
    info.contentDocument.getElementById("speed").oninput = function(event) {
        World.hanoi.duration = 100 * (50-Number(this.value));
    }
    info.contentDocument.getElementById("discs").oninput = function(event) {
        World.hanoi.reset(info.contentDocument.getElementById("discs").value);
    }

};

World.resize = function(event) {
    World.hanoi.resize();
};



var svgNS = "http://www.w3.org/2000/svg";

/**
 * The class Hanoi 
 */
function Hanoi(parent) {
    this.parent = parent;
    this.view = document.createElement("div");
    this.view.className = "hanoiView";
    
    this.svg = document.createElementNS(svgNS,"svg");
    this.svg.className = "hanoiSvg";
    this.view.appendChild(this.svg);
    this.parent.appendChild(this.view);
    
    this.duration = 500;    
    this.reset(5);
    
    this.draw();
}


Hanoi.prototype.reset = function(discs) {
    discs = Number(discs);
    if ( discs <= 0) discs = 1;
    if ( discs > 20) discs = 20;
        
    this.numberOfDiscs = discs;
    this.stacks = [];
    this.stacks[0] = [];
    this.stacks[1] = [];    
    this.stacks[2] = [];
    
    this.discs = [];
    
    var width = this.view.offsetWidth;
    var height = this.view.offsetHeight;
    this.svg.setAttribute("width",width);
    this.svg.setAttribute("height",height);

    this.pos = [];
    this.pos[0] = 17.5;
    this.pos[1] = 50;    
    this.pos[2] = 82.5;
    this.thickness = 100/(this.numberOfDiscs+4);
    this.step = 20/this.numberOfDiscs;
    
    var sketch =
            "<rect x='0' y='" + (100-this.thickness) + "%' width='100%' height='" + this.thickness + "%' />";
    for ( var i = 0; i <= 2; i++ ) {
        sketch = sketch + "<line x1='" + this.pos[i] + "%' y1='100%' x2='" + this.pos[i] + "%' y2='" + (2*this.thickness) + "%' stroke='black' stroke-width='3%' height='" + (height-15) + "' />"; 
    }
    
    this.svg.innerHTML = sketch;

    for ( var i = 0; i < this.numberOfDiscs; i++ ) {
        this.stacks[0].push(this.numberOfDiscs-i);
        this.discs[i] = document.createElementNS(svgNS,"rect");
        this.discs[i].setAttribute("height", this.thickness + "%");
        this.discs[i].setAttribute("width",(5+i*this.step) + "%");
        this.discs[i].setAttribute("stroke-width","2");
        this.discs[i].setAttribute("stroke","black");
        this.discs[i].setAttribute("fill","white");
        this.discs[i].setAttribute("rx","5");
        this.discs[i].setAttribute("ry","5");
        this.svg.appendChild(this.discs[i]);
    }
    
    this.draw();
};

Hanoi.prototype.xpos = function(i,value) {
    var width = this.view.offsetWidth;    
    return width * (this.pos[i] - (2.5+(value-1)*this.step/2))/100;
}

Hanoi.prototype.ypos = function(j) {
    var height = this.view.offsetHeight;   
    return height * (100 - this.thickness * (j+2))/100;
}

Hanoi.prototype.resize = function() {    
    var width = this.view.offsetWidth;
    var height = this.view.offsetHeight;
    this.svg.setAttribute("width",width);
    this.svg.setAttribute("height",height);

    this.draw();
};

/**
 * Draw the towers
 * 
 * @returns {undefined}
 */
Hanoi.prototype.draw = function() {
    for ( i = 0; i <= 2; i++ ) {
        for ( var j = 0; j < this.stacks[i].length; j++ ) {
            var value = this.stacks[i][j];
            this.discs[this.stacks[i][j]-1].setAttribute("transform",
                "translate(" + this.xpos(i,value) + "," + this.ypos(j) + ")");
        }
    }
}

Hanoi.prototype.animate = function(from,to,callback) {

    var yfrom = this.stacks[from].length-1;
    var yto = this.stacks[to].length;
    var value = this.stacks[from][yfrom];
    var xs = Number(this.xpos(from,value));
    var ys = this.ypos(yfrom);
    var xe = Number(this.xpos(to,value));
    var ye = this.ypos(yto);

    var disc = this.discs[value-1];
    var animation = disc.animate(
        [
            { transform: "translate(" + xs + "px," + ys + "px)" },
            { transform: "translate(" + xs + "px,0px)" },
            { transform: "translate(" + xe + "px,0px)" },
            { transform: "translate(" + xe + "px," + ye + "px)" }
        ], {
            duration: Number(this.duration),
            fill: "both",
            composite: "add"
        }
    );
    Abbozza.waitForAnimation(animation,
        function(event) { 
            callback.call(this);
        });
}



Hanoi.prototype.moveDisc = function(from,to) {
    
    if ( (from > 2) || (from < 0) ) {
        Abbozza.throwException(1,_("err.from_illegal",[from]));
        return false;
    };
    
    if ( (to > 2) || (to < 0) ) {
        Abbozza.throwException(2,_("err.to_illegal",[to]));
        return false;
    };
                
    if (from == to) {
        Abbozza.throwException(3,_("err.no_move"));
        return false;
    };

    var fromValue;
    var toValue;
    
    if ( this.stacks[from].length > 0 ) {
        fromValue = this.stacks[from][this.stacks[from].length-1];
    } else {
        fromValue = 0;
    }    
    if ( this.stacks[to].length > 0 ) {
        toValue = this.stacks[to][this.stacks[to].length-1];
    } else {
        toValue = 0;
    }
    
    if ( fromValue <= 0 ) {
        Abbozza.throwException(4,_("err.empty_pos",[from]));
        return false;
    }
    
    if ( (fromValue <= toValue) || (toValue == 0) ) {
           var hanoi = this;
           this.animate(from, to , function() {
               hanoi.stacks[to].push(hanoi.stacks[from].pop());
               hanoi.draw();
           });
       
        return true;
    }
    
    Abbozza.throwException(5,_("err.size",[from,to])); 
    return false;
}


Hanoi.prototype.getNumberOfDiscs = function() {
    return this.numberOfDiscs;
}

Hanoi.prototype.getSize = function(pos) {
    if ( this.stacks[pos] && this.stacks[pos].length > 0 ) {
        return this.stacks[pos][this.stacks[pos].length-1];
    }
    return 0;
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

