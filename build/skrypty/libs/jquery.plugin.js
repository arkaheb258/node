/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
!function(){var a=!1;window.JQClass=function(){},JQClass.classes={},JQClass.extend=function b(c){function d(){!a&&this._init&&this._init.apply(this,arguments)}var e=this.prototype;a=!0;var f=new this;a=!1;for(var g in c)f[g]="function"==typeof c[g]&&"function"==typeof e[g]?function(a,b){return function(){var c=this._super;this._super=function(b){return e[a].apply(this,b||[])};var d=b.apply(this,arguments);return this._super=c,d}}(g,c[g]):c[g];return d.prototype=f,d.prototype.constructor=d,d.extend=b,d}}(),function($){function camelCase(a){return a.replace(/-([a-z])/g,function(a,b){return b.toUpperCase()})}JQClass.classes.JQPlugin=JQClass.extend({name:"plugin",defaultOptions:{},regionalOptions:{},_getters:[],_getMarker:function(){return"is-"+this.name},_init:function(){$.extend(this.defaultOptions,this.regionalOptions&&this.regionalOptions[""]||{});var a=camelCase(this.name);$[a]=this,$.fn[a]=function(b){var c=Array.prototype.slice.call(arguments,1);return $[a]._isNotChained(b,c)?$[a][b].apply($[a],[this[0]].concat(c)):this.each(function(){if("string"==typeof b){if("_"===b[0]||!$[a][b])throw"Unknown method: "+b;$[a][b].apply($[a],[this].concat(c))}else $[a]._attach(this,b)})}},setDefaults:function(a){$.extend(this.defaultOptions,a||{})},_isNotChained:function(a,b){return"option"===a&&(0===b.length||1===b.length&&"string"==typeof b[0])?!0:$.inArray(a,this._getters)>-1},_attach:function(a,b){if(a=$(a),!a.hasClass(this._getMarker())){a.addClass(this._getMarker()),b=$.extend({},this.defaultOptions,this._getMetadata(a),b||{});var c=$.extend({name:this.name,elem:a,options:b},this._instSettings(a,b));a.data(this.name,c),this._postAttach(a,c),this.option(a,b)}},_instSettings:function(){return{}},_postAttach:function(){},_getMetadata:function(elem){try{var data=elem.data(this.name.toLowerCase())||"";data=data.replace(/'/g,'"'),data=data.replace(/([a-zA-Z0-9]+):/g,function(a,b,c){var d=data.substring(0,c).match(/"/g);return d&&d.length%2!==0?b+":":'"'+b+'":'}),data=$.parseJSON("{"+data+"}");for(var name in data){var value=data[name];"string"==typeof value&&value.match(/^new Date\((.*)\)$/)&&(data[name]=eval(value))}return data}catch(e){return{}}},_getInst:function(a){return $(a).data(this.name)||{}},option:function(a,b,c){a=$(a);var d=a.data(this.name);if(!b||"string"==typeof b&&null==c){var e=(d||{}).options;return e&&b?e[b]:e}if(a.hasClass(this._getMarker())){var e=b||{};"string"==typeof b&&(e={},e[b]=c),this._optionsChanged(a,d,e),$.extend(d.options,e)}},_optionsChanged:function(){},destroy:function(a){a=$(a),a.hasClass(this._getMarker())&&(this._preDestroy(a,this._getInst(a)),a.removeData(this.name).removeClass(this._getMarker()))},_preDestroy:function(){}}),$.JQPlugin={createPlugin:function(a,b){"object"==typeof a&&(b=a,a="JQPlugin"),a=camelCase(a);var c=camelCase(b.name);JQClass.classes[c]=JQClass.classes[a].extend(b),new JQClass.classes[c]}}}(jQuery);