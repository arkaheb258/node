/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
define(["jquery","d3"],function(a,b){"use strict";var c=function(a){function c(a){var c=b.interpolate(y,a);return function(a){return y=c(a),D.endAngle(c(a))()}}function d(){k.each(function(d){var k,E,F,G,H,I,J,K,L,M,N,O,P=function(){for(k.attr("width","100%").attr("height","100%"),E=k.append("g").attr("class","lukGlowny").attr("fill",p),f=a.offsetWidth/2*.75,g=f/2,D.outerRadius(f).innerRadius(f*o).startAngle(-90*(Math.PI/180)).endAngle(90*(Math.PI/180)),M=f+(a.offsetWidth-2*f)/2,N=f,l="translate("+M+","+N+")",E.append("path").attr("transform",l).attr("d",D),C=.1*f,D.endAngle(y),G=k.append("g").attr("class","lukWartosc").selectAll(".arc").data(d),h=G.enter().append("path").attr("fill","silver").attr("transform",l).attr("d",D),O=0;O<e.length;O+=1)0!==e[O].hi&&e[O].hi-e[O].lo>0&&(A.push(e[O].color),z.push(e[O].hi-e[O].lo));if(0===e[0].hi||0===e[0].histLo||isNaN(0!==e[0].histLo)||(z[1]=z[1]-e[0].histLo,z.splice(1,0,e[0].histLo),A.splice(1,0,"orange")),0!==e[4].hi&&0!==e[4].histHi&&!isNaN(e[4].histHi)){var c=z.length-1;z[c-1]=z[c-1]-e[4].histHi,z.splice(c,0,e[4].histHi),A.splice(c,0,"orange")}m=b.svg.arc().outerRadius(f*o-2).innerRadius(f*o-f/4*x),I=b.layout.pie().value(function(a){return a}).sort(null).startAngle(-90*(Math.PI/180)).endAngle(90*(Math.PI/180)),F=k.append("g").attr("class","zakresy"),H=F.selectAll(".arc").data(I(z)).enter().append("g").attr("class","arc").attr("fill",p),H.append("path").attr("d",m).attr("transform",l).style("fill",function(a,b){return A[b]}),i=k.append("text").text("_wart").attr("font-weight","bold").attr("font-family","Arial").attr("fill",s).attr("font-size",2.9*C).attr("class","chartArcsGaugeUnit").attr("transform",l).attr("dy","-0.6em").style("text-anchor","middle"),j=k.append("text").attr("text-anchor","middle").attr("font-family","Arial").attr("fill-opacity",.8).attr("fill",s).attr("font-size",1.2*C).attr("class","label").attr("transform",l).attr("dy","-0.1em").text(r),J=k.append("foreignObject").attr("y",f).attr("height",30).attr("width",a.offsetWidth-10).attr("style","word-wrap: break-word; text-align:center;").attr("text-anchor","middle").attr("font-family","Arial").style("color",s).attr("font-size",1.4*C).attr("class","label").text(q),K=k.append("text").attr("text-anchor","middle").attr("font-family","Arial").attr("fill-opacity",.8).attr("fill",s).attr("font-size",1.2*C).attr("class","label").attr("transform","translate("+(M-f*o*.8)+","+N+")").attr("dx","0.3em").text(v),L=k.append("text").attr("text-anchor","middle").attr("font-family","Arial").attr("fill-opacity",.8).attr("fill",s).attr("font-size",1.2*C).attr("class","label").attr("transform","translate("+(M+f*o*.8)+","+N+")").attr("dx","-0.3em").text(w)},Q=function(){var a,b,d=0;if(b=-90+u/w*180,u>v&&w>u){for(O=0;O<z.length;O+=1)if(d+=z[O],d>u){a=A[O];break}b=b*Math.PI/180}else u>=w?(b=90*(Math.PI/180),a=A[A.length-1]):v>=u&&(b=-90*(Math.PI/180),a=A[0]);h.style("fill",a),h.datum(b),h.transition().duration(n).attrTween("d",c),i.data(u).transition().duration(0).text(function(a){return a.toFixed(t)})};B===!1?(B=!0,k=b.select(this).append("svg").attr("class","gauge-svg"),P(),Q()):Q()})}var e,f,g,h,i,j,k,l,m,n=10,o=.7,p="#edebeb",q="",r="",s="#b3b3b3",t=0,u=0,v=0,w=0,x=.15,y=-89.9*(Math.PI/180),z=[],A=[],B=!1,C=10,D=b.svg.arc();return k=b.select(a),d.arcThickness=function(a){return arguments.length?(o=a,d):o},d.fill=function(a){return arguments.length?(p=a,d):p},d.dane=function(a){return arguments.length?(e=a,d):e},d.units=function(a){return arguments.length?(r=a,d):r},d.labelFontColor=function(a){return arguments.length?(s=a,d):s},d.decimals=function(a){return arguments.length?(t=a,d):t},d.sectorsThicknes=function(a){return arguments.length?(x=a,d):x},d.render=function(){return d(),d},d.value=function(a){return arguments.length?(u=[a],k.datum([u]),d):u},d.minValue=function(a){return arguments.length?(v=a,d):v},d.maxValue=function(a){return arguments.length?(w=a,d):w},d.label=function(a){return arguments.length?(q=a,d):q},d.duration=function(a){return arguments.length?(n=a,d):n},d};return{init:c}});