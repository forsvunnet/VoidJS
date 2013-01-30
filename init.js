function lerp(s,e,t) {
  if (t === undefined) {
    t = 0.2;
  }
  return (s+t*(e-s));
}
var millis = function () {
  return new Date().getTime();
};
// @TODO:
// Try to focus on essential functions.
// Especially important are features that allow for
// writing game rules and altering game mechanics.
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
// 3. 80% - Zones
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
// 4. 20% - Sounds
//        * Might have to be refractored. Lacks consistency.
//
// 5. 01% - Particles
//        * box2d = entity. Ignore everything but walls? - non-essential.
//        * Non box2d = non entity. Requires own "physics"
//
var voidjs = {
  canvas : document.getElementById('canvas'),
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
  stencil : {},
  fps: 1000/60,
  active_entities : {},
  destroy_entities: [],
  //@TODO : turn entities into an array so we can remove all reference to its object easily
  entities  : {},
  scripts   : {},
  world     : undefined,
  control   : {mouse: {active:false}},
  init:function() {
    // Init only happens once, the other functions can happen many times
    // Register all even listeners here
    document.addEventListener("keydown", voidjs.control.keydown);
    document.addEventListener("keyup", voidjs.control.keyup);
    document.addEventListener("mouseup", voidjs.control.mouseup);
    document.addEventListener("mousedown", voidjs.control.mousedown);
    document.addEventListener("mousemove", voidjs.control.mousemove);
    
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
    this.goto('menu');
  },
  game:function(chapter) {
    chapter = chapter || 0;
    voidjs.chapter = chapter;
    // Set up variables
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
    var gravity = new b2Vec2(0, 0);
    var world = new b2World(gravity, true);
    voidjs.world = world;
    world.RemoveBody = function (body) {
      // Helper function to Destroy bodies irrelevant to context.
      // If the world is locked then send the body to the que for
      // bodies to be destroyed.
      if (!world.IsLocked()) {
        // Destroy the body
        world.DestroyBody(body);
      } else {
        voidjs.destroy_entities.push(body);
      }
    };
    var entities = {};
    voidjs.entities = entities;
    var active_entities = {};
    voidjs.active_entities = active_entities;

    // Fixture
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    fixDef.shape = new b2PolygonShape();

    // Rigidbodies
    var bodyDef = new b2BodyDef();
    bodyDef.linearDamping = 2;
    bodyDef.angularDamping = 2;

    // Build level
    console.log(chapter);
    var level = voidjs.levels[chapter];
    var entity, i;


    // Make some zones
    fixDef.shape.SetAsBox(1, 1);
    fixDef.isSensor = true;
    bodyDef.type = b2Body.b2_staticBody;
    // Loop through zones from the level description
    for (i in level.zones) {
      var zone = level.zones[i];
      // Implement a swtich here for type?
      fixDef.shape.SetAsBox(zone.w || 1, zone.h || 1);
      bodyDef.position.Set(zone.x, zone.y);//);
      bodyDef.angle = zone.a || 0;
      entity = buildEntity();

      // Attach any relevant scripts to the zones
      switch (zone.type) {
        case 'checkpoint':
          entity.scripts.register(voidjs.scripts.checkpoint);
          break;
        case 'end':
          entity.scripts.register(voidjs.scripts.finish);
          break;
        default:
          // Nothing
          break;
      }
      entity.style.stroke = 0;
      entity.style.fill = '#444';
      entities[entity.id] = entity;
    }
    // Add collectibles to the level
    var bleh = function(){voidjs.audio.play('collect');};
    for (i in level.collectibles) {
      var collectible = level.collectibles[i];
      fixDef.shape.SetAsBox(collectible.w || 0.1, collectible.h || 0.1);
      bodyDef.position.Set(collectible.x, collectible.y);//);
      bodyDef.angle = collectible.a || 0;
      entity = buildEntity();
      entity.style.fill = '#F09';
      entity.scripts.register(voidjs.scripts.collectible);
      entity.scripts.register(bleh);
      // Attach any relevant scripts to the collectibles
      // Collectible depend on modules
      // Simple shard:
      // - Style
      // - Size
      // - Script
      // - - Active
      // - - Passive
      switch (collectible.type) {
        case 'x1':

          break;
        case 'x2':

          break;
        default:
          // Nothing
          break;
      }
      entities[entity.id] = entity;
    }

    // Create some objects
    var start = level.zones[0];
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape.SetAsBox(0.2, 0.2);
    fixDef.isSensor = false;
    bodyDef.position = new b2Vec2(start.x,start.y);
    
    var ship = buildEntity();
    ship.style.fill = '#fff';
    ship.style.stroke = false;
    voidjs.player = ship;
    entities[ship.id] = ship;
    active_entities.player = ship;
    ship.checkpoint = false;
    ship.isPlayer = true;
    ship.kill = function(){
      ship.SetActive(false);
      ship.scripts.register(voidjs.scripts.spawner());
    };

    // Make walls
    bodyDef.type = b2Body.b2_staticBody;
    for (i in level.walls) {
      var wall = level.walls[i];
      // Implement a swtich here for type?
      fixDef.shape.SetAsBox(wall.w, wall.h);
      bodyDef.position.Set(wall.x, wall.y);//);
      bodyDef.angle = wall.a || 0;
      entity = buildEntity();
      entity.style.fill = '#222';
      entity.style.stroke = '#444';
      entities[entity.id] = entity;
    }

    world.SetContactListener(voidjs.listener);
    
    voidjs.ticker = window.setInterval(voidjs.update, voidjs.fps);

    // Helpers
    function buildEntity () {
      var entity = world.CreateBody(bodyDef);
      entity.id = millis() + '_' + voidjs.entity_index();
      entity.CreateFixture(fixDef);
      entity.vertices = [];
      for (var i in fixDef.shape.m_vertices) {
        entity.vertices.push( new b2Vec2(
          fixDef.shape.m_vertices[i].x,
          fixDef.shape.m_vertices[i].y
        ));
      }
      entity.draw = voidjs.stencil.drawBox;
      entity.style = {stroke:'rgb('+rCol(200)+','+(0)+','+rCol(0)+')'};
      entity.scripts = function() {
        // This is a nifty way of letting entities carry their own scripts
        // instead of defining a new script for every event
        // (I'll probably do that anyway, but this is a clean way of doing things)
        var data = [];
        return {
          // Call everything and pass along arguments
          call: function () {
            for (var i = 0; i < data.length; i++) {
              data[i](arguments);
            }
          },
          // Register a new script
          register: function (func) {
            data.push(func);
            return data.length;
          },
          // Same as get las registered script
          // (Useful for self-destructing scripts)
          getLength: function () {
            return data.length;
          },
          // Clear all scripts
          clear: function () {
            data = [];
          },
          run: function (i) {
            return data[i]();
          },
          remove: function(i) {
            console.log(i);
            data.splice(i,1);
          }
        };
      }();
      return entity;
    }
    function rCol (off) {
      off = off?off:0;
      return Math.round(Math.random()*(255-off)+off).toString();
    }
  },
  helpers : {
        //http://js-tut.aardon.de/js-tut/tutorial/position.html
    getElementPosition: function (element) {
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
    }
  }
};