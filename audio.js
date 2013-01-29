
voidjs.audio = {
  play: function (name, version) {
    if (version === undefined) {
      version = 0;
    }
    voidjs.audio[name][version].currentTime = 0;
    voidjs.audio[name][version].play();
  },
  hurt: [
    new Audio('audio/hurt.wav'),
    new Audio('audio/small_hurt.wav')
  ],
  collect: [
    new Audio('audio/collect.wav')
  ]
};