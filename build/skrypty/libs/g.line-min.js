/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
!function(){function a(a,b){for(var c=a.length/b,d=0,e=c,f=0,g=[];d<a.length;)e--,0>e?(f+=a[d]*(1+e),g.push(f/c),f=a[d++]*-e,e+=c):f+=1*a[d++];return g}function b(b,c,d,e,f,g,h,i){function j(a){for(var i=[],j=0,k=g.length;k>j;j++)i=i.concat(g[j]);i.sort(function(a,b){return a-b});for(var l=[],m=[],j=0,k=i.length;k>j;j++)i[j]!=i[j-1]&&l.push(i[j])&&m.push(c+p+(i[j]-A)*C);for(var i=l,k=i.length,n=a||b.set(),j=0;k>j;j++){var o,l=m[j]-(m[j]-(m[j-1]||c))/2,q=((m[j+1]||c+e)-m[j])/2+(m[j]-(m[j-1]||c))/2;a?o={}:n.push(o=b.rect(l-1,d,Math.max(q+1,1),f).attr({stroke:"none",fill:"#000",opacity:0})),o.values=[],o.symbols=b.set(),o.y=[],o.x=m[j],o.axis=i[j];for(var q=0,r=h.length;r>q;q++)for(var l=g[q]||g[0],s=0,u=l.length;u>s;s++)l[s]==i[j]&&(o.values.push(h[q][s]),o.y.push(d+f-p-(h[q][s]-B)*D),o.symbols.push(v.symbols[q][s]));a&&a.call(o)}!a&&(t=n)}function k(a){for(var e,i=a||b.set(),j=0,k=h.length;k>j;j++)for(var l=0,m=h[j].length;m>l;l++){var n=c+p+((g[j]||g[0])[l]-A)*C,o=c+p+((g[j]||g[0])[l?l-1:1]-A)*C,q=d+f-p-(h[j][l]-B)*D;a?e={}:i.push(e=b.circle(n,q,Math.abs(o-n)/2).attr({stroke:"#000",fill:"#000",opacity:1})),e.x=n,e.y=q,e.value=h[j][l],e.line=v.lines[j],e.shade=v.shades[j],e.symbol=v.symbols[j][l],e.symbols=v.symbols[j],e.axis=(g[j]||g[0])[l],a&&a.call(e)}!a&&(u=i)}var l,m,n,o;i=i||{},b.raphael.is(g[0],"array")||(g=[g]),b.raphael.is(h[0],"array")||(h=[h]);for(var p=i.gutter||10,q=Math.max(g[0].length,h[0].length),r=i.symbol||"",s=i.colors||this.colors,t=null,u=null,v=b.set(),w=[],x=0,y=h.length;y>x;x++)q=Math.max(q,h[x].length);for(var z=b.set(),x=0,y=h.length;y>x;x++)i.shade&&z.push(b.path().attr({stroke:"none",fill:s[x],opacity:i.nostroke?1:.3})),h[x].length>e-2*p&&(h[x]=a(h[x],e-2*p),q=e-2*p),g[x]&&g[x].length>e-2*p&&(g[x]=a(g[x],e-2*p));var w=Array.prototype.concat.apply([],g),q=Array.prototype.concat.apply([],h),w=this.snapEnds(Math.min.apply(Math,w),Math.max.apply(Math,w),g[0].length-1),A=w.from,w=w.to,q=this.snapEnds(Math.min.apply(Math,q),Math.max.apply(Math,q),h[0].length-1),B=q.from,x=q.to,C=(e-2*p)/(w-A||1),D=(f-2*p)/(x-B||1),q=b.set();i.axis&&(y=(i.axis+"").split(/[,\s]+/),+y[0]&&q.push(this.axis(c+p,d+p,e-2*p,A,w,i.axisxstep||Math.floor((e-2*p)/20),2,b)),+y[1]&&q.push(this.axis(c+e-p,d+f-p,f-2*p,B,x,i.axisystep||Math.floor((f-2*p)/20),3,b)),+y[2]&&q.push(this.axis(c+p,d+f-p,e-2*p,A,w,i.axisxstep||Math.floor((e-2*p)/20),0,b)),+y[3]&&q.push(this.axis(c+p,d+f-p,f-2*p,B,x,i.axisystep||Math.floor((f-2*p)/20),1,b)));for(var E,F=b.set(),G=b.set(),x=0,y=h.length;y>x;x++){i.nostroke||F.push(E=b.path().attr({stroke:s[x],"stroke-width":i.width||2,"stroke-linejoin":"round","stroke-linecap":"round","stroke-dasharray":i.dash||""}));for(var H=Raphael.is(r,"array")?r[x]:r,I=b.set(),w=[],J=0,K=h[x].length;K>J;J++){var L=c+p+((g[x]||g[0])[J]-A)*C,M=d+f-p-(h[x][J]-B)*D;if((Raphael.is(H,"array")?H[J]:H)&&I.push(b[Raphael.is(H,"array")?H[J]:H](L,M,3*(i.width||2)).attr({fill:s[x],stroke:"none"})),i.smooth){if(J&&J!=K-1){m=c+p+((g[x]||g[0])[J-1]-A)*C;var N=d+f-p-(h[x][J-1]-B)*D;n=L,o=M;var O=c+p+((g[x]||g[0])[J+1]-A)*C,P=d+f-p-(h[x][J+1]-B)*D,Q=(n-m)/2;l=(O-n)/2,m=Math.atan((n-m)/Math.abs(o-N)),O=Math.atan((O-n)/Math.abs(o-P)),m=o>N?Math.PI-m:m,O=o>P?Math.PI-O:O,P=Math.PI/2-(m+O)%(2*Math.PI)/2,N=Q*Math.sin(P+m),m=Q*Math.cos(P+m),Q=l*Math.sin(P+O),O=l*Math.cos(P+O),l=n-N,m=o+m,n+=Q,o+=O,w=w.concat([l,m,L,M,n,o])}J||(w=["M",L,M,"C",L,M])}else w=w.concat([J?"L":"M",L,M])}i.smooth&&(w=w.concat([L,M,L,M])),G.push(I),i.shade&&z[x].attr({path:w.concat(["L",L,d+f-p,"L",c+p+((g[x]||g[0])[0]-A)*C,d+f-p,"z"]).join(",")}),!i.nostroke&&E.attr({path:w.join(",")})}return v.push(F,z,G,q,t,u),v.lines=F,v.shades=z,v.symbols=G,v.axis=q,v.hoverColumn=function(a,b){return!t&&j(),t.mouseover(a).mouseout(b),this},v.clickColumn=function(a){return!t&&j(),t.click(a),this},v.hrefColumn=function(a){var c=b.raphael.is(arguments[0],"array")?arguments[0]:arguments;if(!(arguments.length-1)&&"object"==typeof a)for(var d in a)for(var e=0,f=t.length;f>e;e++)t[e].axis==d&&t[e].attr("href",a[d]);for(!t&&j(),e=0,f=c.length;f>e;e++)t[e]&&t[e].attr("href",c[e]);return this},v.hover=function(a,b){return!u&&k(),u.mouseover(a).mouseout(b),this},v.click=function(a){return!u&&k(),u.click(a),this},v.each=function(a){return k(a),this},v.eachColumn=function(a){return j(a),this},v}var c=function(){};c.prototype=Raphael.g,b.prototype=new c,Raphael.fn.linechart=function(a,c,d,e,f,g,h){return new b(this,a,c,d,e,f,g,h)}}();