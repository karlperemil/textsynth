String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

$(document).ready(function(){
  console.log("yo");
  $('#submit-text').click(function(){
    var text = $('#textbox').val();
    console.log(text);
    //var hash = text.hashCode();
    var hash = md5(text);
    console.log(String(hash) );
    var splitHash = hash.match(/.{1,1}/g);
    console.log(splitHash);
    // now 16 pairs of numbers and letters
    for(var i = 0; i < splitHash.length;i++){
      splitHash[i] = splitHash[i].charCodeAt(0);
    }
    console.log(splitHash);
    /*
    var synth = T("SynthDef").play();

    synth.def = function(opts) {
      var osc1, osc2, env;
      osc1 = T("saw", {freq:opts.freq         , mul:0.25});
      osc2 = T("saw", {freq:opts.freq * 1.6818, mul:0.20});
      env  = T("linen", {s:450, r:250, lv:0.5}, osc1, osc2);
      return env.on("ended", opts.doneAction).bang();
    };

    T("interval", {interval:500}, function(count) {
      var noteNum  = splitHash[count % 16];
      var velocity = 64 + (count % 64);
      synth.noteOn(noteNum, velocity);
    }).start();
*/
  });
})