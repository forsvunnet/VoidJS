
voidjs.audio = {
  play: function (name, version) {
    if (version === undefined) {
      version = 0;
    }
    voidjs.audio[name][version].currentTime = 0;
    voidjs.audio[name][version].play();
  },
  hurt: [
    new Audio('core/assets/hurt.wav'),
    new Audio('core/assets/small_hurt.wav')
  ],
  collect: [
    new Audio('core/assets/collect.wav')
  ]
};
