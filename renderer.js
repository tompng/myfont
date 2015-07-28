
function renderRadiusLine(g,points){
  points.forEach(function(p){
    g.beginPath();
    g.arc(p.x,p.y,p.r,0,2*Math.PI);
    g.fill();
  })
  for(var i=1;i<points.length;i++){
    var pa=points[i-1],pb=points[i];
    var dr=pb.r-pa.r,dx=pb.x-pa.x,dy=pb.y-pa.y;
    var l=Math.sqrt(dx*dx+dy*dy);
    var cos=-dr/l,sin=Math.sqrt(1-cos*cos);
    if(!isNaN(cos+sin)){
      var c1=(dx*cos-dy*sin)/l;
      var s1=(dy*cos+dx*sin)/l;
      var c2=(dx*cos+dy*sin)/l;
      var s2=(dy*cos-dx*sin)/l;
      g.beginPath();
      g.moveTo(pa.x+pa.r*c1,pa.y+pa.r*s1);
      g.lineTo(pa.x+pa.r*c2,pa.y+pa.r*s2);
      g.lineTo(pb.x+pb.r*c2,pb.y+pb.r*s2);
      g.lineTo(pb.x+pb.r*c1,pb.y+pb.r*s1);
      g.fill();
    }
  }
}
function genRadiusLine(line){
  var weight=new SmoothRandom();
  var prev,t=0;
  return line.map(function(p){
    var l=0;
    if(prev){
      var dx=p.x-prev.x,dy=p.y-prev.y;
      l=Math.sqrt(dx*dx+dy*dy);
    }
    var r=0.06*Math.exp(0.2*weight.next(l*8));
    r*=1-Math.pow(t,4)/4;
    var pnt={x:p.x,y:p.y,r:r,t:t};
    prev=pnt;
    t+=1/(line.length-1);
    return pnt;
  })
}

var renderers = {
  round: function(g,arr){
    g.beginPath();
    g.lineWidth=0.15;
    g.lineCap='round'
    g.lineJoin='round'
    Moji.toLines(arr).forEach(function(line){
      g.moveTo(line[0].x,line[0].y);
      for(var i=1;i<line.length;i++)g.lineTo(line[i].x,line[i].y);
    })
    g.stroke();
  },
  pen: function(g,arr){
    Moji.toDoubledLines(arr,2).forEach(function(line){
      var points=genRadiusLine(line);
      renderRadiusLine(g,points)
    })
  },
  lines: function(g,arr){
    for(var k=0;k<20;k++){
    Moji.toDoubledLines(arr,4).forEach(function(line){
      var xpos=new SmoothRandom();
      var ypos=new SmoothRandom();
      var weight=new SmoothRandom();
      var prev=null;
      g.beginPath();
      g.lineWidth=0.01;
      g.lineCap='round';
      g.lineJoin='round';
      g.globalAlpha=0.5;
      g.moveTo(line[0].x,line[0].y);
      for(var i=0;i<line.length;i++){
        var p=line[i];
        var l=0;
        if(prev){
          var dx=p.x-prev.x,dy=p.y-prev.y;
          l=Math.sqrt(dx*dx+dy*dy);
        }
        prev=p;
        var r=weight.next(l*4);
        var x=0.015*xpos.next(l*8);
        var y=0.015*ypos.next(l*8);
        r=0.005*Math.exp(0.2*r)
        if(i==0)g.moveTo(p.x+x,p.y+y);
        else g.lineTo(p.x+x,p.y+y);
      }
      g.stroke();
    })
    }
  },
  brush: function(g,arr){
    Moji.toDoubledLines(arr,10).forEach(function(line){
      var points=genRadiusLine(line);
      var linelength=0;
      var randalpha = 0.6+0.8*Math.random();
      var params=[];for(var i=0;i<4;i++)params[i]=new SmoothRandom();
      for(var i=1;i<line.length;i++){
        var dx=line[i].x-line[i-1].x,dy=line[i].y-line[i-1].y;
        linelength+=Math.sqrt(dx*dx+dy*dy);
      }
      for(var i=0;i<points.length;i++){
        var prev=points[i-1],p=points[i];
        var l=0;
        if(prev){
          var dx=p.x-prev.x,dy=p.y-prev.y;
          l=Math.sqrt(dx*dx+dy*dy);
        }
        for(var j=0;j<4;j++){
          var alpha=Math.exp(0.5*params[j].next(l*8))
          alpha*=1-Math.pow(p.t,4);
          g.globalAlpha=0.08*randalpha*alpha/Math.max(100*l,1)*linelength;
          var r=p.r*2.7;
          g.drawImage(renderers.brush.brushes[j],p.x-r/2,p.y-r/2,r,r);
        }
      }
    })
  },
}

