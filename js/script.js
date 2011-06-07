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


var deg = 57.29577951308232;
var ticks = Date.now();
function render() {
  if (!gamesphere) return;
  
  var w = window.innerWidth;
  var h = window.innerHeight;
  $("#camera").css({"-webkit-transform": "translateX("+w/2+"px)" + " traslateY("+h/2+"px)"});

  var panelSize = 60;
  var numberOfPanels = $(gamesphere).children().length-1;
  
  var N = numberOfPanels;
  var inc = Math.PI * (3 - Math.sqrt(5));
  var off = 2 / N;
  $(gamesphere).children().each(function(i,e) {
    if (i != 0) {
        var y = i * off - 1 + (off / 2);
        var r = Math.sqrt(1 - y*y);
        var phi = i * inc;
        
        var tx = Math.cos(phi)*r;
        var ty = y;
        var tz = Math.sin(phi)*r;
        
        var rx = Math.cos(phi)*deg*90;
        var ry = ty*deg*90;
        var rz = Math.sin(phi)*deg*90;
        
        
      
      // var rx = i*360/numberOfPanels;
      // var ry = 
      // var tz = Math.round(
      //     (panelSize/2) / Math.tan(Math.PI/numberOfPanels)
      //   );

      if ($(e).attr("data-selected") == "true") {
        tz *= 2;
      }
      $(e).css({
        "-webkit-transform": "translateX("+tx*200+"px) translateY("+ty*200+"px) translateZ("+tz*100+"px) rotateX("+rx+"deg) rotateY("+ry+"deg) rotateZ("+rz+"deg) ",
        "border":"1px solid black"
        });
    } else {
      $(e).css({"background-color":"rgba(255,255,0,.7)"});
    }
  });
  
  $("#gamesphere").css({"-webkit-transform":"rotateY("+ (((Date.now()-ticks)/1000)*deg) +"deg) "});
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
      //window.log( $(gamesphere).html() );
      
        $(gamesphere).children().each(function(i,e) {
          $(e).click(function(){
            $(this).attr("data-selected","true");
            window.log($(this).html());
            $(this).siblings().attr("data-selected", "false");
          });
        });
  });
}

function makeDetailNodeTree(key, detail_item, parent_node) {
  if (detail_item.api_detail_url) {
    $("<li />", { 
          "class": 'detailnode ' + key, 
          "data-detailurl": detail_item.api_detail_url,
          "html": detail_item.name
    }).appendTo(parent_node);
    
    $.map(detail_item, function(v,k) { 
      if ($.isArray(v) && (v.length != 0)) {
        //var ul = $("<ul />", { 'class': 'detailnode' });
        $.each(v, function(i,e) {
          //makeDetailNodeTree(k, e, $(ul));
          makeDetailNodeTree(k, e, parent_node);
        });
        //$(ul).appendTo(parent_node);
      } else if ($.isPlainObject(v)) {
        makeDetailNodeTree(k, v, parent_node);
      }
    });
  } else {
    //window.log("no detail_item.detail_url: " + detail_item);
    return null;
  }
}


