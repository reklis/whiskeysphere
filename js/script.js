var datafeed = null;
var treeroot = null;
var ht = null;


function init() {
  
  $(window).bind('popstate', function(evt) {
    window.log('popstate');
    window.log(evt);
    var r = evt.originalEvent.state;
    if (r) {
      ht.loadJSON(r);
      ht.refresh();
      showNodeDetails(r);
      document.title = r.name;
    } else {
      $("#hypertree-container").fadeOut();;
      $("#searcharea").fadeIn();
    }
  })

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
          //window.log(gameid);
          
          $("#searcharea").fadeOut();
          showGame(gameid);
        });
        
      });
    
  });
  
}


function showGame(gameid) {
  var gameName = $('.autocompletelist li[data-gameid='+gameid+']').text();
  $("#txtSearchGame").val(gameName);
  //$('.autocompletelist').remove();
  $("#progress").activity();
  
  datafeed.game(gameid, function(d) {
      window.log(d);
      treeroot = makeDetailNodeTree(d.results);
      //window.log(treeroot);
      
      var w = window.innerWidth-100, h = window.innerHeight-100;
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
      onBeforeCompute: function(node) {
          //window.log("centering");
      },
      onCreateLabel: function(domElement, node) {
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
            style.fontSize = "1em";
            style.color = "#ddd";
            style.zIndex = 2;
          } else if(node._depth == 2) {
            style.fontSize = ".7em";
            style.color = "#555";
            style.zIndex = 1;
          } else {
            style.display = 'none';
          }
          
          var left = parseInt(style.left);
          var w = domElement.offsetWidth;
          style.left = (left - w / 2) + 'px';
      },
      onAfterCompute: function() {
        var node = ht.graph.getClosestNodeToOrigin("current");
        window.log(node);
        showNodeDetails(node);
      }
    });
    
    ht.loadJSON(treeroot);
    
    $("#progress").activity(false);
    $("#hypertree-container").fadeIn();
    
    ht.refresh();
    showNodeDetails(treeroot);
    history.pushState(treeroot, treeroot.name);
    document.title = treeroot.name;
  });
}

function makeDetailNodeTree(detail_item, parent_node) {
  if (detail_item.api_detail_url) {
    var node = {
      "id": detail_item["api_detail_url"],
      "name": detail_item["name"].replace(/_/g," "),
      "data": {},
      "children":[]
      };
    
    $.map(detail_item, function(v,k) { 
      if ($.isArray(v)) {
        if (v.length != 0) {
          var nested_node = {
            "id": detail_item["api_detail_url"] + "-" + k,
            "name": k.replace(/_/g," "),
            "data": {},
            "children":[]
          };
          $.each(v, function(i,e) {
            makeDetailNodeTree(e, nested_node);
          });
          node["children"].push(nested_node);
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
  } else if (detail_item.super_url) {
    var node = {
      "id": detail_item["super_url"],
      "name": detail_item["super_url"].split('/').pop(),
      "data": { site_detail_url: detail_item["super_url"], image_url: detail_item["super_url"] },
      "children":[]
    };
    
    if (undefined != parent_node) {
      parent_node["children"].push(node);
    }
    
    return node;
  } else {
    return null;
  }
}

function showNodeDetails(node) {
  window.log("showNodeDetails")
  window.log(node);
  if (node.data.deck) {
    // we have the deck, just display it
    $("#hypertree-selected-node-details").html(node.data.deck);
    $("#hypertree-selected-node-details").css('display','visible');
  } else {
    // lazy load the deck if we can
    if (node.data.api_detail_url) {
      $("#progress").activity();
      datafeed.fetchResource(datafeed.jsonResource(node.data.api_detail_url), function(d) {
        $("#progress").activity(false);
        if (d.results.deck) {
          var details = d.results;
          var div = $("<div>");
          div.html(details.deck);
          var a = $("<a>", {
                    "href": "javascript:rerootTree(\""+details.api_detail_url+"\")",
                    "html": "View &raquo;"
                    });
          $(a).appendTo(div);
          $("#hypertree-selected-node-details").html(div);
        } else {
          $("#hypertree-selected-node-details").html("no information available");
        }
        $("#hypertree-selected-node-details").css('display','visible');
      });
    } else {
      // show children of the node
      var div = $("<div>");
      if (node.data.image_url != null && node.data.image_url != "") {
        var i = $("<img>", {
            "src": node.data.site_detail_url,
            "alt": node.name
            });
        i.appendTo(div);
      } else {
        $("<h4>", {html: node.name}).appendTo(div);
      }
      var ul = $("<ul>");
      node.eachAdjacency(function(adj){
          var child = adj.nodeTo;
          if ((child.data) && (child.data.api_detail_url != treeroot.data.api_detail_url)) {
              var li = $("<li>");
              if (child.data.api_detail_url) {
                var a = $("<a>", {
                    "href": "javascript:rerootTree(\""+child.data.api_detail_url+"\")",
                    "html": child.name
                    });
                a.appendTo(li);
              } else if (child.data.site_detail_url) {
                var i = $("<img>", {
                    "src": child.data.site_detail_url,
                    "alt": child.name
                    });
                i.appendTo(li);
              } else {
                li.html(child.name);
              }
              li.appendTo(ul);
          }
      });
      ul.appendTo(div);
      $("#hypertree-selected-node-details").html(div);
      $("#hypertree-selected-node-details").css('display','visible');
    }
  }
}

function rerootTree(selected_node) {
  window.log("rerootTree: " + selected_node);
  $("#hypertree-container").fadeOut();
  $("#progress").activity();
  
  datafeed.fetchResource(datafeed.jsonResource(selected_node), function(d) {
    $("#progress").activity(false);
    $("#hypertree-container").fadeIn();
    //window.log(d);
    treeroot = makeDetailNodeTree(d.results);
    ht.loadJSON(treeroot);
    ht.refresh();
    ht.controller.onAfterCompute();
    history.pushState(treeroot, treeroot.name);
    document.title = treeroot.name;
  });
}

function loadImage(selected_node) {
  window.log("loadImage: " + selected_node);
  var img = $("<img>", {
    'src': selected_node,
    'class': 'lightbox'
  });
  $(img).appendTo(body);
}

function showLeafNode(node) {
  window.log("showLeafNode");
  window.log(node);
}


