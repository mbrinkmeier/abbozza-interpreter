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
    splitter: null,
    mycon: null,
    
    init : function() {
        this.splitter = new Splitter(document.getElementById('splitter'), "");
        this.mycon = new Console(document.getElementById('.topleft'));
        
        this.mycon.println("Willkommen!");
    },
    
    getId : function() {
        return "console";
    }
    
    
}


/**
 * The console as view for the context.
 */

Console.NO_INPUT = 0;
Console.READLINE = 1;
Console.READKEY = 2;

function Console(view) {

    this.minCursorPos_ = 0;
    this.inputMode_ = Console.READLINE;

    this.parent_ = document.createElement("div");
    this.parent_.className = "consoleParent";
    view.appendChild(this.parent_);
    
    // Create console_	
    this.console_ = document.createElement("textarea");
    this.console_.Console = this;
    this.parent_.appendChild(this.console_);

    // Set size of console
    this.console_.className = "console";

    // Add event handlers
    this.console_.addEventListener("keydown", this.keydown);    
};


Console.prototype.clear = function() {
    this.console_.value = "";
    this.minCursorPos_ = 0;
}

Console.prototype.print = function (text) {
    this.console_.value = this.console_.value + text;
    this.minCursorPos_ = this.console_.value.length + 1;
    this.console_.scrollTop = this.console_.scrollHeight;
    this.console_.selectionStart = this.console_.value.length + 1;
    this.console_.selectionEnd = this.console_.selectionStart;
};


Console.prototype.println = function (text) {
    // this.console_.value = this.console_.value + text + "\n";
    this.insertCharAt(text + "\n", this.minCursorPos_);
    this.minCursorPos_ = this.console_.value.length + 1;
    this.console_.scrollTop = this.console_.scrollHeight;
    this.console_.selectionStart = this.console_.value.length + 1;
    this.console_.selectionEnd = this.console_.selectionStart;
};


Console.prototype.readkey = function (callback = null) {
    this.inputMode_ = Console.READKEY;
    this.minCursorPos_ = this.console_.value.length + 1;
    this.console_.selectionStart = this.console_.value.length;
    this.console_.selectionEnd = this.console_.selectionStart;
    this.callback_ = callback;
};

Console.prototype.readline = function (callback = null) {
    this.inputMode_ = Console.READLINE;
    this.minCursorPos_ = this.console_.value.length + 1;
    this.console_.selectionStart = this.console_.value.length;
    this.console_.selectionEnd = this.console_.selectionStart;
    this.callback_ = callback;
    this.console_.scrollTop = this.console_.scrollHeight;
};


Console.prototype.addLineListener = function(callback) {
    this.console_.addEventListener("lineread",callback);
}


Console.prototype.insertCharAt = function (s, pos) {
    if ( pos < this.minCursorPos_ ) {
        pos = this.console_.value.length;
    }

    var prefix = this.console_.value.substring(0, pos);
    var suffix = this.console_.value.substring(pos);

    this.console_.value = prefix + s + suffix;
    this.console_.selectionStart = pos + 1;
    this.console_.selectionEnd = this.console_.selectionStart;
    this.console_.scrollTop = this.console_.scrollHeight;
};

Console.prototype.deleteCharAt = function (pos) {
    var prefix = this.console_.value.substring(0, pos - 1);
    var suffix = this.console_.value.substring(pos);

    this.console_.value = prefix + suffix;
    this.console_.selectionStart = pos-1;
    this.console_.selectionEnd = this.console_.selectionStart;
    this.console_.scrollTop = this.console_.scrollHeight;
};



/**
 * This event handler is executed by console_
 */
Console.prototype.keydown = function (event) {
    var con = this.Console;

    if (con.inputMode_ == Console.NO_INPUT) {
        event.preventDefault();
        return;
    }

    if (con.inputMode_ == Console.READKEY) {
        event.preventDefault();

        if (con.callback_ != null) {
            con.callback_.call(this, event.key);
        }

        var myEvent = document.createEvent('Event');
        myEvent.initEvent('keyread', true, true);
        myEvent.key = event.key;
        con.inputMode_ = Console.READLINE;
        this.dispatchEvent(myEvent);
        return;
    }

    switch (event.key) {
        case "Backspace" :
            if (this.selectionStart >= con.minCursorPos_) {
                con.deleteCharAt(this.selectionStart);
            }
            break;
        case "Delete" :
            con.deleteCharAt(this.selectionStart + 1);
            break;
        case "ArrowLeft" :
            if (this.selectionStart < con.minCursorPos_) {
                this.selectionStart = con.minCursorPos_ - 1;
            } else {
                this.selectionStart--;
            }
            this.selectionEnd = this.selectionStart;
            break;
        case "ArrowRight" :
            if (this.selectionStart >= this.value.length) {
                this.selectionStart = this.value.length;
            } else {
                this.selectionStart++;
            }
            this.selectionEnd = this.selectionStart;
            break;
        case "Enter":
            if (con.inputMode_ == Console.READLINE) {
                var line = this.value.substring(con.minCursorPos_ - 1);

                if (con.callback_ != null) {
                    con.callback_.call(this, line);
                }
                var myEvent = document.createEvent('Event');
                myEvent.initEvent('lineread', true, true);
                myEvent.line = line;
                con.inputMode_ = Console.READLINE;
                this.dispatchEvent(myEvent);
                con.minCursorPos_ = this.value.length + 1;
            }
            con.insertCharAt("\n", this.selectionStart);
            break;
        default:
            if (event.key.length == 1) {
                con.insertCharAt(event.key, this.selectionStart);
            }
    }
    event.preventDefault();
};
