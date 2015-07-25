function Moji(template){
  this.template = template;
  var at=Math.random();
  var bt=Math.random();
  var ai=[0,1],bi=[0,1];
  function randi(except){
    if(except!==undefined){
      var i=Math.floor((template.length-1)*Math.random());
      return i==except ? template.length-1 : i;
    }
    return Math.floor(template.length*Math.random());
  }
  ai[0]=randi();ai[1]=randi(ai[0]);
  bi[0]=randi();bi[1]=randi(bi[0]);
  this.update=function(dt){
    if(!dt)dt=0.1;
    at+=0.8*dt;
    bt+=1.1*dt
    while(at>1){
      at-=1;
      ai=[ai[1],randi(ai[1])]
    }
    while(bt>1){
      bt-=1;
      bi=[bi[1],randi(bi[1])];
    }
  }
  this.random=function(){
    var i,j,k;
    i=Math.floor(Math.random()*template.length);
    j=Math.floor(Math.random()*template.length);
    k=Math.floor(Math.random()*template.length);
    var ai=Math.random(),aj=Math.random(),ak=Math.random();
    var ti=template[i],tj=template[j],tk=template[k];
    var sum=ai+aj+ak;
    var out=[];
    for(var i=0;i<ti.length;i++){
      if(!ti[i])continue;
      out[i]={
        x:(ai*ti[i].x+aj*tj[i].x+ak*tk[i].x)/sum,
        y:(ai*ti[i].y+aj*tj[i].y+ak*tk[i].y)/sum
      }
    }
    return out;
  }
  this.line=function(){
    if(template.length<2)return template[0]||[];
    var out=[];
    var a0=template[ai[0]],a1=template[ai[1]];
    var b0=template[bi[0]],b1=template[bi[1]];
    for(var i=0;i<a0.length;i++){
      if(!a0[i])continue;
      out[i]={
        x:(a0[i].x*(1-at)+at*a1[i].x+b0[i].x*(1-bt)+bt*b1[i].x)/2,
        y:(a0[i].y*(1-at)+at*a1[i].y+b0[i].y*(1-bt)+bt*b1[i].y)/2
      }
    }
    return out;
  }
}
Moji.bezierParameters=function(points){
  var params = [];
  for(var i=0;i<points.length;i++)params[i]={x:points[i].x,y:points[i].y,dx:0,dy:0};
  for(var n=0;n<4;n++){
    for(var i=0;i<params.length;i++){
      var ia=(i-1+params.length)%params.length;
      var ib=(i+1)%params.length;
      var k=4;
      if(i==0){ia=i;k=2;}
      if(i==params.length-1){ib=i;k=2;}
      var cx=3*(params[ib].x-params[ia].x);
      var cy=3*(params[ib].y-points[ia].y);
      var pa=params[ia];
      var pb=params[ib];
      params[i].dx=(cx-pa.dx-pb.dx)/k;
      params[i].dy=(cy-pa.dy-pb.dy)/k;
    }
  }
  return params;
}
Moji.doublePoints=function(points,n){
  var params = Moji.bezierParameters(points);
  function mix(a,b,t){return {x:a.x*(1-t)+t*b.x,y:a.y*(1-t)+t*b.y}}
  var out=[params[0]];
  for(var i=1;i<params.length;i++){
    var pa=params[i-1],pb=params[i];
    for(var j=1;j<=n;j++){
      var t=j/n;
      var a=pa,b={x:pa.x+pa.dx/3,y:pa.y+pa.dy/3},c={x:pb.x-pb.dx/3,y:pb.y-pb.dy/3},d=pb;
      var ab=mix(a,b,t),bc=mix(b,c,t),cd=mix(c,d,t);
      var abc=mix(ab,bc,t),bcd=mix(bc,cd,t);
      out.push(mix(abc,bcd,t));
    }
  }
  return out;
}
Moji.toLines=function(moji){
  var line=[]
  var lines=[line];
  for(var i=0;i<moji.length;i++){
    if(moji[i])line.push(moji[i]);
    else lines.push(line=[]);
  }
  return lines;
}
Moji.toBezierLines=function(moji){
  return Moji.toLines(moji).map(Moji.bezierParameters)
}
Moji.toDoubledLines=function(moji, n){
  return Moji.toLines(moji).map(function(line){return Moji.doublePoints(line,n)})
}
var HIRAGANAS={};
var HIRAGANA_ALIAS={};
(function(){
  var data = 
  'あ3い2う2え2お3'+
  'か3き4く1け3こ2'+
  'さ3し1す2せ3そ1'+
  'た4ち2つ1て1と2'+
  'な4に3ぬ2ね2の1'+
  'は3ひ1ふ4へ1ほ4'+
  'ま3み2む3め2も3'+
  'や3ゆ2よ2'+
  'ら2り2る1れ2ろ1'+
  'わ2を3ん1'+
  'が5ぎ6ぐ3げ5ご4'+
  'ざ5じ3ず4ぜ5ぞ3'+
  'だ6ぢ4づ3で3ど4'+
  'ば5び3ぶ6べ3ぼ6'+
  'ぱ4ぴ2ぷ5ぺ2ぽ5'+
  'ぁ3ぃ2ぅ2ぇ2ぉ3'+
  'ゃ3ゅ2ょ2っ1'+
  'ア2イ2ウ3エ3オ3'+
  'カ2キ3ク2ケ3コ2'+
  'サ3シ3ス2セ2ソ2'+
  'タ3チ3ツ3テ3ト2'+
  'ナ2ニ2ヌ2ネ4ノ1'+
  'ハ2ヒ2フ1ヘ1ホ4'+
  'マ2ミ3ム2メ2モ3'+
  'ヤ2ユ2ヨ3'+
  'ラ2リ2ル2レ1ロ3'+
  'ワ2ヲ2ン2'+
  'ガ4ギ5グ4ゲ5ゴ4'+
  'ザ5ジ5ズ4ゼ4ゾ4'+
  'ダ5ヂ5ヅ5デ5ド4'+
  'バ4ビ4ブ3ベ3ボ6'+
  'パ3ピ3プ2ペ2ポ5'+
  'ァ2ィ2ゥ3ェ3ォ3'+
  'ャ2ュ2ョ3ッ3'+
  'ー1〜1'+
  '01112131425261718191'+
  'a1b1c1d1e1f2g1h1i2j2k2l1m1n1o1p1q1r1s1t2u1v1w1x2y2z1'+
  'A2B2C1D2E4F3G2H3I3J1K3L1M1N1O1P2Q2R3S1T2U1V1W1X2Y2Z1'+
  '~1!2@2#4$2%3^1&1*3(1)1_1+2-1=2`1[1]1\\1{1}1|1:2"2;2\'1<1>1?2,1.1/1'+
  '。1、1「1」1÷3×2☆1♡2♪3'
  for(var i=0;i<data.length;i+=2){
    HIRAGANAS[data[i]]=parseInt(data[i+1]);
  }
  var alias={
    '０１２３４５６７８９':'0123456789',
    '｀！＠＃＄％＾＆＊（）＿＋ー＝':'`!@#$%^&*()_+-=',
    '｜＼：；”’＜＞／？':'|\\:;"\'<>/?'
  }
  for(var key in alias){
    for(var i=0;i<key.length;i++){
      HIRAGANA_ALIAS[key[i]]=alias[key][i];
    }
  }
}())
