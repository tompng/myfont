function gaussRandom(){
  var r=Math.sqrt(-2*Math.log(Math.random()));
  var t=2*Math.PI*Math.random();
  return r*Math.sin(t);
}

//smoothed with exp(kx)-2exp(2kx)+exp(3kx), k=1/tscale, variance=1
function SmoothRandom(tscale){
  this.tscale=tscale||1;
  this.a1=0;
  this.a2=0;
  this.a3=0;
  this.scale=Math.sqrt(30);
  this.next(Infinity);
}
SmoothRandom.covariantRandom3D=function(aa,bb,cc,ab,bc,ca){
  var c0=Math.sqrt((aa*bc*bc+bb*ca*ca-2*ab*ca*bc)/(aa*bb-ab*ab));
  var c2=Math.sqrt(cc-c0*c0);
  var b0=bc/c0;
  var a0=ca/c0;
  var a1=Math.sqrt(aa-a0*a0);
  var b1=(ab-a0*b0)/a1;
  var r0=gaussRandom(),r1=gaussRandom(),r2=gaussRandom();
  return {x:a0*r0+a1*r1,y:b0*r0+b1*r1,z:c0*r0+c2*r2};
}
SmoothRandom.prototype.next=function(dt){
  if(!dt||dt<=0)dt=1;
  var pn=Math.exp(-dt/this.tscale);
  var s2=(1-pn*pn)/2;
  var s3=(1-pn*pn*pn)/3;
  var s4=(1-pn*pn*pn*pn)/4;
  var s5=(1-pn*pn*pn*pn*pn)/5;
  var s6=(1-pn*pn*pn*pn*pn*pn)/6;
  var rand=SmoothRandom.covariantRandom3D(s2,s4,s6,s3,s5,s4);
  if(isNaN(rand.x+rand.y+rand.z)){
    var rnd=gaussRandom();
    rand={x:Math.sqrt(s2)*rnd,y:Math.sqrt(s4)*rnd,z:Math.sqrt(s6)*rnd};
  }
  this.a1=this.a1*pn+rand.x;
  this.a2=this.a2*pn*pn+rand.y;
  this.a3=this.a3*pn*pn*pn+rand.z;
  return this.scale*(this.a1+this.a3-2*this.a2);
}

//smoothed with (exp(kx)-2exp(2kx)+exp(3kx))*cos(wx), w=2pi*freq, k=w/strength, variance=1
function FreqRandom(freq, strength){
  this.freq=freq||1;
  this.strength=strength||2;
  this.r1=this.i1=0;
  this.r2=this.i2=0;
  this.r3=this.i3=0;
  this.scale=Math.sqrt(30);
  this.next(Infinity);
}
FreqRandom.prototype.next=function(dt){
  if(!dt||dt<=0)dt=1;
  var w=2*Math.PI*this.freq;
  var cos=Math.cos(w*dt);
  var sin=Math.sin(w*dt);
  if(dt==Infinity){cos=sin=0;}
  var pn=Math.exp(-w*dt/this.strength);
  var s2=(1-pn*pn)/2;
  var s3=(1-pn*pn*pn)/3;
  var s4=(1-pn*pn*pn*pn)/4;
  var s5=(1-pn*pn*pn*pn*pn)/5;
  var s6=(1-pn*pn*pn*pn*pn*pn)/6;

  var randr=SmoothRandom.covariantRandom3D(s2,s4,s6,s3,s5,s4);
  var randi=SmoothRandom.covariantRandom3D(s2,s4,s6,s3,s5,s4);
  if(isNaN(randr.x+randr.y+randr.z+randi.x+randi.y+randi.z)){
    var rnd1=gaussRandom(),rnd2=gaussRandom();
    randr={x:Math.sqrt(s2)*rnd1,y:Math.sqrt(s4)*rnd1,z:Math.sqrt(s6)*rnd1};
    randi={x:Math.sqrt(s2)*rnd2,y:Math.sqrt(s4)*rnd2,z:Math.sqrt(s6)*rnd2};
  }
  this.r1=pn*(this.r1*cos-this.i1*sin)+randr.x;
  this.i1=pn*(this.r1*sin+this.i1*cos)+randi.x;
  this.r2=pn*pn*(this.r2*cos-this.i2*sin)+randr.y;
  this.i2=pn*pn*(this.r2*sin+this.i2*cos)+randi.y;
  this.r3=pn*pn*pn*(this.r3*cos-this.i3*sin)+randr.z;
  this.i3=pn*pn*pn*(this.r3*sin+this.i3*cos)+randi.z;
  return this.scale*(this.r1+this.r3-2*this.r2);
}

//smoothed with exp(kx), k=1/tscale, variance=1
function NoiseRandom1(tscale){
  this.tscale=tscale||1;
  this.a=0;
  this.next(Infinity);
  this.scale=Math.sqrt(2);
}
NoiseRandom1.prototype.next=function(dt){
  if(!dt||dt<=0)dt=1;
  var pn=Math.exp(-dt/this.tscale);
  var s2=(1-pn*pn)/2;
  var r=gaussRandom();
  var x=Math.sqrt(s2);
  this.a=this.a*pn+r*x;
  return this.scale*this.a;
}

//smoothed with exp(kx)-exp(2kx), k=1/tscale, variance=1
function NoiseRandom2(tscale){
  this.tscale=tscale||1;
  this.a1=0;
  this.a2=0;
  this.scale=Math.sqrt(12);
  this.next(Infinity);
}
NoiseRandom2.prototype.next=function(dt){
  if(!dt||dt<=0)dt=1;
  var pn=Math.exp(-dt/this.tscale);
  var s2=(1-pn*pn)/2;
  var s3=(1-pn*pn*pn)/3;
  var s4=(1-pn*pn*pn*pn)/4;
  var r0=gaussRandom(),r1=gaussRandom();
  var x0=Math.sqrt(s2);
  var y0=s3/Math.sqrt(s2);
  var y1=Math.sqrt((s4*s2-s3*s3)/s2);
  if(isNaN(y0)||isNaN(y1)){y0=x0;y1=0;}
  this.a1=this.a1*pn+x0*r0;
  this.a2=this.a2*pn*pn+y0*r0+y1*r1;
  return this.scale*(this.a1-this.a2);
}