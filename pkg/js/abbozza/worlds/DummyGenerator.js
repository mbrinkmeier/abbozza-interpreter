var ReservedWords = {
    list : ""
};

ReservedWords.check = function(text) {
    var myRegExp = new RegExp(".*," + text+ ",.*", 'i');
    return this.list.match(myRegExp);
};

__keywords = [];


AbbozzaGenerator = function() {}

AbbozzaGenerator.prototype.init = function() {}