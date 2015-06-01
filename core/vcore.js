
console.once = function() {
  var things = {};
  return function( thing, id ) {
    if ( !id )
      id = '1';
    if ( things[id] )
      return;
    this.log( thing );
    things[id] = true;
  };
}();

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
vcore.q = function( pos, size, callback ) {
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
  for (i = 0; i < data.vertices.length; i++) {
    var v = data.vertices[i];
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
  solarized.blue,  // Player color
  solarized.magenta, // Enemy color
  solarized.base03  // Checkpoint / End
];

c = [
  '#112211', // BG
  '#224422', // Wall line
  '#193319', // Level BG
  '#335533',  // Player color
  '#335533', // Enemy color
  '#224422'  // Checkpoint / End
];

$('body').css('background', c[0]);

vcore.canvas = function() {
  var canvas = [$('#canvas').get(0)];
  return function(current_canvas) {
    // return the main canvas or make a new one.
    if (canvas[current_canvas] === undefined) {
      canvas[current_canvas] = $('<canvas>').insertAfter(canvas[0]).get(0);
    }
    return canvas[current_canvas];
  };
}();


/**
 * Spawner
 * Spawns an entity
 */

vcore.spawner = function( enityt_info ) {
};



