// Void JavaScript engine

// @TODO:
// Try to focus on essential functions.
// Especially important are features that allow for
// writing game rules and altering game mechanics.
//
// 0.  0% - Entity Editor
//        * An interactive NodeJS / PHP editor capable of parsing and
//          editing entity objects and scripts of different types.
//
// 0. 01% - nodejs
//        * RPC
//        * Active entity positions (Non-sleeping)
//        * Bullets
//
// 1. 90% - Level rendering / selection
//        * JSON format works well. Refractor to draw in layers.
//        * Level format should allow entities to referrence other enitities.
//          (Maybe some sort of replaceable ID. ie level format use one ID system, game another)
//
// 2. 95% - Camera to follow player
//        * Smoothing required. Non-essential
//
// 3. 100% - Zones
//        * Custom scriptable zone
//
// 4. 40% - Collectibles
//        * Let modules control size/shape + scripts
//
// - - -  - Note on Entities
//        * All entities should be extensible through modules.
//        * Map what differs between the entities and go from there.
//          I believe entities are fundementally different in nature and
//          should hence be kept as such, but I could be wrong.
//        * Correlation between level description and modules are quite essential.
//          Should levels include information about their module dependency?
//
// 5. 20% - Sounds
//        * Might have to be refractored. Lacks consistency.
//
// 6. 01% - Particles
//        * box2d = entity. Ignore everything but walls? - non-essential.
//        * [Redundant:] Non box2d = non entity. Requires own "physics"
//          (We use box2d because of the AABB selection for rendering & other consistency issues)
//

(function() {
  var i, hooks = {}, filters = {};
  vcore.hook = function(hook, callback) {
    if (undefined === hooks[hook]) {
      hooks[hook] = [callback];
    }
    else {
      hooks[hook].push(callback);
    }
  };
  vcore.invoke = function (hook) {
    var args = arguments;
    if (undefined !== hooks[hook]) {
      var callbacks = hooks[hook];
      callbacks.sort();
      for (i =0; i < callbacks.length; i++) {
        callbacks[i](args);
      }
    }
  };


  vcore.add_filter = function(filter, callback) {
    if (undefined === filters[filter]) {
      filters[filter] = [callback];
    }
    else {
      filters[filter].push(callback);
    }
  };
  vcore.filter = function (filter, value) {
    var args = arguments;
    if (undefined !== filters[filter]) {
      var callbacks = filters[filter];
      callbacks.sort();
      for (i =0; i < callbacks.length; i++) {
        value = callbacks[i](value, args);
      }
    }
    return value;
  };
  vcore.spawner = function( entity_type ) {
    return function() {
      var args = arguments;
      console.log( 'Spawning '+ entity_type +' at x: , y:' );
    };
  };
})();

