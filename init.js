// Solarized
// http://ethanschoonover.com/solarized
// Because it's the best palette i know
  var solarized = {
    base03:    '#002b36',
    base02:    '#073642',
    base01:    '#586e75',
    base00:    '#657b83',
    base0:     '#839496',
    base1:     '#93a1a1',
    base2:     '#eee8d5',
    base3:     '#fdf6e3',
    yellow:    '#b58900',
    orange:    '#cb4b16',
    red:       '#dc322f',
    magenta:   '#d33682',
    violet:    '#6c71c4',
    blue:      '#268bd2',
    cyan:      '#2aa198',
    green:     '#859900',
  };

// Void JavaScript engine

function lerp(s,e,t) {
  if (t === undefined) {
    t = 0.2;
  }
  return (s+t*(e-s));
}
var millis = function () {
  return new Date().getTime();
};

var vcore = {};
vcore.scripts = function() {
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
      //console.log(i);
      data.splice(i,1);
    }
  };
};

// QueryAAB
vcore.q = function (pos, size, callback) {
  var b2AABB = Box2D.Collision.b2AABB;
  var plate = new b2AABB();
  plate.lowerBound = {x: pos.x - size, y: pos.y - size};
  plate.upperBound = {x: pos.x + size, y: pos.y + size};

  voidjs.world.QueryAABB(callback, plate);
};

vcore.v2a = function(vector) {
  return Math.atan2(vector.x, vector.y);
};

vcore.a2v = function(angle, magnitude) {
  if (magnitude === undefined) {
    magnitude = 1;
  }
  return {x:Math.sin(angle) * magnitude, y:Math.cos(angle) * magnitude};
};

vcore.scale = function(vertices, scale) {
  if (scale === undefined) {
    scale = 0.1;
  }
  var poly = [];
  for (var i = 0; i < vertices.length; i++) {
    poly.push({x: vertices[i].x * scale, y: vertices[i].y * scale});
  }
  return poly;
};

vcore.len = function(e1, e2) {
  var p1 = e1.GetPosition();
  var p2 = e2.GetPosition();
  var dx = p1.x - p2.x, dy = p1.y - p2.y;
  return Math.sqrt(dx*dx + dy*dy);
};

// Calculate normals from an array of vectors [{x, y}]
vcore.normals = function(vertices) {
  var normals = [];
  for (var i = 0; i < vertices.length; i++) {
    var c = vertices[i];
    var next = i + 1 < vertices.length ? i + 1 : 0;
    var n = vertices[next];
    // Previos or length-1
    var prev = i - 1 < 0 ? vertices.length - 1 : i - 1;
    var p = vertices[prev];

    var a1 = Math.atan2(c.y - p.y, c.x - p.x);
    var a2 = Math.atan2(c.y - n.y, c.x - n.x);
    var a = a2 - a1;
    if (a < 0) { a += 2 * Math.PI; }
    normals.push(a1 + a);
  }
  return normals;
};
// Array to box 2d vector 2
vcore.aTob2Vec2 = function(definition, data) {
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var i, j;
  vertices = [];
  for (i = 0; i < data['vertices'].length; i++) {
    var v = data['vertices'][i];
    vertices.push(new b2Vec2(v[0], v[1]));
  }

  var shape = voidjs.entityCreator.fixture.shape;
  var total = 0;
  // Ensure clockwise placement of vertices
  for (i = 0; i < vertices.length; i++) {
    // http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
    j = (i + 1) % vertices.length;
    total += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
  }
  if (total > 0) {
    // In case of counterclockwise vertices
    // reverse the array to make it clockwise
    vertices.reverse();
  }
  definition.shape.SetAsVector(vertices);
};

// Predicts the target player position based on player movement in correlation with projectile speed
vcore.predict = function(pos, speed, target) {
  var p1 = target.GetPosition();
  var vel = target.GetLinearVelocity();
  var m1 = {x:0, y:0}, m2 = {x:0, y:0};
  var len = 999, t = 0, a2;
  //var a1 = Math.atan2(vel.x, vel.y);
  var a1 = Math.atan2(vel.y, vel.x);
  var s1 = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
  var closest = 0;
  var str = 't: ';
  for (t=0; t < 2; t+= 0.05) {
    m1.x = p1.x + Math.cos(a1) * s1 * t;
    m1.y = p1.y + Math.sin(a1) * s1 * t;
    a2 = Math.atan2(m1.y - pos.y, m1.x - pos.x);
    m2.x = pos.x + Math.cos(a2) * speed * t;
    m2.y = pos.y + Math.sin(a2) * speed * t;
    if (vcore.seg(pos.x, pos.y, m2.x, m2.y, p1.x, p1.y, m1.x, m1.y)) {
      break;
    }
    var dx = m2.x - m1.x;
    var dy = m2.y - m1.y;
    var dst = Math.sqrt(dx*dx + dy*dy);
    if (dst < len) {
      closest = t;
      len = dst;
    }
    str += t + ', ';
  }
  m1.x = p1.x + Math.cos(a1) * s1 * closest;
  m1.y = p1.y + Math.sin(a1) * s1 * closest;
  //console.log('1:['+p1.x + ', '+p1.y+']\n2:[' + m1.x + ', ' + m1.y + ']');
  //return {x:0, y:1};
  return m1;
};
vcore.seg = function(x1, y1, x2, y2, x3, y3, x4, y4) {
  var bx = x2 - x1;
  var by = y2 - y1;
  var dx = x4 - x3;
  var dy = y4 - y3;
  var b_dot_d_perp = bx * dy - by * dx;
  if(b_dot_d_perp === 0) {
    return false;
  }
  var cx = x3 - x1;
  var cy = y3 - y1;
  var t = (cx * dy - cy * dx) / b_dot_d_perp;
  if(t < 0 || t > 1) {
    return false;
  }

  var u = (cx * by - cy * bx) / b_dot_d_perp;
  if(u < 0 || u > 1) {
    return false;
  }
  return true;
};

var c = [
  solarized.base03, // BG
  solarized.base01, // Wall line
  solarized.base02, // Level BG
  solarized.base0,  // Player color
  solarized.magenta, // Enemy color
  solarized.cyan  // Checkpoint / End
];
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
// 4. 20% - Sounds
//        * Might have to be refractored. Lacks consistency.
//
// 5. 01% - Particles
//        * box2d = entity. Ignore everything but walls? - non-essential.
//        * [Redundant:] Non box2d = non entity. Requires own "physics"
//          (We use box2d because of the AABB selection for rendering & other consistency issues)
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
  fps: 1000/30,
  destroy_entities: [],
  //@TODO : turn entities into an array so we can remove all reference to its object easily
  entities  : {},
  active_entities  : {},
  descriptions : {},
  scripts   : {},
  // Prefabs are open by design. they are meant to be edited and modified by users
  // Want to make walls bouncy and deadly? Do it in prefabs..
  prefabs   : {},
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
    voidjs.canvas.style.backgroundColor = c[0];
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
    var entities = {};
    voidjs.entities = entities;
    var active_entities = {};
    voidjs.active_entities = active_entities;

    world.SetContactListener(voidjs.listener);

    voidjs.entityCreator.init();
    voidjs.entityCreator.buildLevel(voidjs.levels[chapter]);
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
      entity.scripts = vcore.scripts();
      return entity;
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

voidjs.fullscreen = function() {
  voidjs.canvas.width = window.innerWidth;
  voidjs.canvas.height = window.innerHeight;
  voidjs.scale = voidjs.canvas.height * 45 / 768;
};
window.addEventListener('resize', voidjs.fullscreen, false);
voidjs.fullscreen();
