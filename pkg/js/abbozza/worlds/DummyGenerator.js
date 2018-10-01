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



/**
 * This operation retrieves the correct keyword described by an abbozza! label.
 * 
 * @param {type} tag
 * @returns {unresolved}
 */
keyword = function(tag) {
	for (var i = 0; i < __keywords.length; i++) {
		if ( __keywords[i][0] == tag ) 
		return __keywords[i][1];
	}
	return tag;
};

setKeyword = function(key,word) {
    for (var i = 0; i < __keywords.length; i++) {
	if ( __keywords[i][0] == key ) {
            __keywords[i][1] = word;
        }
    }
};