renderers.brush.load=function(cb){
  renderers.brushes=[];
  var loaded=0;
  for(var i=0;i<4;i++){
    var img=new Image()
    img.src='brush/'+i+'.png';
    renderers.brush.brushes[i]=img;
    img.onload=function(){
      loaded++;
      if(loaded==4)cb();
    }
  }
}

function splitCharPos(text){
  var line=[],ix=0;
  var lines=[line]
  for(var i=0;i<text.length;i++){
    var c=text[i];
    if(c=='\n'){ix=0;lines.push(line=[]);continue;}
    var w=(c.charCodeAt(0)<128?0.5:1);
    var template = HIRAGANA_TEMPLATES[c]||HIRAGANA_TEMPLATES[HIRAGANA_ALIAS[c]];
    if(template){
      if(ix+w>10){ix=0;lines.push(line=[])};
    }else{
      if(ix+w>10){console.log(c)};
    }
    if(template)line.push({x:ix,y:lines.length-1,w:w,template:template});
    ix+=w;
  }
  return lines;
}

function renderToCanvas(width, mode, text, logo, transparent){
  var canvas = document.createElement('canvas');
  var render = renderers[mode];
  var charspos=splitCharPos(text);
  var fontSize=width/11;
  var lineHeight=fontSize*1.4;
  var marginY=fontSize*0.2;
  var marginX=0.3*fontSize;
  var lineNum=charspos.length||1;
  var height=marginY*2+lineHeight*lineNum;
  canvas.width=width;
  canvas.height=height;
  var g=canvas.getContext('2d');
  g.clearRect(0,0,width,height);
  if(!transparent){
    g.fillStyle='white';
    g.fillRect(0,0,width,height);
  }
  g.fillStyle='black';
  charspos.forEach(function(lines){
    lines.forEach(function(o){
      g.save();
      g.translate(
        marginX+(o.x+o.w/2-0.5)*fontSize,
        marginY+(o.y+0.5)*lineHeight-fontSize/2+Math.sin(o.x+o.y*o.y)*(lineHeight-fontSize)*0.2
      )
      g.scale(fontSize,fontSize);
      g.translate(-0.1,-0.1);g.scale(1.2,1.2);
      render(g,new Moji(o.template).random())
      g.restore();
    });
  });
  g.save();
  g.translate(
    width-fontSize*0.6,
    marginY+(lineNum-0.5)*lineHeight-fontSize*0.1);
  g.scale(fontSize*0.5, fontSize*0.5);
  renderLogo(g,logo,transparent);
  g.restore();
  return canvas
}

function renderLogo(g,c,transparent){
  if(!c)return;
  var template=HIRAGANA_TEMPLATES[c[0]];
  if(!template)return;
  g.fillStyle='#d10';
  var N=100;
  var rnd1=2*Math.random()-1;
  var rnd2=2*Math.random()-1;
  var pat=function(t){
    t*=2*Math.PI;
    var x=Math.cos(t),y=Math.sin(t);
    var r=1-Math.cos(4*t)/8+Math.cos(8*t)/16
    var a=Math.sqrt(2)-1/Math.max(Math.abs(x),Math.abs(y));
    r=(Math.sqrt(2)-Math.sqrt(0.01+a*a));
    r+=Math.cos(3*t)*rnd1/40+Math.sin(5*t)*rnd2/40;
    x*=r;y*=r;
    return {x:0.5+0.5*x,y:0.5+0.5*y}
  }
  g.beginPath();
  g.moveTo(pat(0).x,pat(0).y);
  for(var i=0;i<N;i++){
    var a=pat((i+1/3)/N),b=pat((i+2/3)/N),c=pat((i+1)/N);
    g.bezierCurveTo(a.x,a.y,b.x,b.y,c.x,c.y);
  }
  g.fill();
  g.fillStyle='white'
  if(transparent){
    g.globalCompositeOperation = "destination-out";
  }else{
    g.globalCompositeOperation = "source-over";
  }
  renderers.pen(g, new Moji(template).random());
}