var voidjs = {
  key : {
    left:   false,
    right:  false,
    up:     false,
    down:   false
  },
  entity_index : function() {
    var index = 391;
    return function () {
      index++;
      return index;
    };
  }(),
  player: [],
  stencil: {},
  fps: 1000/30,
  destroy_entities: [],
  entities: {},
  active_entities: {},
  entity_type_tracker: {},
  descriptions: {},
  scripts: {},
  modules: {},
  item: {},
  // Prefabs are open by design. they are meant to be edited and modified by users
  // Want to make walls bouncy and deadly? Do it in prefabs..
  prefabs: {},
  world: undefined,
  control: { mouse: { active:false } },
  // Init the interface
  init: function() {
    // Init only happens once, the other functions can happen many times
    // Register all even listeners here
    voidjs.control.once();

    var scenes = {
      game: this.game,
      menu: this.menu.show
    };
    // Call a scene function / go to a scene
    this.goto = function(scene, part) {
      // Scene is the menu point
      // Part allows us to pass a parameter to the menu point
      // ie. game could be the menu point and then the part could be the level
      scenes[scene](part);
    };
    // Open her up, start at the menu
    $.getJSON('levels/levels.json', function(data) {
      voidjs.levels = data.levels;
      voidjs.goto('menu');
    });
  },

  // Start the game at the given chapter (level id)
  game: function(chapter) {
    chapter = chapter || 0;
    voidjs.chapter = chapter;
    // Play loading screen

    // @TODO: Make loading screen

    // load the level and pass it to the init function
    $.getJSON('levels/' + voidjs.levels[chapter].file, voidjs.init_game);
  },

  // Initialise the game world
  init_game: function(level) {
    // Reset controllers
    var i;
    for (i in voidjs.controllers) {
      voidjs.controllers[i].eid = 0;
    }

    // Set up variables
    var chapter = voidjs.chapter || 0;
    voidjs.player.length = 0;
    var b2Vec2            = Box2D.Common.Math.b2Vec2,
        b2AABB            = Box2D.Collision.b2AABB,
        b2BodyDef         = Box2D.Dynamics.b2BodyDef,
        b2Body            = Box2D.Dynamics.b2Body,
        b2FixtureDef      = Box2D.Dynamics.b2FixtureDef,
        b2Fixture         = Box2D.Dynamics.b2Fixture,
        b2World           = Box2D.Dynamics.b2World,
        b2ContactListener = Box2D.Dynamics.b2ContactListener,
        b2MassData        = Box2D.Collision.Shapes.b2MassData,
        b2PolygonShape    = Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape     = Box2D.Collision.Shapes.b2CircleShape
      ;
    // Set the basics of the world
    var gravity = new b2Vec2(0, 0);
    var world = new b2World(gravity, true);
    voidjs.world = world;

    // Add a helper function to remove bodies regardless of the game state
    world.RemoveBody = function (body) {
      // Helper function to Destroy bodies irrelevant to context.
      // If the world is locked then send the body to the que for
      // bodies to be destroyed.
      if (body.id) {
        delete voidjs.entities[body.id];
        delete voidjs.active_entities[body.id];
      }
      if (!world.IsLocked()) {
        // Destroy the body
        world.DestroyBody(body);
      } else {
        voidjs.destroy_entities.push(body);
      }
    };

    // Clear the entities
    var entities = {};
    voidjs.entities = entities;

    // Clear the active entities
    var active_entities = {};
    // The active entities are normal entities that run a script every frame
    voidjs.active_entities = active_entities;

    // Empty the tracker
    voidjs.entity_type_tracker = {};

    // Setup the contact handler
    world.SetContactListener(voidjs.listener);

    // Fire up the entity creator
    voidjs.entityCreator.init();
    // Build the level
    voidjs.entityCreator.buildLevel(level);
    // Add spawners
    voidjs.entityCreator.create_spawners();

    //voidjs.entityCreator.create('player', [level.checkpoint[0][0], level.checkpoint[0][1]], 0 ,0);
    //voidjs.entityCreator.create('player', [level.checkpoint[0][0], level.checkpoint[0][1]], 0 ,0);

    // Start the game
    voidjs.ticker = window.setInterval(voidjs.update, voidjs.fps);
  },
};

vcore.pos_canvas = function(canvas, w, h, x, y) {
  canvas.width = w;
  canvas.style.left = x;
  canvas.height = h;
  canvas.style.top = y;

  return (w > h) ? h * 45 / w : 45;
};
voidjs.fullscreen = function() {
  var camera;
  var wiw = window.innerWidth;
  var wih = window.innerHeight;

  // 1 Player
  if (voidjs.player.length == 1) {
    // Player 1
    camera = voidjs.player[0].camera;
    camera.scale = vcore.pos_canvas(voidjs.player[0].canvas, wiw, wih, 0, 0);
  }

  // 2 Player
  if (voidjs.player.length == 2) {
    // Player 1
    camera = voidjs.player[0].camera;
    if (voidjs.split_screen_horizontal) {
      camera.scale = vcore.pos_canvas(voidjs.player[0].canvas, wiw / 2, wih, 0, 0);
    }
    else {
      camera.scale = vcore.pos_canvas(voidjs.player[0].canvas, wiw , wih / 2, 0, 0);
    }
    // Player 2
    camera = voidjs.player[1].camera;
    if (voidjs.split_screen_horizontal) {
      camera.scale = vcore.pos_canvas(voidjs.player[1].canvas, wiw / 2, wih, wiw / 2, 0);
    }
    else {
      camera.scale = vcore.pos_canvas(voidjs.player[1].canvas, wiw, wih / 2, 0, wih / 2);
    }
  }
};
window.addEventListener('resize', voidjs.fullscreen, false);
voidjs.fullscreen();
