function whiskey() {
  this._apiroot = "http://api.giantbomb.com";
}

whiskey.prototype.jsonResource = function(r) {
  return r
    + "?format=jsonp&api_key="
    + this._apikey;
}

whiskey.prototype.resource = function(r, q) {
  var url = this._apiroot 
    + "/"
    + this.jsonResource(r + "/");
    
  if (undefined != q) {
    url += q;
  }
  
  return url;
}

whiskey.prototype.apikey = function(v) {
    if (undefined != v) {
        this._apikey = v;
    }
    return this._apikey;
}

whiskey.prototype.search = function(querystring, callback) {
  var filter = "&query=" + encodeURI(querystring) + "&resources=game&limit=5&field_list=id,name";
  this.fetchResource(this.resource("search", filter), callback);
}

whiskey.prototype.game = function(gameid, callback) {
  this.fetchResource(this.resource("game/"+gameid, ""), callback);
}

whiskey.prototype.fetchResource = function(resource_url, callback) {
  window.log("Fetching " + resource_url + "...");
  $.getJSON(resource_url + "&json_callback=?", callback);
}