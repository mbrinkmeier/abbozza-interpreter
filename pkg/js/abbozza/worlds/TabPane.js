

TabPane = function(view) {
    this.parent = view;
    this.parent.className = "tab";
    
    /*
    this.menu = document.createElement("div");
    this.menu.style.position = "absolute";
    this.menu.style.width = "100%";
    this.menu.style.height="50px";
    this.menu.style.borderBottom="none";
    this.parent.appendChild(this.menu);
    
    this.view = document.createElement("div");
    this.view.style.position = "absolute";
    this.view.style.width = "100%";
    this.view.style.top="50px";
    this.view.style.bottom="0px";
    this.view.style.border="1pt black solid";
    this.parent.appendChild(this.view);
    */
}

TabPane.prototype.addPane = function (name,content) {
    var button = document.createElement("button");
    button.textContent = name;
    button.className =  "tablinks";
    var tabs = this;
    button.onclick = function(event) {
        tabs.openTab(content);
    }
    this.parent.appendChild(button);
    
    content.className = "tabcontent";
    content.tabButton = button;
    
    return content;
}


TabPane.prototype.openTab = function(tab) {
    // Declare all variables
    var i, tabcontent, tablinks;
    
   
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    tab.style.display = "block";
    if (tab.tabButton) tab.tabButton.className += " active";
}

