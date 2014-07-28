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

      // Set up gamepad listeners
      voidjs.control.gamepad = new Gamepad();
      voidjs.control.gamepad.bind(Gamepad.Event.CONNECTED, voidjs.control.gamepad_connected);
      voidjs.control.gamepad.bind(Gamepad.Event.DISCONNECTED, voidjs.control.gamepad_disconnected);
      voidjs.control.gamepad.bind(Gamepad.Event.TICK, voidjs.control.gamepad_tick);
      if (!voidjs.control.gamepad.init()) {
        alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
      }
    }
  };
}();

voidjs.control.player = {};

// Keyboard:

voidjs.control.keydown = function(e) {
  voidjs.control.toggle(e.keyCode, true);

  if (!voidjs.control.player.keyboard) {
    voidjs.control.player.keyboard = {
      eid: 0
    };
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
  var k, old_keys = {};
  for (k in voidjs.key) {
    old_keys[k] = voidjs.key[k];
  }
  // if(key)console.log(key);
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
    // Pause {ESC}
    case 27:
      voidjs.key.pause = bool;
    break;
  }
  // Check for changed keys
  for (k in voidjs.key) {
    if (old_keys[k] !== voidjs.key[k] && voidjs.key[k]) {
      vcore.invoke('player_action', 'keyboard', k);
    }
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

// Gamepad
voidjs.control.gamepad_connected = function(device) {
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  if (!voidjs.control.player[device.index]) {
    voidjs.control.player[device.index] = {
      eid: 0,
      direction: new b2Vec2(0,0)
    };
  }
};
voidjs.control.gamepad_disconnected = function(device) {};
voidjs.control.gamepad_tick = function(gamepads) {
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var gamepad, player, i;
  for (i = 0; i < gamepads.length; i++) {
    gamepad = gamepads[i];
    if (gamepad) {
      player = voidjs.control.player[gamepad.index];
      if (player) {
        player.direction.x = gamepad.state.RIGHT_STICK_X;
        player.direction.y = gamepad.state.RIGHT_STICK_Y;
      }
    }
  }
};
