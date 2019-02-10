/*  
 * Copyright 2018 Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>.
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
 * This static object handles the stars of a sequence of tasks (levels).
 */
var LevelMgr = {};

var Levels = {
    maxStars: 3,
    stars: [],
    data: [],
    id: null,
    unlocked: false
};

/**
 * Initialize the levels with the given id, size and maximal stars.
 * 
 * @param {type} id
 * @param {type} number
 * @param {type} maxStars
 * @returns {undefined}
 */
LevelMgr.init = function (id, number, maxStars = 3, unlocked = false) {
    // LevelMgr.load(id);
    LevelMgr.delete(id);
    if (!Levels || Levels.id == null) {
        Levels.maxStars = maxStars;
        Levels.stars = [];
        Levels.id = id;
        Levels.unlocked = false;
        for (var l = 0; l < number; l++) {
            if (Levels.unlocked) {
                Levels.stars.push(0);
            } else {
                Levels.stars.push(-1);
            }
            Levels.data.push(null);
        }
        if (Levels.stars[0]) {
            Levels.stars[0] = 0;
        }
        this.store();
    }
    LevelMgr.nextURL = "";
    LevelMgr.backURL = "";
}

/**
 * Load the levels from the local storage.
 * 
 * @param {type} id
 * @returns {undefined}
 */
LevelMgr.load = function (id) {
    var json = window.localStorage.getItem("abz_levels_" + id);
    if (json == null) {
        Levels.id = null;
    } else {
        Levels = JSON.parse(json);
    }
}

/**
 * Store thelevels to the local storage
 * 
 * @returns {undefined}
 */
LevelMgr.store = function () {
    if (Levels.id == null)
        return;
    var json = JSON.stringify(Levels);
    window.localStorage.setItem("abz_levels_" + Levels.id, json);
}

LevelMgr.delete = function (id) {
    window.localStorage.removeItem("abz_levels_" + id);
}


/**
 * Reset all Levels
 * 
 * @returns {undefined}
 */
LevelMgr.reset = function () {
    var s = -1;
    if (Levels.unlock) {
        s = 0;
    }
    for (var l = 0; l < Levels.stars.length; l++) {
        Levels.stars[l] = s;
        Levels.data[l] = null;
    }
    if (Levels.stars[0]) {
        Levels.stars[0] = 0;
    }
}

/**
 * Get the number of achieved stars.
 * -1 indicates an legal level which isn unlocked yet.
 * -2 indicate an illegal level.
 * 
 * @param {type} level
 * @returns {Number|LevelMgr@arr;@arr;progress}
 */
LevelMgr.getStars = function (level) {
    if ((level >= 0) && (level < Levels.stars.length)) {
        return Levels.stars[level];
    } else {
        return -2;
    }
}

/**
 * Set the number of stars for the given level.
 * 
 * @param {type} level
 * @param {type} stars
 * @returns {undefined}
 */
LevelMgr.setStars = function (level, stars) {
    if ((level >= 0) && (level < Levels.stars.length)) {
        Levels.stars[level] = stars;
        this.store();
    }
}


/**
 * Get the data associated to a level.
 * 
 * @param {type} level
 * @returns {.JSON@call;parse.data}
 */
LevelMgr.getData = function (level) {
    if ((level >= 0) && (level < Levels.data.length)) {
        return Levels.data[level];
    } else {
        return null;
    }
}


/**
 * Set the data associated to a level.
 * 
 * @param {type} level
 * @param {type} data
 * @returns {undefined}
 */
LevelMgr.setData = function (level, data) {
    if ((level >= 0) && (level < Levels.data.length)) {
        Levels.data[level] = stars;
        this.store();
    }
}

/**
 * Inject the stars for the given level into the node.
 * 
 * @param {type} node
 * @param {type} level
 * @param {type} size
 * @param {type} failed
 * @param {type} animated
 * @returns {unresolved}
 */
