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

var drums = T("audio").loadthis("/snd/drumkit.wav", function() {
  console.log('drums loaded');
});

var intervals = [];

$(document).ready(function(){
  console.log("yo");
  $('#submit-text').click(function(){
    stopSounds();
    createSong(false);
  });
  $('#submit-random').click(function(){
    stopSounds();
    createSong(true);
  });

    $('#stop').click(function(){
    stopSounds();
  })

});

var stopSounds = function(){
  if(intervals == undefined) return;
  for(var i = 0; i < intervals.length; i++){
    intervals[i].stop();
  }
}

var createSong = function(random){
  var cscale = [24,26,28,29,31,33,35,36,38,40,41,43,45,47,48,50,52,53,55,57,59,60,62,64,65,67,69,71];
  var scale = cscale;

  var cchord = [24,28,31];
  var dchord = [26,29,33];
  var echord = [28,31,35];
  var fchord = [29,33,24];
  var gchord = [31,35,26];
  var achord = [33,24,26];
  var chords = [cchord,dchord,echord,fchord,fchord,gchord,achord];

  var dictionary = []
  //[key] = [where,repeat]
  dictionary['b'] = [0,1]
  dictionary['c'] = [1,1]
  dictionary['d'] = [2,1]
  dictionary['f'] = [3,1]
  dictionary['g'] = [4,1]
  dictionary['h'] = [5,1]
  dictionary['j'] = [6,1]
  dictionary['k'] = [7,1]
  dictionary['l'] = [8,1]
  dictionary['m'] = [9,1]
  dictionary['n'] = [10,1]
  dictionary['p'] = [11,1]
  dictionary['q'] = [12,1]
  dictionary['r'] = [13,1]
  dictionary['t'] = [14,1]
  dictionary['v'] = [15,1]
  dictionary['w'] = [0,2]
  dictionary['z'] = [1,2]
  dictionary['x'] = [2,2]
  dictionary['!'] = [3,2]
  dictionary['.'] = [4,2]
  dictionary['?'] = [5,2]
  dictionary[','] = [6,2]

  var randomWords = ['Some','Aids','Ebola','Nyan','Medium','Cats','Dogs','Argentina','Tokyo','Reddit','Pregnant','Something','Bounce','Trap','Hiphop','Magnate','Dinner','4chan','Tennesse','Juggernaut'];

  function midinotesToScale(notes){
    for(var i = 0; i < notes.length; i++){
      var isNoteInScale = false;
      while(!isNoteInScale){
        for(var t = 0; t < scale.length; t++){
          if(notes[i] == scale[t]) isNoteInScale = true;
        }
        if(notes[i] > 71){
          notes[i] -= 12;
        }
        else if(!isNoteInScale){
          notes[i]++;
        }
      }
    }

    return notes;
  };

  function midinoteToScale(note){
    var isNoteInScale = false;
    while(!isNoteInScale){
      for(var t = 0; t < scale.length; t++){
        if(note == scale[t]) isNoteInScale = true;
      }
      if(note > 47){
        note -= 12;
      }
      else if(!isNoteInScale){
        note++;
      }
    }
    return note;
  }



  function normalizeToOctave(notes){
    for(var t = 0; t < notes.length; t++){
      for(var i = 0; i < notes[t].length; i++){
        var newNote = notes[t][i];
        while(newNote[0] > 35){
          newNote[0] -= 12;
        }
        notes[t][i] = newNote;
      }
    }
    return notes;
  }

  var guessChords = function(melody){
    var chordMatches = [];
    //match every 4 notes towards a chord. if a match is found the index of that chord is added to noteMatches
    for(var i = 0; i < melody.length; i++){
      var noteMatches = [];
      for(var y = 0; y < melody[i].length; y++){
        for(var t = 0; t < chords.length; t++){
          for(var m = 0; m < chords[t].length; m++){
            if(chords[t][m] == melody[i][y][0]){
              noteMatches.push(t);
              console.log("found note match in index:" + t);
            }
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
        if(freq[noteMatches[t]] == undefined){
          freq[noteMatches[t]] = 1;
        }
        else {
          freq[noteMatches[t]]++;
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

  var sineNotes = function(notes){
    for(var i = 0; i < notes.length; i++){
      console.log(Math.round(Math.sin(i*0.1) * 12));
      notes[i] += Math.round(Math.sin(i*0.1) * 12);
    }
    return notes;
  }

  var generateMelody = function(words){
    var melody = [];
    for(var i = 0; i < words.length; i++){
      melody[i] = [];
      for(var t = 0; t < words[i].length; t++){
        var currentCharacter = words[i].charCodeAt(t);
        var note = midinoteToScale(currentCharacter);
        melody[i].push(midinoteToScale(currentCharacter));
      }
    }
    console.log(melody);

    //evenly distribute notes along the bar
    var melodyWithTempo = [];
    for(var i = 0; i < melody.length; i++){
      melodyWithTempo[i] = [];
      for(var t = 0; t < melody[i].length; t++){
        var position = ((t*4)%16) + (2*Math.floor(t/4));
        melodyWithTempo[i].push([melody[i][t],position]);
      }
    }
    return melodyWithTempo;
  }

  function getAverageWordLength(words){
    var len = 0;
    for(var i = 0; i < words.length; i++){
      len += words[i].length;
    }
    return len/words.length;
  }

  var waves = ["sin", "tri", "pulse", "fami","saw"]
  var inputText = $('#textbox').val().toLowerCase();
  if(random){
    var randString = "";
    randString += randomWords[Math.round( (randomWords.length-1) * Math.random() )];
    randString += " " + randomWords[Math.round( (randomWords.length-1) * Math.random() )];
    randString += " " + randomWords[Math.round( (randomWords.length-1) * Math.random() )];
    randString += " " + randomWords[Math.round( (randomWords.length-1) * Math.random() )];
    $('#textbox').val(randString);
    inputText = randString;
  }
  var text = inputText;
  console.log(text);
  var words = text.split(/[ ]+/);
  console.log(words);
  var numBars = words.length;
  var avgWordLength = getAverageWordLength(words);
  console.log('Average word length=' + avgWordLength);
  //var hash = text.hashCode();
  var hash = md5(text);
  console.log(String(hash) );
  var splitHash = hash.match(/.{1,1}/g);
  console.log(splitHash);

  var tempoVar = text.length;
  console.log(tempoVar);
  var tempo = 80 + (1-(avgWordLength/10)) * 80;
  console.log('Tempo:' + tempo);
  tempo *= 0.013;

  var rand = (tempoVar%100) / 100;
  console.log(tempo);

  var pitch = Math.round(rand*11);
  // now 16 pairs of numbers and letters
  for(var i = 0; i < splitHash.length;i++){
    var n = splitHash[i].charCodeAt(0);
    if(n > 71) n -= 40
    splitHash[i] = n;
  }

  var baseLines = [
    [0,4,8,12],
    [0,2,4,6,8,10,12,14],
    [0,8],
    [0],
    [0,2,8,10]
  ]

  var generatedNotes = splitHash;
  console.log('generatedNotes=' + generatedNotes);

  var sinedNotes = sineNotes(generatedNotes);
  console.log('sinedNotes=' + sinedNotes);

  var wordMelody = generateMelody(words);
  console.log('wordMelody=' , wordMelody);

  var normalizedNotes = normalizeToOctave(wordMelody);
  console.log('normalizedNotes=', normalizedNotes);

  var guessedChords = guessChords(normalizedNotes);
  console.log('guessedChords=' , guessedChords);

  //var leadNoteTimings = setLeadNoteTimings(generatedNotes);

  var synthMelody = T("SynthDef").play();
  synthMelody.def = function(opts) {
    console.log('play melody synth');
    var osc1, osc2, env;
    osc1 = T(waves[(tempoVar+7)%5], {freq:opts.freq , mul:0.25*rand});
    osc2 = T(waves[(tempoVar+8)%5], {freq:opts.freq , mul:0.20});
    env  = T("linen", {s:100, r:300, lv:0.5}, osc1, osc2);
    return env.on("ended", opts.doneAction).bang();
  };

  var synthLead = T("SynthDef").play();
  synthLead.def = function(opts) {
    var osc1, osc2, env;
    var vel = opts.velocity/128
    osc1 = T(waves[(tempoVar+0)%5], {freq:opts.freq , mul:0.25});
    osc2 = T(waves[(tempoVar+1)%5], {freq:opts.freq , mul:0.20});
    env  = T("linen", {s:250*rand, r:500*rand, lv:0.5 * vel}, osc1, osc2);
    return env.on("ended", opts.doneAction).bang();
  };

  var synthChord = T("SynthDef").play();
  synthChord.def = function(opts){
    var vel = opts.velocity/128;
    var osc1, osc2, env, chorus;
    osc1 = T(waves[(tempoVar+2)%5], {freq:opts.freq , mul:0.25*vel});
    osc2 = T(waves[(tempoVar+3)%5], {freq:opts.freq , mul:0.20*vel});
    env  = T("linen", {s:400 * Math.abs(Math.sin(tempoVar)), r:200, lv:0.5}, osc1, osc2);
    return env.on("ended", opts.doneAction).bang();
  };

  var synthBase = T("SynthDef").play();
  synthBase.def = function(opts){
    var osc1, osc2, env;
    osc1 = T(waves[(tempoVar+4)%5], {freq:opts.freq , mul:rand});
    osc2 = T(waves[(tempoVar+5)%5], {freq:opts.freq , mul:0.20});
    env  = T("linen", {s:100, r:100, lv:0.5}, osc1);
    return env.on("ended", opts.doneAction).bang();
  };
  var synths = [synthMelody,synthLead,synthChord,synthBase];

  var BD  = drums.slice(   0,  500).set({bang:false, mul:0.6});
  var SD  = drums.slice( 500, 1000).set({bang:false, mul:0.8});
  var HH1 = drums.slice(1000, 1500).set({bang:false, mul:0.2});
  var HH2 = drums.slice(1500, 2000).set({bang:false, mul:0.2});
  var CYM = drums.slice(2000).set({bang:false, mul:0.2});

  var drumNotes1 = [
    [BD, HH1],
    [HH2],
    [BD,HH1],
    [HH2],
    [SD, HH1],
    [HH2],
    [HH1],
    [HH2],
    [HH1],
    [HH2],
    [BD,HH1],
    [HH2],
    [SD, HH1],
    [HH2],
    [HH1],
    [HH2]
  ];

  var drum = T("lowshelf", {freq:110, gain:8, mul:0.6}, BD, SD, HH1, HH2, CYM).play();


  intervals = [];
  var bar = 0;
  intervalAll = T('interval', {interval: 125 / tempo}, function(count){
    bar = Math.floor(count/16)%wordMelody.length;
    totalBars = Math.floor(count/16);
    var sixteen = count%16;
    var eigth = Math.floor(count/2);
    var fourth = Math.floor(count/4);
    var half = Math.floor(count/8);
    var whole = Math.floor(count/16);
    var barMelody = wordMelody[bar];

    //melody
    var i;
    for(i = 0; i < barMelody.length; i++){
      if(barMelody[i][1] == sixteen){
        synthMelody.noteOn(barMelody[i][0] + 36 + pitch, 64);
      }
    }

    //chords
    var barChord = guessedChords[bar];
    if(count%8 == 0 && totalBars > 3){
      synthChord.noteOn(chords[barChord][0]+ 36 + pitch, 32);
      synthChord.noteOn(chords[barChord][1]+ 36 + pitch, 32);
      synthChord.noteOn(chords[barChord][2]+ 36 + pitch, 32);
    }

    //arpeggio
    if(count%2 == 0 && totalBars > 7){
      synthLead.noteOn(chords[barChord][count%3]+ 36  + pitch, 64);
    }

    //Bass
    if(totalBars > 7){
      for(var i = 0; i < baseLines[tempoVar%baseLines.length].length; i++){
        if(baseLines[tempoVar%baseLines.length][i] == count%16){
          synthBase.noteOn(chords[barChord][0] + 24  + pitch, 64);
        }
      }
    }
    //drums
    if(count%2 == 0 && totalBars > 7){
      var i = eigth % drumNotes1.length;
      drumNotes1[i].forEach(function(p) {
        p.bang(); 
      });
    }
  }).start();
  intervals.push(intervalAll);




  /*
  var intervalMelody = T("interval", {interval:500 / tempo}, function(count) {
    var sixteen = Math.floor(count/8);
    var skip = false;
    if(scaledNotes[count%32]%2 == 0) skip = true;
    var note = scaledNotes[count%32] + 24 + (tempoVar%2) * 24;
    var velocity = 64;
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
    var chordKey1 = chords[guessedChords[realCount % 8]][0] +24 + ((tempoVar+1)%2) * 24;
    var chordKey2 = chords[guessedChords[realCount % 8]][1] +24 + ((tempoVar+1)%2) * 24;
    var chordKey3 = chords[guessedChords[realCount % 8]][2] +24 + ((tempoVar+1)%2) * 24;
    var velocity = 124 * rand;
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
  intervals.push(intervalBase);*/
};


$(document).keydown(function(e){
  console.log(String.fromCharCode(e.keyCode) + ":" + e.keyCode);
});