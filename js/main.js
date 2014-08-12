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
    var cscale = [24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71];
    var scale = cscale;

    var cchord = [24,28,30];
    var dchord = [26,29,33];
    var echord = [28,31,35];
    var fchord = [29,33,24];
    var gchord = [31,35,26];
    var achord = [33,24,26];
    var chords = [cchord,dchord,echord,fchord,fchord,gchord,achord];
    var midinoteToScale = function(notes){
      for(var i = 0; i < notes.length; i++){
        var isNoteInScale = false;
        while(!isNoteInScale){
          for(var t = 0; t < scale.length; t++){
            if(notes[i] == scale[t]) isNoteInScale = true;
          }
          notes[i]++;
          if(notes[i] > 71) notes[i] = 24;
          console.log(scale[t]+ " != " + notes[i]);
        }
      }

      return notes;
    };

    var normalizeToOctave = function(notes){
      for(var i = 0; i < notes.length; i++){
        var newNote = notes[i];
        while(newNote > 35){
          newNote -= 12;
        }
        notes[i] = newNote;
      }
      return notes;
    }

    var guessChords = function(notes){
      var chordMatches = [];
      var noteMatches = [];
      //match every 4 notes towards a chord. if a match is found the index of that chord is added to noteMatches
      for(var i = 0; i < notes.length; i+=4){
        var noteMatches = [];
        for(var t = 0; t < chords.length; t++){
          for(var m = 0; m < chords[t].length; m++){
            if(chords[t][m] == notes[i]){
              noteMatches.push(t);
            }
          }
        }

        //figure out which chord has the most matches
        var winner = 0;
        var score = [0,0,0,0];
        for(var t = 0; t < noteMatches.length; t++){
          for(var m = 0; m < noteMatches.length; m++){
            if(t !== m){
              if(noteMatches[t] == noteMatches[m]){
                score[t]++;
              }
            }
          }
        }
        for(var t = 0; t < score.length; t++){
          if(score[t] > winner) winner = score[t];
        }
        chordMatches.push(winner); // chords[index/winner]
      }
      return chordMatches;
    }

    var text = $('#textbox').val();
    console.log(text);
    //var hash = text.hashCode();
    var hash = md5(text);
    console.log(String(hash) );
    var splitHash = hash.match(/.{1,1}/g);
    console.log(splitHash);
    // now 16 pairs of numbers and letters
    for(var i = 0; i < splitHash.length;i++){
      var n = splitHash[i].charCodeAt(0);
      if(n > 71) n -= 40
      splitHash[i] = n;
    }
    var generatedNotes = splitHash;
    console.log(generatedNotes);
    var normalizedNotes = normalizeToOctave(generatedNotes);
    var scaledNotes = midinoteToScale(splitHash);
    var guessedChords = guessChords(scaledNotes);
    console.log(scaledNotes);
    console.log(guessedChords);

    var synth = T("SynthDef").play();
    synth.def = function(opts) {
      var osc1, osc2, env;
      osc1 = T("saw", {freq:opts.freq         , mul:0.25});
      osc2 = T("saw", {freq:opts.freq , mul:0.20});
      env  = T("linen", {s:450, r:250, lv:0.5}, osc1, osc2);
      return env.on("ended", opts.doneAction).bang();
    };

    var synth2 = T("SynthDef").play();
    synth2.def = function(opts){
      var osc1, osc2, env;
      osc1 = T("sin", {freq:opts.freq         , mul:0.25});
      osc2 = T("sin", {freq:opts.freq , mul:0.20});
      env  = T("linen", {s:450, r:250, lv:0.5}, osc1, osc2);
      return env.on("ended", opts.doneAction).bang();
    };

    var intervals = [];
    var interval1 = T("interval", {interval:500}, function(count) {
      var noteNum  = scaledNotes[count % 32] + 24;
      var velocity = 64 + (count % 64);
      synth.noteOn(noteNum, velocity);
    }).start();
    intervals.push(interval1);
    
    var interval2 = T("interval", {interval:2000}, function(count) {
      var chordKey1 = guessedChords[count % 8][0] +12;
      var chordKey2 = guessedChords[count % 8][1] +12;
      var chordKey3 = guessedChords[count % 8][2] +12;
      var velocity = 64 + (count % 64);
      synth2.noteOn(chordKey1, velocity);
      synth2.noteOn(chordKey2, velocity);
      synth2.noteOn(chordKey3, velocity);
    }).start();
    intervals.push(interval2);

    $('#stop').click(function(){
      stopSounds();
    })

    var stopSounds = function(){
      for(var i = 0; i < intervals.length; i++){
        intervals[i].stop();
      }
    }

  });
});

$(document).keydown(function(e){
  console.log(String.fromCharCode(e.keyCode) + ":" + e.keyCode);
});