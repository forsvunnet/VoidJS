var is_array = function (value) {
    return value &&
        typeof value === 'object' &&
        value.constructor === Array;
};
vcore.camera = function() {
  var shaker = [];
  var eq = {x:0, y:0};
  return {
    shake: function(magnitude, duration) {
      shaker = [magnitude, duration, duration];
    },
    update: function() {
      if (shaker[2] > 0) {
        var r = lerp(0, shaker[0], shaker[2] / shaker[1]);
        eq.x =  Math.random() * r * 2 - r;
        eq.y = Math.random() * r * 2 - r;
        shaker[2] -= voidjs.fps;
      } else {
        shaker.length = 0;
        eq.x = 0;
        eq.y = 0;
      }
    },
    eq: eq
  };
};
//voidjs.camera.shake(0, 5, 1000);

voidjs.draw = function(player) {
  if (voidjs.time) {
    var fps = 1000 / (new Date().getTime() - voidjs.time);
    //document.getElementById('fps').innerHTML = fps + '<br>' + voidjs.player.life;
  }
  player.camera.update();
  voidjs.time = new Date().getTime();
  //var player = voidjs.player;
  var canvas = player.canvas;
  var entities = voidjs.entities;
  var ctx = canvas.getContext('2d');
  var b2AABB = Box2D.Collision.b2AABB;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  voidjs.ctx = ctx;

  var ship_pos = player.GetPosition();
  var plate = new b2AABB();
  var area = 9;
  plate.lowerBound = {x: ship_pos.x - area, y: ship_pos.y - area};
  plate.upperBound = {x: ship_pos.x + area, y: ship_pos.y + area};
  var que = {};
  layers = [];
  voidjs.world.QueryAABB(function (fixture){
    var layer = fixture.m_body.style.layer;
    if (!que[layer]) {
      que[layer] = [];
      layers.push(layer);
    }
    que[layer].push(fixture.m_body);
    return true;
  }, plate);

  layers.sort();

  for (var i in layers) {
    var layer = layers[i];
    for (var body in que[layer]){
      que[layer][body].draw(player);
    }
  }
};
voidjs.stencil.drawEntity = function (player) {
  var style = this.style || {stroke:'red'};
  var rotation = this.GetAngle();
  var entity_pos = this.GetPosition();
  var position;
  var ship_pos = player.GetPosition();
  var eq = player.camera.eq;
  var canvas = player.canvas;
  var scale = voidjs.scale || 30;
  var cpos = {
    x:  (canvas.width/2/scale) - ship_pos.x + eq.x,
    y: (canvas.height/2/scale) - ship_pos.y + eq.y
  };
  if (style.art) {
    for (var i in style.art) {
      position = {
        x: entity_pos.x + cpos.x,
        localX: style.art[i].position.x,
        y: entity_pos.y + cpos.y,
        localY: style.art[i].position.y
      };
      rotation = {
        angle: rotation,
        localAngle: style.art[i].angle
      };
      voidjs.stencil.drawVerts(
        style.art[i].fill,
        style.art[i].stroke,
        style.art[i].vertices,
        position,
        rotation
      );
    }
    return;
  }
  // this = entity from which the draw is called
  var vertices = this.vertices;
  // Make new object so we dont change the position of an entity
  position = {
    x : entity_pos.x + cpos.x,
    y : entity_pos.y + cpos.y
  };
  //position.y += voidjs.entities.player.y || 0;
  // All parts in the bag?
  voidjs.stencil.drawVerts(
    style.fill,
    style.stroke,
    vertices,
    position,
    rotation
  );
};

var glitches = {};
voidjs.stencil.drawVerts = function (fill, stroke, vertices, position, rotation, normals) {
  var ctx = voidjs.ctx;
  var scale = voidjs.scale || 30;
  ctx.save();
  ctx.beginPath();
  var angle = rotation.angle || rotation;
  var localAngle = rotation.localAngle || 0;

  // Scale function
  var s = function(value) {
    /*var orig = value;
    if (glitches[value] !== undefined) {
      value = glitches[value];
    }
    if (Math.random() * 100 > 99.99) {
      value += 1 * (Math.random() - 0.5);
      glitches[orig] = value;
    }*/
    return scale * value;
  };
  // Get started on the vertices:
  // To center of entity
  ctx.translate(
    s(position.x),
    s(position.y)
  );
  //Rotate the canvas
  ctx.rotate(angle);

  if (position.localX !== undefined && position.localY !== undefined) {
    ctx.translate(
      s(position.localX),
      s(position.localY)
    );
  }
  if (localAngle) {
    ctx.rotate(localAngle);
  }
  ctx.moveTo(
    s(vertices[0].x),
    s(vertices[0].y)
  );
  for (var i = 1; i < vertices.length; i++) {
    ctx.lineTo(
      s(vertices[i].x),
      s(vertices[i].y)
    );
  }

  // Translation of coordinates:
  ctx.closePath();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (normals) {
    for (i = 0; i < vertices.length; i++) {
      ctx.beginPath();
        ctx.moveTo(
          (vertices[i].x) * scale,
          (vertices[i].y) * scale
        );
        ctx.lineTo(
          (vertices[i].x - normals[i].x / (5)) * scale,
          (vertices[i].y - normals[i].y / (5)) * scale
        );
      ctx.closePath();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }

  ctx.restore();
};
voidjs.stencil.drawString = function (y) {
  // this is refering to the menu which calls this function
  var vertices, x = 1;
  //console.log(this.title);
  var letters = this.title.split('');
  for (var i in letters) {
    var letter = letters[i];
    voidjs.stencil.drawLetter(letter, x ,y, this);
    x += 0.8;
  }

};
voidjs.stencil.drawLetter = function (letter, x, y, obj) {
  var ctx = voidjs.ctx;
  var scale = voidjs.scale || 30;
  var style = obj.style || "red";
  var vertices = voidjs.alphabet[letter];
  //var vertices = voidjs.alphabet[letter];
  ctx.beginPath();
  ctx.moveTo(
    (x + vertices[0].x*2/3) * scale,
    (y + vertices[0].y) * scale
  );
  for (var i = 1; i < vertices.length; i++) {
    ctx.lineTo(
      (x + vertices[i].x*2/3) * scale,
      (y + vertices[i].y) * scale
    );
  }
  ctx.closePath();
  ctx.strokeStyle = style;
  ctx.stroke();
};