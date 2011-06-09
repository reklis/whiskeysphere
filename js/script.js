var datafeed = null;
var treeroot = null;
var ht = null;


function init() {
  
  datafeed = new whiskey();
  datafeed.apikey("42a02401c2f625764249aa0d50361c26c676f81c");
  
  $("#txtSearchGame").keyup(function() {
    if ($("#searcharea").css("top") != "0px") {
      $("#searcharea").animate({
        "top":"0px"
      });
    }
      
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
          
          $("#searcharea").fadeOut();
          showGame(gameid);
        });
        
      });
    
  })
  
}


function showGame(gameid) {
  var gameName = $('.autocompletelist li[data-gameid='+gameid+']').text();
  $("#txtSearchGame").val(gameName);
  //$('.autocompletelist').remove();
  $("#progress").activity();
  
  datafeed.game(gameid, function(d) {
      //window.log(d);
      treeroot = makeDetailNodeTree(d.results);
      //window.log(treeroot);
      
      var w = window.innerWidth * .6, h = window.innerHeight * .6;
      ht = new $jit.Hypertree({
        injectInto: 'hypertree',
         width: w,
         height: h,
         Node: {
            dim: 9,
            color: "#f00"
        },
         Edge: {
          lineWidth: 2,
          color: "#088"
      },
      onBeforeCompute: function(node){
          window.log("centering");
      },
      onCreateLabel: function(domElement, node){
          domElement.innerHTML = node.name;
          $(domElement).click(function () {
              ht.onClick(node.id);
          });
      },
      onPlaceLabel: function(domElement, node){
          var style = domElement.style;
          style.display = '';
          style.cursor = 'pointer';
          if (node._depth <= 1) {
              style.fontSize = "0.8em";
              style.color = "#ddd";

          } else if(node._depth == 2){
              style.fontSize = "0.7em";
              style.color = "#555";

          } else {
              style.display = 'none';
          }

          var left = parseInt(style.left);
          var w = domElement.offsetWidth;
          style.left = (left - w / 2) + 'px';
      },
      onAfterCompute: function(){
          window.log("done");
          
          //Build the right column relations list.
          //This is done by collecting the information (stored in the data property) 
          //for all the nodes adjacent to the centered node.
          var node = ht.graph.getClosestNodeToOrigin("current");
          var div = $("<div>");
          $("<h4>", {html: node.name}).appendTo(div);
          var ul = $("<ul>");
          node.eachAdjacency(function(adj){
              var child = adj.nodeTo;
              if (child.data) {
                  var li = $("<li>");
                  if (child.data.api_detail_url) {
                    var a = $("<a>", {
                        "href": "javascript:loadChildren(\""+child.data.api_detail_url+"\")",
                        "html": child.name
                        });
                    a.appendTo(li);
                  } else {
                    li.html(child.name);
                  }
                  li.appendTo(ul);
              }
          });
          ul.appendTo(div);
          $("#hypertree-selected-node-details").html(div);
      }
    });
    
    ht.loadJSON(treeroot);
    
    $("#progress").activity(false);
    $("#hypertree-container").fadeIn();
    
    ht.refresh();
    ht.controller.onAfterCompute();
  });
}

function makeDetailNodeTree(detail_item, parent_node) {
  if (detail_item.api_detail_url) {
    var node = {
      "id": detail_item["api_detail_url"],
      "name": detail_item["name"],
      "data": {},
      "children":[]
      };
    
    $.map(detail_item, function(v,k) { 
      if ($.isArray(v)) {
        if (v.length != 0) {
          var nested_node = {
            "id": detail_item["api_detail_url"] + "-" + k,
            "name": k,
            "data": {},
            "children":[]
          };
          $.each(v, function(i,e) {
            makeDetailNodeTree(e, nested_node);
          });
          node["children"].push(nested_node);
        } else {
          // skip empty arrays
        }
      } else if ($.isPlainObject(v)) {
        makeDetailNodeTree(v, node);
      } else {
        node["data"][k] = v;
      }
    });
    
    if (undefined != parent_node) {
      parent_node["children"].push(node);
    }
    return node;
  } else {
    //window.log("no detail_item.detail_url: " + detail_item);
    return null;
  }
}

function loadChildren(selected_node) {
  $("#hypertree-container").fadeOut();
  $("#progress").activity();
  
  datafeed.fetchResource(datafeed.jsonResource(selected_node), function(d) {
    $("#progress").activity(false);
    $("#hypertree-container").fadeIn();
    //window.log(d);
    treeroot = makeDetailNodeTree(d.results);
    ht.loadJSON(treeroot);
    ht.refresh();
  });
}


