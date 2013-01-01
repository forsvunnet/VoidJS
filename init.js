function lerp(s,e,t) {
  if (t === undefined) {
    t = 0.2;
  }
  return (s+t*(e-s));
}
var voidjs = {
  canvas : document.getElementById('canvas'),
  key : {
    left:   false,
    right:  false,
    up:     false,
    down:   false
  },
  active_entities : {},
  entities  : {},
  scripts   : {},
  world     : undefined,
  mouse     : undefined,
  init:function() {
    // Init only happens once, the other functions can happen many times
    var canvasPosition = voidjs.helpers.getElementPosition(voidjs.canvas);
    document.addEventListener("keydown", voidjs.keydown);
    document.addEventListener("keyup", voidjs.keyup);
    // Mouse
    var mouse = {
      x:undefined,
      y:undefined,
      active:false
    };
    voidjs.mouse = mouse;
    document.addEventListener("mousedown", function(e) {
      handleMouseMove(e);
      document.addEventListener("mousemove", handleMouseMove, true);
    }, true);
     
    document.addEventListener("mouseup", function() {
      document.removeEventListener("mousemove", handleMouseMove, true);
      mouse.active = false;
    }, true);
     
    function handleMouseMove(e) {
      mouse.x = (e.clientX - canvasPosition.x) / 30;
      mouse.y = (e.clientY - canvasPosition.y) / 30;
      mouse.active = true;
    }
    var scenes = {
      game: this.game,
      menu: this.menu
    };
    this.goto = function(scene){
      scenes[scene]();
    };
    this.goto('menu');
  },
  menu:function(){
    voidjs.reset();
    voidjs.goto('game');
  },
  reset: function () {
    voidjs.world = undefined;
    voidjs.entities = {};
    voidjs.active_entities = {};
    if (voidjs.ticker) {
      window.clearInterval(voidjs.ticker);
    }
  },
  game:function() {
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
    var entities = voidjs.entities;
    var active_entities = voidjs.active_entities;
    // Fixtures
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    // Rigidbodies
    var bodyDef = new b2BodyDef();
    bodyDef.linearDamping = 2;
    bodyDef.angularDamping = 2;

    // Make walls
    // this is all level code and should be abstracted
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(20, 2);
    bodyDef.position.Set(10, 400 / 30 + 1.8);
    entities.walls = [];
    entities.walls.push(buildEntity());
    bodyDef.position.Set(10, -1.8);
    entities.walls.push(buildEntity());
    fixDef.shape.SetAsBox(2, 14);
    bodyDef.position.Set(-1.8, 13);
    entities.walls.push(buildEntity());
    bodyDef.position.Set(21.8, 13);
    entities.walls.push(buildEntity());
    fixDef.shape.SetAsBox(2, 2);
    bodyDef.position.Set(10, 200/30);
    bodyDef.angle = Math.PI/4;
    entities.walls.push(buildEntity());
    bodyDef.angle = 0;

    // Create some objects
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape.SetAsBox(0.2, 0.2);
    bodyDef.position = new b2Vec2(1,1);
    
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

    // Checkpoints:
    bodyDef.position.Set(3, 10);
    var zone = buildEntity();
    zone.scripts.register(voidjs.scripts.checkpoint);
    entities.zones.push(zone);
    // Finish line:
    bodyDef.position.Set(18, 10);
    zone = buildEntity();
    zone.scripts.register(voidjs.scripts.finish);
    entities.zones.push(zone);


    
    var listener = new b2ContactListener();
    listener.BeginContact = function(contact) {
      var fixA = contact.GetFixtureA();
      var fixB = contact.GetFixtureB();
      var sensor = false, body;
      // Check if one of the bodies is a sensor:
      if (fixA.IsSensor()) {
        sensor = fixA.GetBody();
        body = fixB.GetBody();
      } else if (fixB.IsSensor()){
        sensor = fixB.GetBody();
        body = fixA.GetBody();
      }
      if (sensor !== false) {
        sensor.scripts.call(body, sensor);
      }

      // If not then maybe play a sound at collision?
      //....
    };
    world.SetContactListener(listener);
     
    voidjs.ticker = window.setInterval(voidjs.update, 1000 / 60);
    

    //helpers

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
      entity.draw = voidjs.drawBox;
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