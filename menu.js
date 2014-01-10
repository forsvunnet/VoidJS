voidjs.menu = {};



(function(menu) {
  var m = {};
  // Small helper jquery function
  $.fn.m_click = function(action) {
    $(this).click(function() {
        for (var x in m) {
          m[x].hide();
        }
        action();
      });
    return this;
  };
  // Build menues
  // @TODO: Factorise menu out of core

  var next_level = function() {
    chapter = voidjs.chapter;
    chapter = chapter+1<voidjs.levels.length ? chapter+1 : 0;
    voidjs.goto('game', chapter);
  }
  m.complete = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(next_level)
        .text('Next level')
    )
  );
  m.main = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(next_level)
        .text('Play')
    )
  );
  m.pause = $('<div>').hide().append(
    $('<ul>').append(
      $('<li>')
        .m_click(next_level)
        .text('Continue')
    )
  );

  for (var x in m) {
    $('#menu').append(m[x]);
  }




  menu.show = function(part) {
    var elements = [];
    switch (part) {
      case 'LevelComplete':
        m.complete.show();
        break;
      case 'Pause':
        m.main.show();
        break;
      case 'Other':
      break;

      default:
        m.main.show();
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
    // #5 : Game settings??
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
})(voidjs.menu);