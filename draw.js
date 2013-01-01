var is_array = function (value) {
    return value &&
        typeof value === 'object' &&
        value.constructor === Array;
};

voidjs.draw = function(){
  var canvas = voidjs.canvas;
  var entities = voidjs.entities;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  this.ctx = ctx;
  for (var i in entities) {
    // Retrieve and draw entity/entities
    if (is_array(entities[i])) {
      for (var j in entities[i]) {
        if (entities[i][j].IsActive()) {
          entities[i][j].draw();
        }
      }
    } else {
      if (entities[i].IsActive()) {
        entities[i].draw();
      }
    }
  }
};
voidjs.drawBox = function () {
  // this = entity from which the draw is called
  var ctx = voidjs.ctx;
  var scale = voidjs.scale || 30;
  var style = this.style || 'red';
  var vertices = this.vertices;
  var rotation = this.GetAngle();
  var position = this.GetPosition();

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
  ctx.strokeStyle = style;
  ctx.stroke();
  ctx.restore();
};