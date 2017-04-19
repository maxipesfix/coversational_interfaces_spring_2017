/* verbal part */
var state = "initial"
var slowBreathInc = 0.1
var fastBreathInc = 0.6
var slowTimeBetweenBlinks = 4000
var fastTimeBetweenBlinks = 500

/* This is to preload voice otherwise default is played first time */
var u = new SpeechSynthesisUtterance();
u.text = "";
u.lang = 'en-US';
u.volume = 0.5 //between 0.1
u.pitch = 2.0 //between 0 and 2
u.rate = 1.0 //between 0.1 and 5-ish
u.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == "Karen"; })[0];
speechSynthesis.speak(u);

function startDictation() {

  console.log("startDictation...")

  if (window.hasOwnProperty('webkitSpeechRecognition')) {

    console.log("Got webkitSpeechRecognition")
    var recognition = new webkitSpeechRecognition();

    /*
    navigator.webkitGetUserMedia({
      audio: true,
    }, function(stream) {
      stream.getTracks().forEach(function (track) { track.stop(); });
      console.log("Have media permission")
    // Now you know that you have audio permission. Do whatever you want...
    }, function() {
      console.log("Have no media permission")
    // Aw. No permission (or no microphone available).
    });
    */
    /* Nonverbal actions at the start of listening */
    setTimeBetweenBlinks(fastTimeBetweenBlinks);
    setBreathInc(slowBreathInc);

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.lang = "en-US";
    recognition.start();

    console.log("Started recognition..")

    recognition.onresult = function(e) {
      document.getElementById('transcript').value
                               = e.results[0][0].transcript;
      var user_said = e.results[0][0].transcript;
      recognition.stop();

      /* Nonverbal actions at the end of listening */
      setTimeBetweenBlinks(slowTimeBetweenBlinks);
      jump(); //perform a nonverbal action from nonverbal.js

      console.log("User said: " + user_said)

      var bot_response = decide_response(user_said)
      speak(bot_response)

      //`document.getElementById('labnol').submit();
    };

    recognition.onerror = function(e) {
      recognition.stop();
      console.log("Recognition error:" + e.error)
    }

  } else {
    console.log("Got no webkitSpeechRecognition")
  }
}

/* decide what to say.
 * input: transcription of what user said
 * output: what bot should say
 */
function decide_response(user_said) {
  var response;
  var light_re = /lights?\s(\w+)/i;  // creating a regular expression
  var light_parse_array = user_said.match(light_re) // parsing the input string with the regular expression
  
  console.log(light_parse_array) // let's print the array content to the console log so we understand 
                                // what's inside the array.

  if (light_parse_array) {
    if (light_parse_array[1] === "on") { 
      response = "ok, turning lights on";
      ledOn() 
    } else { 
      response = "ok, turning lights off";
      ledOff() 
    }
  } else if (user_said.toLowerCase().includes("hello")) {
    response = "hello to you!";
    state = "initial"
  } else if (user_said.toLowerCase().includes("bye")) {
    response = "good bye to you!";
  } else if (state === "play_song") {
    response = "ok, playing " + user_said;
  } else {
    response = "i don't get it";
  }
  return response;
}

/* 
 *speak out some text 
 */
function speak(text, callback) {
  
  /* set voice */
  u.lang = 'en-US';
  u.volume = 0.5 //between 0.1
  u.pitch = 2.0 //between 0 and 2
  u.rate = 1.0 //between 0.1 and 5-ish
  u.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == "Karen"; })[0];
  u.text = text;

  /* Nonverbal actions at the start of robot's speaking */
  setBreathInc(fastBreathInc); 

  u.onend = function () {
      
      /* Nonverbal actions at the end of robot's speaking */
      setBreathInc(slowBreathInc); 

      if (callback) {
          callback();
      }
  };

  u.onerror = function (e) {
      if (callback) {
          callback(e);
      }
  };

  speechSynthesis.speak(u);
}