LevelMgr.injectStars = function (node, level, size, failed, animated) {
    if ((level < 0) || (level >= Levels.stars.length))
        return null;

    // Remove children from node
    while (node.firstChild)
        node.removeChild(node.firstChild);

    var stars = Levels.stars[level];
    var element = document.createElement("SPAN");
    node.appendChild(element);
    element.className = "levelStars";
    var m = size / 2;

    for (var i = 0; (i < Levels.maxStars) || (i < stars); i++) {
        var img = document.createElement("IMG");
        if (i < stars) {
            img.setAttribute("src", "/img/star.svg");
            if (animated) {
                img.animate(
                        [
                            {transform: "scale(0) rotate(0deg)"},
                            {transform: "scale(1) rotate(720deg)"}
                        ], {
                    duration: 500,
                    delay: 500 * i,
                    fill: "both",
                    accumulate: "sum",
                    additive: "sum"
                }
                );
            }
            img.setAttribute("width", size);
            img.style.margin = (size / 10) + "px";
            element.appendChild(img);
        } else {
            if (failed) {
                img.setAttribute("src", "/img/nostar.svg");
                if (animated) {
                    img.animate(
                            [
                                {transform: "scale(0)"},
                                {transform: "scale(1)"}
                            ], {
                        duration: 100,
                        delay: 500 * stars + 100 * (i - stars),
                        fill: "both",
                        accumulate: "sum",
                        additive: "sum"
                    }
                    );
                }
                ;
                img.setAttribute("width", size);
                img.style.margin = (size / 10) + "px";
                element.appendChild(img);
            }
        }
    }

}

/**
 * Constructs a sequence of stars for the given Level.
 * 
 * @param {type} level The level
 * @param {type} size The size of the stars
 * @param {type} failed If true, unreached stars are shown
 * @param {type} animated If true, the achieved stars will be animated
 * 
 * @returns {LevelMgr.getStarsView.element}
 */
LevelMgr.getStarsView = function (level, size, msg = "", failed = true, animated = false) {
    if ((level < 0) || (level >= Levels.stars.length))
        return null;

    var div = document.createElement("DIV");
    LevelMgr.injectStars(div, level, size, failed, animated);

    if (typeof msg == "string") {
        var element = document.createElement("DIV");
        element.className = "levelMsg";
        element.textContent = msg;
        div.appendChild(element);
    } else {
        div.appendChild(msg);
    }

    return div;
}

/**
 * Opens an overlay displayig´ng the level stars
 * 
 * @param {type} level
 * @param {type} size
 * @param {type} msg
 * @returns {undefined}
 */
LevelMgr.openLevelOverlay = function (level, size, msg, failed = true) {
    if ( !failed ) {
        Abbozza.createOverlayDialog(
            LevelMgr.getStarsView(level, size, msg, failed, true),
            [
                {
                    msg: "Nächster Level",
                    cmd: "next",
                    callback: LevelMgr.next,
                    obj: null,
                    class: "levelButton"
                },
                {
                    msg: "Nochmal",
                    cmd: "retry",
                    callback: LevelMgr.retry,
                    obj: null,
                    class: "levelButton"
                },
                {
                    msg: "Zurück",
                    cmd: "back",
                    callback: LevelMgr.back,
                    obj: null,
                    class: "levelButton"
                }
            ],
            null
        );
    } else {
        Abbozza.createOverlayDialog(
            LevelMgr.getStarsView(level, size, msg, failed, true),
            [
                {
                    msg: "Nochmal",
                    cmd: "retry",
                    callback: LevelMgr.retry,
                    obj: null,
                    class: "levelButton"
                },
                {
                    msg: "Zurück",
                    cmd: "back",
                    callback: LevelMgr.back,
                    obj: null,
                    class: "levelButton"
                }
            ],
            null
        );        
    }
}


/**
 * Inject stars and stuff into level elements.
 * 
 * @type type
 */
LevelMgr.inject = function(size) {
    var levelElements = document.getElementsByClassName("levelLink");
    for ( var i = 0; i < levelElements.length; i++ ) {
        var levelElement = levelElements[i];
        var level = Number(levelElement.getAttribute("level"));
        var href = levelElement.getAttribute("href");
        var text = levelElement.getAttribute("text");
        LevelMgr.injectStars(levelElement,level,size,true,false);
        var anchor = document.createElement("A");
        anchor.setAttribute("href",href);
        anchor.textContent = text;
        if ( (Levels.unlocked == false) && (Levels.stars[level] < 0 ) ) {
            anchor.className = "levelDisabled";
        }
        levelElement.appendChild(anchor);
    }
}


LevelMgr.setNavURLs = function(backURL,nextURL) {
    LevelMgr.backURL = backURL;
    LevelMgr.nextURL = nextURL;
}

LevelMgr.next = function() {
    // Go to next level
    document.location.reload();
}

LevelMgr.retry = function() {}

LevelMgr.back = function() {
    // Go back to menu
    Abbozza.setSketchFromPath(LevelMgr.backURL);
}