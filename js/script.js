var datafeed = null;
var gamesphere = null;

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();


(function animloop(){
  render();
  requestAnimFrame(animloop);
})();


function render() {
  if (!gamesphere) return;
  
  
}

$(document).ready(function() {
  
  datafeed = new whiskey();
  datafeed.apikey("42a02401c2f625764249aa0d50361c26c676f81c");
  
  $("#txtSearchGame").keyup(function() {
      var q = $("#txtSearchGame").val();
      
      datafeed.search(q, function(d) {
        
        if ($("#searchresultautocomplete").length==0) {
          $("<div/>", { id: "searchresultautocomplete" }).appendTo('#searcharea');
        }
        $("#searchresultautocomplete").html("");
        
        //window.log(d);
        
        var items = [];
        
        $.each(d.results, function(k, v) {
            items.push('<li data-gameid="' + v.id + '">' + v.name + '</li>');
            
        });
        
        $('<ul/>', {
                'class': 'autocompletelist',
                html: items.join('')
            }).appendTo('#searchresultautocomplete');
            
        $('.autocompletelist li').click(function() {
          var gameid = $(this).attr("data-gameid");
          window.log(gameid);
          
          showGame(gameid);
        });
        
      });
    
  })
  
});


function showGame(gameid) {
  var gameName = $('.autocompletelist li[data-gameid='+gameid+']').text();
  $("#txtSearchGame").val(gameName);
  $('.autocompletelist').remove();
  
  datafeed.game(gameid, function(d) {
      window.log(d);
      
      var root = $("#gamesphere");
      root.html("");
      makeDetailNodeTree('root', d.results, root);
      gamesphere = root;
      window.log( $(gamesphere).html() );
  });
}

function makeDetailNodeTree(key, detail_item, parent_node) {
  if (detail_item.api_detail_url) {
    $("<li />", { 
          class: 'detailnode ' + key, 
          "data-detailurl": detail_item.api_detail_url,
          html: detail_item.name
    }).appendTo(parent_node);
    
    $.map(detail_item, function(v,k) { 
      if ($.isArray(v) && (v.length != 0)) {
        var ul = $("<ul />", { class: 'detailnode' });
        $.each(v, function(i,e) {
          makeDetailNodeTree(k, e, $(ul));
        });
        $(ul).appendTo(parent_node);
      } else if ($.isPlainObject(v)) {
        makeDetailNodeTree(k, v, parent_node);
      }
    });
  } else {
    //window.log("no detail_item.detail_url: " + detail_item);
    return null;
  }
}


