var is_array = function (value) {
    return value &&
        typeof value === 'object' &&
        value.constructor === Array;
};

voidjs.draw = function(){
  if (voidjs.time) {
    var fps = 1000 / (new Date().getTime() - voidjs.time);
    document.getElementById('fps').innerHTML = fps;
  }
  voidjs.time = new Date().getTime();
  var canvas = voidjs.canvas;
  var entities = voidjs.entities;
  var ctx = canvas.getContext('2d');
  var b2AABB = Box2D.Collision.b2AABB;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  voidjs.ctx = ctx;

  var ship_pos = voidjs.player.GetPosition();
  var plate = new b2AABB();
  plate.lowerBound = {x: ship_pos.x - 5, y: ship_pos.y - 5};
  plate.upperBound = {x: ship_pos.x + 5, y: ship_pos.y + 5};
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
      que[layer][body].draw();
    }
  }
};
voidjs.stencil.drawBox = function () {
  // this = entity from which the draw is called
  var ctx = voidjs.ctx;
  var scale = voidjs.scale || 30;
  var style = this.style || {stroke:'red'};
  var vertices = this.vertices;
  var rotation = this.GetAngle();
  var boxV2 = this.GetPosition();
  var ship_pos = voidjs.player.GetPosition();
  // Make new object so we dont change the position of an entity
  var position = {
    x : boxV2.x - ship_pos.x + 10,
    y : boxV2.y - ship_pos.y + 200/30
  };
  //position.y += voidjs.entities.player.y || 0;
  // All parts in the bag?
  ctx.save();
  ctx.beginPath();
  // Get started on the vertices:
  // To center of entity
  ctx.translate(
    position.x * scale,
    position.y * scale
  );
  //Rotate the canvas
  ctx.rotate(rotation);
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
  ctx.translate(
    -position.x * scale,
    -position.y * scale
  );
  // Translation of coordinates:
  ctx.closePath();
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.stroke();
  }
  if (style.fill) {
    ctx.fillStyle = style.fill;
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