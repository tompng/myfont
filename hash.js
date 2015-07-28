function getLocationHashObject(){
  var out={};
  location.hash.substr(1).split('&').forEach(function(kvstr){
    kv=kvstr.split('=');
    if(kv.length!=2)return;
    out[decodeURIComponent(kv[0])]=decodeURIComponent(kv[1]);
  })
  return out;
}
function setLocationHashObject(obj){
  location.hash=Object.keys(obj).map(function(key){
    return encodeURIComponent(key)+'='+encodeURIComponent(''+obj[key])
  }).join('&')
}
