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
    var cscale = [24,26,28,29,31,33,35,36,38,40,41,43,45,47,48,50,52,53,55,57,59,60,62,64,65,67,69,71];
    var scale = cscale;

    var cchord = [24,28,31];
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
          if(!isNoteInScale) notes[i]++;
          if(notes[i] > 71) notes[i] = 24;
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
              console.log("found note match in index:" + t);
            }
            if(chords[t][m] == notes[i+1]){
              noteMatches.push(t);
              console.log("found note match in index:" + t);
            }
            if(chords[t][m] == notes[i+2]){
              noteMatches.push(t);
              console.log("found note match in index:" + t);
            }
            if(chords[t][m] == notes[i+3]){
              noteMatches.push(t);
              console.log("found note match in index:" + t);
            }
          }
        }

        //figure out which chord has the most matches
        console.log('notematches=' + noteMatches);
        var winner = 0;
        var freq = [];
        var max_value = 0;
        var winner = 0;
        for(var t = 0; t < noteMatches.length; t++){
          if(freq[noteMatches[t]] != undefined){
            freq[noteMatches[t]]++;
          }
          else {
            freq[noteMatches[t]] = 1;
          }
        }
        for(var key in freq){
          if(freq[key] >= max_value){
            max_value = freq[key];
            winner = key;
          }
        }

        chordMatches.push(Number(winner) );
        console.log('winner:' + winner); // chords[index/winner]
      }
      return chordMatches;
    }

    var convertLeadTo16ths = function(notes){
      var newLeadNotes = [];
      for(var i = 0; i < notes.length; i++){
        for(var t=0; t< 16;t++){
          newLeadNotes[i*16+t] = 0;
        }
      }
    }

    var waves = ["sin", "saw", "tri", "pulse", "fami"]
    for(var i = 0; i < waves.length; i++){
      console.log(waves[(i+0)%5]);
    }

    var text = $('#textbox').val();
    console.log(text);
    //var hash = text.hashCode();
    var hash = md5(text);
    console.log(String(hash) );
    var splitHash = hash.match(/.{1,1}/g);
    console.log(splitHash);

    var tempoVar = splitHash[0].charCodeAt(0);
    console.log(tempoVar);
    var tempo = 80 + (tempoVar%80);
    tempo *= 0.013;

    var rand = (tempoVar%100) / 100;
    console.log(tempo);

    var pitch = Math.round(rand*6)-6;
    // now 16 pairs of numbers and letters
    for(var i = 0; i < splitHash.length;i++){
      var n = splitHash[i].charCodeAt(0);
      if(n > 71) n -= 40
      splitHash[i] = n;
    }
    var generatedNotes = splitHash;
    console.log('generatedNotes=' + generatedNotes);
    var normalizedNotes = normalizeToOctave(generatedNotes);
    console.log('normalizedNotes=' + normalizedNotes);
    var scaledNotes = midinoteToScale(generatedNotes);
    console.log('scaledNotes=' + scaledNotes);
    var guessedChords = guessChords(scaledNotes);
    console.log('guessedChords=' + guessedChords);
    //var leadNoteTimings = setLeadNoteTimings(generatedNotes);

    var synthMelody = T("SynthDef").play();
    synthMelody.def = function(opts) {
      var osc1, osc2, env;
      osc1 = T(waves[(tempoVar+7)%5], {freq:opts.freq , mul:0.25*rand});
      osc2 = T(waves[(tempoVar+8)%5], {freq:opts.freq , mul:0.20});
      env  = T("linen", {s:100, r:300, lv:0.5}, osc1, osc2);
      return env.on("ended", opts.doneAction).bang();
    };

    var master = synthMelody;
    var mod    = T("sin", {freq:2, add:3200, mul:800, kr:1});
    master = T("eq", {params:{lf:[800, 0.5, -2], mf:[6400, 0.5, 4]}}, master);
    master = T("phaser", {freq:mod, Q:2, steps:4}, master);
    master = T("delay", {time:"BPM60 L16", fb:0.65, mix:0.25}, master);

    var synthLead = T("SynthDef").play();
    synthLead.def = function(opts) {
      var osc1, osc2, env;
      osc1 = T(waves[(tempoVar+0)%5], {freq:opts.freq , mul:0.25});
      osc2 = T(waves[(tempoVar+1)%5], {freq:opts.freq , mul:0.20});
      env  = T("linen", {s:250*rand, r:500*rand, lv:0.5}, osc1, osc2);
      return env.on("ended", opts.doneAction).bang();
    };

    var synthChord = T("SynthDef").play();
    synthChord.def = function(opts){
      var osc1, osc2, env, chorus;
      osc1 = T(waves[(tempoVar+2)%5], {freq:opts.freq , mul:0.25});
      osc2 = T(waves[(tempoVar+3)%5], {freq:opts.freq , mul:0.20});
      env  = T("linen", {s:1000 * Math.abs(Math.sin(tempoVar)), r:500, lv:0.5}, osc1, osc2);
      return env.on("ended", opts.doneAction).bang();
    };

    var synthBase = T("SynthDef").play();
    synthBase.def = function(opts){
      var osc1, osc2, env;
      osc1 = T(waves[(tempoVar+4)%5], {freq:opts.freq , mul:0.12});
      osc2 = T(waves[(tempoVar+5)%5], {freq:opts.freq , mul:0.20});
      env  = T("linen", {s:450, r:250, lv:0.5}, osc1);
      return env.on("ended", opts.doneAction).bang();
    };

    var intervals = [];

    var intervalMelody = T("interval", {interval:500 / tempo}, function(count) {
      var sixteen = Math.floor(count/8);
      var skip = false;
      if(scaledNotes[count%32]%2 == 0) skip = true;
      var note = scaledNotes[count%32] + 48;
      var velocity = 12;
      if(!skip) synthMelody.noteOn(note + pitch, velocity);
    }).start();
    intervals.push(intervalMelody);

    var intervalLead = T("interval", {interval:250 / tempo}, function(count) {
      var offset = tempoVar%3;
      var playAt = [1,2,3]
      var sixteen = Math.floor(count/playAt[offset]);
      var chordKey1 = chords[guessedChords[sixteen % playAt[offset]]][(count+offset)%3] + 24;
      var velocity = 6;
      if(count%playAt[offset] == 0)synthLead.noteOn(chordKey1 + pitch, velocity);
    }).start();
    intervals.push(intervalLead);

    var intervalChords = T("interval", {interval:1000 / tempo}, function(count) {
      var offset = tempoVar%3;
      var playAt = [1,2,4]
      var realCount = Math.floor(count/2);
      var play = count%playAt[offset] == 0 ? true : false;
      var chordKey1 = chords[guessedChords[realCount % 8]][0] +36;
      var chordKey2 = chords[guessedChords[realCount % 8]][1] +36;
      var chordKey3 = chords[guessedChords[realCount % 8]][2] +36;
      var velocity = 128;
      if(play) synthChord.noteOn(chordKey1 + pitch, velocity);
      if(play) synthChord.noteOn(chordKey2 + pitch, velocity);
      if(play) synthChord.noteOn(chordKey3 + pitch, velocity);
    }).start();
    intervals.push(intervalChords);

    var intervalBase = T("interval", {interval:500 / tempo}, function(count) {
      var eighth = Math.floor(count/4);
      var chordKey1 = chords[guessedChords[eighth % 8]][0] +24;
      var velocity = 127;
      synthBase.noteOn(chordKey1 + pitch, velocity);
    }).start();
    intervals.push(intervalBase);

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