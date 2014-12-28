// @TODO:

// SLOT SYSTEM !!!


// Implement a key listening system.
// eg. a listening function in update should call
// if (voids.key.#.check()) {} to see if a key has been pressed

( function( c ) {
  // Init function that only runs once (guaranteed);
  c.once = function() {
    var once = false;
    return function () {
      if (!once) {
        once = true;

        // Set up keyboard and mouse listeners
        document.addEventListener("keydown", c.keydown);
        document.addEventListener("keyup", c.keyup);
        document.addEventListener("mouseup", c.mouseup);
        document.addEventListener("mousedown", c.mousedown);
        document.addEventListener("mousemove", c.mousemove);

        // Set up gamepad listeners
        c.gamepad = new Gamepad();
        c.gamepad.bind(Gamepad.Event.CONNECTED, c.gamepad_connected);
        c.gamepad.bind(Gamepad.Event.DISCONNECTED, c.gamepad_disconnected);
        c.gamepad.bind(Gamepad.Event.TICK, c.gamepad_tick);
        if ( !c.gamepad.init() ) {
          alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
        }
      }
    };
  }();

  c.controller = {};

  /**
   * Control tick, runs every game tick.
   */
  c.tick = function() {
    // Loop through all the active controllers
    for ( var x in c.controller ) {
      var control = c.controller[x];
      // Loop through all the ticks on the controller
      for ( var machine_key in control.ticks ) {
        var tick = control.ticks[machine_key];
        // Callback the tick if it's active
        if ( tick ) {
          control.trigger( machine_key, 'tick' );
        }
      }
    }
  };

  /**
   * Create a binder object.
   * This is the base of the controllers.
   */
  var create_binder = function( keymap ) {
    var callbacks = {};
    var binder;
    /**
     * Bind a key to a callback
     */
    binder.bind = function( key, bindings_or_type, callback ) {
      if ( 'string' === typeof bindings_or_type ) {
        // The function is called with a type and callback
        // Create the object if it doesn't exist
        if ( !callbacks[key] ) { callbacks[key] = {}; }
        var type = bindings_or_type;
        callbacks[key][type] = callback;
      }
      else {
        // The function is called with bindings
        var bindings = bindings_or_type;
        callbacks[key] = bindings;
      }
    };

    /**
     * Trigger a callback using a key
     */
    binder.trigger = function( machine_key, type ) {
      if ( !machine_key) {
        return;
      }
      var key = keymap[machine_key]; // = action1
      // Sanity check
      if ( callbacks[key] && callbacks[key][type] ) {
        // Exec the callback
        callbacks[key][type]();
      }
    };

    /**
     * Unbind a key from a callback
     */
    binder.unbind = function( key, type ) {
      if ( type && bound[key] ) {
        // The function is called with a type and callback
        bound[key][type] = false;
      }
      else {
        bound[key] = false;
      }
    };

    // Create a ticks object to store references to tick triggered callbacks
    binder.ticks = {};

    // Return the binder
    return binder;
  };

  /**
   * Use a binder to create a new controller
   */
  var create_controller = function() {
    var controller = create_binder( {
      'lmb': 'action1', 'space': 'action1',
      'rmb': 'action2', 'enter': 'action2',
      '1': 'action3', 'z': 'action3',
      '2': 'action4', 'x': 'action4',
      '3': 'action5', 'c': 'action5',
      'up': 'thrust-up',
      'down': 'thrust-down',
      'left': 'thrust-left',
      'right': 'thrust-right',
    } );

    controller.eid = 0;
    controller.direction = new b2Vec2(0,0);
    return controller;
  };

  // A keyboard map to map key codes to human readable keys
  var keyboard_map = {
    32: 'space',
    13: 'enter',
    93: 'enter',
  };

  // Keyboard:
  c.keydown = function(e) {
    c.toggle_key(e.keyCode, true);

    if (!c.controller.keyboard) {
      c.controller.keyboard = create_controller();
      var helper = {};
    }
    if (key.fire) {
    }
    c.controller.keyboard.trigger( keyboard_map[e.keyCode], 'keydown' );
  };
  c.keyup = function(e) {
    var key = voidjs.key;
    if (key.fire) {
    }
    if(key.select) {
    }

    c.toggle_key(e.keyCode, false);
    c.controller.keyboard.trigger( keyboard_map[e.keyCode], 'keyup' );
  };
  c.toggle_key = function(key, bool) {
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
  c.mousedown = function (e) {
    var mouse = c.mouse;
    mouse.active = true;
    c.mousemove(e);
  };
  c.mouseup = function (e) {
    var mouse = c.mouse;
    mouse.active = false;
    c.mousemove(e);
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
    return { x: x, y: y };
  };
  c.mousemove = function (e) {
    var canvasPosition = getElementPosition(voidjs.canvas);
    var mouse = c.mouse;
    mouse.x = (e.clientX - canvasPosition.x) / 30;
    mouse.y = (e.clientY - canvasPosition.y) / 30;
  };

  // Gamepad
  c.gamepad_connected = function(device) {
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    if (!c.controller[device.index]) {
      c.controller[device.index] = create_controller();
    }
  };
  c.gamepad_disconnected = function(device) {};
  c.gamepad_tick = function( gamepads ) {
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var gamepad, controller, i;
    for (i = 0; i < gamepads.length; i++) {
      gamepad = gamepads[i];
      if (gamepad) {
        controller = c.controller[gamepad.index];
        if (controller) {
          controller.direction.x = gamepad.state.RIGHT_STICK_X;
          controller.direction.y = gamepad.state.RIGHT_STICK_Y;
        }
      }
    }
  };

  c.action_map = {
    'action1': trigger_equip(),
  };
} ( voidjs.control ) );
