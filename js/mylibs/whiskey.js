function whiskey() {
  this._apiroot = "http://api.giantbomb.com";
}

whiskey.prototype.resource = function(r, q) {
  return this._apiroot 
    + "/"
    + r
    + "/?format=jsonp&api_key="
    + this._apikey
    + q;
}

whiskey.prototype.apikey = function(v) {
    if (undefined != v) {
        this._apikey = v;
    }
    return this._apikey;
}

whiskey.prototype.search = function(querystring, callback) {
    var u = this.resource("search", "&query=" + encodeURI(querystring) 
    + "&resources=game&limit=5&field_list=id,name&json_callback=?");
    //window.log(u);
    $.getJSON(u, callback);
}

whiskey.prototype.game = function(gameid, callback) {
  var u = this.resource("game/"+gameid, "&json_callback=?");
  $.getJSON(u, callback);
}