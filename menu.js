voidjs.menu = {};
voidjs.menu.show = function(part){
  var elements = [];
  switch (part) {
    case 'LevelComplete':
      console.log('Congratulations');
      elements.push({
        title: 'play',
        action: function() {
          chapter = voidjs.chapter;
          chapter = chapter<2 ? chapter+1 : 0;
          voidjs.goto('game', chapter);
          clearInterval(update);
        }
      });
      break;
    case 'Pause':
      elements.push('resume');
      break;
    case 'Other':
    break;

    default:
      elements.push({
        title: 'play',
        action: function(){
          voidjs.goto('game');
        }
      });
      elements.push({
        title: 'play',
        action: function(){
          voidjs.goto('game', 1);
        }
      });
      elements.push({
        title: 'yalp',
        action: function(){
          voidjs.goto('game');
        }
      });
      //console.log('Menu called');
      break;
  }
  // Display some shizzle
  // OK - WTF is the point of a menu anyway?
  // Give the player pause, indicate that the game is ready to be played?
  // Some false sense of control?
  // WHY IS THE MENU NECESARRY?
  // #1 : Level selection
  // #2 : Sound options
  // #3 : Control options
  // #4 : Progression status
  // #5 : Game settings
  //voidjs.goto('game');
  // host the function inside to get access to elements
  var ctx = voidjs.canvas.getContext('2d');
  voidjs.ctx = ctx;
  var selector = 0;
  var update, lock = false;
  var interpret = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var y = 1;
    for (var i in elements) {
      var element = elements[i];
      if (i == selector) {
        element.style = 'white';
        element.selected = true;
        if (voidjs.key.fire || voidjs.key.select) {
          window.clearInterval(update);
          element.action();
        }
      } else {
        element.style = 'red';
        element.selected = false;
      }
      if (!lock) {
        if (voidjs.key.down) {
          selector = selector+1 >= elements.length ? 0 : selector+1;
          lock = true;
        } else if (voidjs.key.up) {
          selector = selector-1 < 0 ? elements.length-1 : selector-1;
          lock = true;
        }
      } else if (!voidjs.key.down && !voidjs.key.up) {
        lock = false;
      }
      element.draw = voidjs.stencil.drawString;
      var box = element.draw(y);
      y += 1.5;
    }
  };
  update = window.setInterval(interpret, voidjs.fps);
};