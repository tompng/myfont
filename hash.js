function encodeMBURI(text){
  var out='';
  for(var i=0;i<text.length;i++){
    var c=text[i];
    if(c.charCodeAt(0)<=32||c=='%'||c=='&'||c=='='){
      out+=encodeURIComponent(c);
    }else{
      out+=c;
    }
  }
  return out;
}

function decodeMBURI(text){
  var i=0;var out='';
  while(i<text.length){
    if(text[i]!='%'){
      out+=text[i];
      i++;
    }else{
      var encoded='';
      var item;
      while((item=text.substr(i,3)).match(/%[0-9a-fA-F]{2}/)){encoded+=item;i+=3;}
      if(encoded){
        out+=decodeURIComponent(encoded);
      }else{
        out+='%';
        i++;
      }
    }
  }
  return out;
}

function getLocationHashObject(){
  var out={};
  location.hash.substr(1).split('&').forEach(function(kvstr){
    kv=kvstr.split('=');
    if(kv.length!=2)return;
    out[decodeMBURI(kv[0])]=decodeMBURI(kv[1]);
  })
  return out;
}
function setLocationHashObject(obj){
  location.hash=Object.keys(obj).map(function(key){
    return encodeMBURI(key)+'='+encodeMBURI(''+obj[key])
  }).join('&')
}
