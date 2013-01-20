function lerp(s,e,t) {
  if (t === undefined) {
    t = 0.2;
  }
  return (s+t*(e-s));
}
// @TODO:
// 0. 5% - nodejs
// 1. 80% - Level rendering / selection
// 2. 80% - Camera to follow player
// 3. Collectibles
var voidjs = {
  canvas : document.getElementById('canvas'),
  key : {
    left:   false,
    right:  false,
    up:     false,
    down:   false
  },
  stencil : {},
  fps: 1000/60,
  active_entities : {},
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
      // @TODO: Not working :(
      world.DestroyBody(body);
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
    var level = voidjs.levels[chapter];
    var entity;
    // Make walls
    entities.walls = [];
    bodyDef.type = b2Body.b2_staticBody;
    for (var i in level.walls) {
      var wall = level.walls[i];
      // Implement a swtich here for type?
      fixDef.shape.SetAsBox(wall.w, wall.h);
      bodyDef.position.Set(wall.x, wall.y);//);
      bodyDef.angle = wall.a || 0;
      entities.walls.push(buildEntity());
    }

    // Create some objects
    var start = level.zones[0];
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape.SetAsBox(0.2, 0.2);
    bodyDef.position = new b2Vec2(start.x,start.y);
    
    var ship = buildEntity();
    entities.player = ship;
    active_entities.player = ship;
    ship.checkpoint = false;
    ship.isPlayer = true;
    ship.kill = function(){
      ship.SetActive(false);
      ship.scripts.register(voidjs.scripts.spawner());
    };

    // Make some zones
    entities.zones = [];
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
      entities.zones.push(entity);
    }
    // Add collectibles to the level
    for (i in level.collectibles) {
      var collectible = level.collectibles[i];
      fixDef.shape.SetAsBox(collectible.w || 0.1, collectible.h || 0.1);
      bodyDef.position.Set(collectible.x, collectible.y);//);
      bodyDef.angle = collectible.a || 0;
      entity = buildEntity();

      entity.scripts.register(voidjs.scripts.collectible);
      // Attach any relevant scripts to the collectibles
      switch (collectible.type) {
        case 'checkpoint':
          //entity.scripts.register(voidjs.scripts.checkpoint);
          break;
        case 'end':
          //entity.scripts.register(voidjs.scripts.finish);
          break;
        default:
          // Nothing
          break;
      }
      entities.zones.push(entity);
    }

    world.SetContactListener(voidjs.listener);
    
    voidjs.ticker = window.setInterval(voidjs.update, voidjs.fps);

    // Helpers

    function buildEntity () {
      var entity = world.CreateBody(bodyDef);
      entity.CreateFixture(fixDef);
      entity.vertices = [];
      for (var i in fixDef.shape.m_vertices) {
        entity.vertices.push( new b2Vec2(
          fixDef.shape.m_vertices[i].x,
          fixDef.shape.m_vertices[i].y
        ));
      }
      entity.draw = voidjs.stencil.drawBox;
      entity.style = 'rgb('+rCol(200)+','+(0)+','+rCol(0)+')';
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