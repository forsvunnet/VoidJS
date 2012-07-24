var is_array = function (value) {
    return value &&
        typeof value === 'object' &&
        value.constructor === Array;
};
voidjs.camera = {
  eq: {0:{x:0, y:0}},
  shakers: {},
  shake: function(camera, magnitude, duration) {
    var shakers = voidjs.camera.shakers;
    shakers[camera] = [magnitude, duration, duration];
  },
  update: function() {
    var shakers = voidjs.camera.shakers;
    var eq = voidjs.camera.eq;
    for (var camera in shakers) {
      var shaker = shakers[camera];
      if (shaker[2] > 0) {
        var r = lerp(0, shaker[0], shaker[2] / shaker[1]);
        eq[camera] = {
          x: Math.random() * r * 2 - r,
          y: Math.random() * r * 2 - r
        };
        shaker[2] -= voidjs.fps;
      } else {
        delete shakers[camera];
        eq[camera] = {x:0, y:0};
      }
    }
  }
};
//voidjs.camera.shake(0, 5, 1000);

voidjs.draw = function() {
  if (voidjs.time) {
    var fps = 1000 / (new Date().getTime() - voidjs.time);
    document.getElementById('fps').innerHTML = fps + '<br>' + voidjs.player.life;
  }
  voidjs.camera.update();
  voidjs.time = new Date().getTime();
  var canvas = voidjs.canvas;
  var entities = voidjs.entities;
  var ctx = canvas.getContext('2d');
  var b2AABB = Box2D.Collision.b2AABB;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  voidjs.ctx = ctx;

  var ship_pos = voidjs.player.GetPosition();
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
      //que[layer][body].draw(camera);
      que[layer][body].draw(0);
    }
  }
};
voidjs.stencil.drawEntity = function (camera) {
  var style = this.style || {stroke:'red'};
  var rotation = this.GetAngle();
  var entity_pos = this.GetPosition();
  var position;
  //var ship_pos = voidjs.player[camera].GetPosition();
  var ship_pos = voidjs.player.GetPosition();
  var eq = voidjs.camera.eq;
  var scale = voidjs.scale || 30;
  var cpos = {
    //x: voidjs.canvas[camera].width/2/scale - ship_pos.x + eq[camera].x,
    x:  (voidjs.canvas.width/2/scale) - ship_pos.x + eq[camera].x,
    y: (voidjs.canvas.height/2/scale) - ship_pos.y + eq[camera].y
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

  voidjs.stencil.drawVerts(style.fill, style.stroke, vertices, position, rotation);
};
voidjs.stencil.drawVerts = function (fill, stroke, vertices, position, rotation) {
  var ctx = voidjs.ctx;
  var scale = voidjs.scale || 30;
  ctx.save();
  ctx.beginPath();
  var angle = rotation.angle || rotation;
  var localAngle = rotation.localAngle || 0;
  // Get started on the vertices:
  // To center of entity
  ctx.translate(
    position.x * scale,
    position.y * scale
  );
  //Rotate the canvas
  ctx.rotate(angle);

  if (position.localX !== undefined && position.localY !== undefined) {
    ctx.translate(
      position.localX * scale,
      position.localY * scale
    );
  }
  if (localAngle) {
    ctx.rotate(localAngle);
  }
  ctx.moveTo(
    (vertices[0].x) * scale,
    (vertices[0].y) * scale
  );
  for (var i = 1; i < vertices.length; i++) {
    ctx.lineTo(
      (vertices[i].x) * scale,
      (vertices[i].y) * scale
    );
  }
  /*ctx.translate(
    -position.x * scale,
    -position.y * scale
  );*/
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