var notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b', 'c2'];
var keybinds = ['s', 'e', 'd', 'r', 'f', 'g', 'y', 'h', 'u', 'j', 'i', 'k', 'l'];
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia  = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;
var context = new AudioContext();
var microphone;
var recorder;
var localStream;
var recordings = [];
var pitches = {
  'c': 523.51,
  'c#': 554.365,
  'd': 587.330,
  'd#': 622.254,
  'e': 659.255,
  'f': 698.456,
  'f#': 739.989,
  'g': 783.991,
  'g#': 830.609,
  'a': 880.000,
  'a#': 932.328,
  'b': 987.767,
  'c2': 1046.50
}

$(function() {
  notes.forEach(function(note, index) {
    var $key = $('<button class="key" data-bind=' + keybinds[index] + ' data-note=' + note + '></button>');
    $key.click(function() {
      var cents = notes.indexOf($key.attr('data-note')) * 100;
      var sampleRate = 44100 * Math.pow(2, cents / 1200);
      play(recordings[0], sampleRate);
    });
    $('.keyboard').append($key);
  });
});

$(document).on('keydown', function(e) {
  e.preventDefault();
  var value = String.fromCharCode(e.keyCode).toLowerCase();
  var key = $('button[data-bind="' + value + '"]');
  key.click();
});

$('.record').on('click', function() {
  $(this).toggleClass('active');
  if ($(this).hasClass('active')) {
    getAudio();
  } else {
    stopAudio();
  }
});

function getAudio() {
  navigator.getUserMedia({audio: true}, function(stream) {
    localStream = stream;
    microphone = context.createMediaStreamSource(stream);
    recorder = new Recorder(microphone, {
      workerPath: 'js/vendor/recorderWorker.js'
    });
    recorder.record();
  }, errorCallback);
}

function stopAudio() {
  recorder.stop();
  recorder.getBuffer(function(buffer) {
    recordings.push(buffer);
  });
  recorder.clear();
  localStream.stop();
  console.log(recordings);
}

function errorCallback(err) {
  console.log(err);
}

function play(buffers, sampleRate) {
  var newSource = context.createBufferSource();
  var newBuffer = context.createBuffer(2, buffers[0].length, sampleRate);
  newBuffer.getChannelData(0).set(buffers[0]);
  newBuffer.getChannelData(1).set(buffers[1]);
  newSource.buffer = newBuffer;
  newSource.connect(context.destination);
  newSource.start(0);
}
