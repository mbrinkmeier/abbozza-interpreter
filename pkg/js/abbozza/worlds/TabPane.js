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

/**
 * Setup the given view as TabPane.
 * 
 * @param {type} The view to be used as TabPane
 * @returns {TabPane}
 */
TabPane = function(view) {
    this.parent = view;
    this.parent.className = "tabPane";
    
    this.buttons = document.createElement("div");
    this.buttons.className = "tabButtons";
    this.parent.appendChild(this.buttons);
    
    this.currentTab = null;
}


TabPane.prototype.addPane = function (name,content) {
    var button = document.createElement("button");
    button.textContent = name;
    button.className =  "tabButton";
    var tabs = this;
    button.onclick = function(event) {
        tabs.openTab(content);
    }
    this.buttons.appendChild(button);
    
    content.className = "tabContent";
    content.tabButton = button;
    
    if ( this.currentTab == null ) {
        this.openTab(content);
    }
    
    return content;
}


TabPane.prototype.openTab = function(tab) {
    // Declare all variables
    var i, tabcontent, tablinks;
    
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tabButton");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    tab.style.display = "block";
    this.currentTab = tab;
    if (tab.tabButton) tab.tabButton.className += " active";
}

