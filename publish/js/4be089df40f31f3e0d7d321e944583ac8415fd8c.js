window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;console.log(Array.prototype.slice.call(arguments))}};(function(e){function h(){}for(var g="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),f;f=g.pop();){e[f]=e[f]||h}})(window.console=window.console||{});window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;console.log(Array.prototype.slice.call(arguments))}};(function(e){function h(){}for(var g="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),f;f=g.pop();){e[f]=e[f]||h}})(window.console=window.console||{});function whiskey(){}whiskey.prototype.apikey=function(a){if(undefined!=a){this._apikey=a}return this._apikey};whiskey.prototype.search=function(a,c){var b=new XMLHttpRequest();b.onload=function(){alert(b.response)};b.open("GET","view-source:http://api.giantbomb.com/search/?format=json&api_key="+this._apikey+"&query="+encodeURI(a)+ +"&resources=game&field_list=id,name")};