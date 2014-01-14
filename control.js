// @TODO:
// Implement a key listening system.
// eg. a listening function in update should call
// if (voids.key.#.check()) {} to see if a key has been pressed

// Init function that only runs once (guaranteed);
voidjs.control.once = function() {
  var once = false;
  return function () {
    if (!once) {
      once = true;

      // Set up keyboard and mouse listeners
      document.addEventListener("keydown", voidjs.control.keydown);
      document.addEventListener("keyup", voidjs.control.keyup);
      document.addEventListener("mouseup", voidjs.control.mouseup);
      document.addEventListener("mousedown", voidjs.control.mousedown);
      document.addEventListener("mousemove", voidjs.control.mousemove);
    }
  };
}();

voidjs.control.player = {};

voidjs.control.keydown = function(e) {
  voidjs.control.toggle(e.keyCode, true);

  if (!voidjs.control.player['keyboard']) {
    cO = voidjs.entities[voidjs.entity_type_tracker.checkpoint[0]].GetPosition();
    voidjs.control.player['keyboard'] = voidjs.entityCreator.create('player', [cO.x, cO.y], 0 ,1);
  }
};
voidjs.control.keyup = function(e) {
  var key = voidjs.key;
  if (key.fire) {
    //voidjs.activate_item(voidjs.player.inventory.weapon, voidjs.player);
  }
  if(key.select) {
  }

  voidjs.control.toggle(e.keyCode, false);
};
voidjs.control.toggle = function(key, bool) {
  switch (key) {
    // Left
    case 65:
    case 37:
      voidjs.key.left = bool;
    break;
    // Right
    case 68:
    case 39:
      voidjs.key.right = bool;
    break;
    // Up
    case 87:
    case 38:
      voidjs.key.up = bool;
    break;
    // Down
    case 83:
    case 40:
      voidjs.key.down = bool;
    break;
    // Select
    case 13:
    case 93:
      voidjs.key.select = bool;
    break;
    // Fire
    case 32:
      voidjs.key.fire = bool;
    break;
  }
};
voidjs.control.mousedown = function (e) {
  var mouse = voidjs.control.mouse;
  mouse.active = true;
  voidjs.control.mousemove(e);
};
voidjs.control.mouseup = function (e) {
  var mouse = voidjs.control.mouse;
  mouse.active = false;
  voidjs.control.mousemove(e);
};


        //http://js-tut.aardon.de/js-tut/tutorial/position.html
var getElementPosition = function (element) {
  var elem=element, tagname="", x=0, y=0;

  while ((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
     y += elem.offsetTop;
     x += elem.offsetLeft;
     tagname = elem.tagName.toUpperCase();

     if(tagname == "BODY")
        elem=0;

     if(typeof(elem) == "object") {
        if(typeof(elem.offsetParent) == "object")
           elem = elem.offsetParent;
     }
  }
  return {x: x, y: y};
};
voidjs.control.mousemove = function (e) {
  var canvasPosition = getElementPosition(voidjs.canvas);
  var mouse = voidjs.control.mouse;
  mouse.x = (e.clientX - canvasPosition.x) / 30;
  mouse.y = (e.clientY - canvasPosition.y) / 30;
};

  var gamepadjs = (function() {
    var gamepad = new Gamepad();

    gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
      console.log('Connected', device);

      $('#gamepads').append('<li id="gamepad-' + device.index + '"><h1>Gamepad #' + device.index + ': &quot;' + device.id + '&quot;</h1></li>');
      
      var mainWrap = $('#gamepad-' + device.index),
        statesWrap,
        logWrap,
        control,
        value,
        i;
      
      mainWrap.append('<strong>State</strong><ul id="states-' + device.index + '"></ul>');
      mainWrap.append('<strong>Events</strong><ul id="log-' + device.index + '"></ul>');

      statesWrap = $('#states-' + device.index)
      logWrap = $('#log-' + device.index)

      for (control in device.state) {
        value = device.state[control];
        
        statesWrap.append('<li>' + control + ': <span id="state-' + device.index + '-' + control + '">' + value + '</span></li>');
      }
      for (i = 0; i < device.buttons.length; i++) {
        value = device.buttons[i];
        statesWrap.append('<li>Raw Button ' + i + ': <span id="button-' + device.index + '-' + i + '">' + value + '</span></li>');
      }
      for (i = 0; i < device.axes.length; i++) {
        value = device.axes[i];
        statesWrap.append('<li>Raw Axis ' + i + ': <span id="axis-' + device.index + '-' + i + '">' + value + '</span></li>');
      }
      
      $('#connect-notice').hide();
    });

    gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
      console.log('Disconnected', device);
      
      $('#gamepad-' + device.index).remove();
      
      if (gamepad.count() == 0) {
        $('#connect-notice').show();
      }
    });

    gamepad.bind(Gamepad.Event.TICK, function(gamepads) {
      var gamepad,
        wrap,
        control,
        value,
        i,
        j;
      
      for (i = 0; i < gamepads.length; i++) {
        gamepad = gamepads[i];
        wrap = $('#gamepad-' + i);

        if (gamepad) {
          for (control in gamepad.state) {
            value = gamepad.state[control];

            $('#state-' + gamepad.index + '-' + control + '').html(value);
          }
          for (j = 0; j < gamepad.buttons.length; j++) {
            value = gamepad.buttons[j];

            $('#button-' + gamepad.index + '-' + j + '').html(value);
          }
          for (j = 0; j < gamepad.axes.length; j++) {
            value = gamepad.axes[j];

            $('#axis-' + gamepad.index + '-' + j + '').html(value);
          }
        }
      }
    });

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
      $('#log-' + e.gamepad.index).append('<li>' + e.control + ' down</li>');
    });
    
    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
      $('#log-' + e.gamepad.index).append('<li>' + e.control + ' up</li>');
    });

    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
      $('#log-' + e.gamepad.index).append('<li>' + e.axis + ' changed to ' + e.value + '</li>');
    });

    if (!gamepad.init()) {
      alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
    }
  });