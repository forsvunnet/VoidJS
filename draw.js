voidjs.draw = function(){
  var canvas = voidjs.canvas;
  var entities = voidjs.entities;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //if (!this.cx) { this.cx = true;
    for (var i in entities) {
      // Retrieve entity
      drawEntity(entities[i]);
    }
  //}
  function drawEntity(entity) {
    var scale = voidjs.scale || 30;
    var style = entity.style || 'red';
    var vertices = entity.vertices;
    var rotation = entity.GetAngle();
    var position = entity.GetPosition();

    // All parts in the bag?
    ctx.save();
    ctx.beginPath();
    // Get started on the vertices:
    ctx.translate(
      position.x * scale,
      position.y * scale
    );
    ctx.rotate(rotation);
    ctx.translate(
      -position.x * scale,
      -position.y * scale
    );
    ctx.moveTo(
      (vertices[0].x + position.x) * scale,
      (vertices[0].y + position.y) * scale
    );
    for (var i = 1; i < vertices.length; i++) {
      ctx.lineTo(
        (vertices[i].x + position.x) * scale,
        (vertices[i].y + position.y) * scale
      );
    }
    // Translation of coordinates:

    /*ctx.moveTo(pos.x*30-5,  pos.y*30-5);
    ctx.lineTo(pos.x*30+5, pos.y*30-5);
    ctx.lineTo(pos.x*30+5, pos.y*30+5);
    ctx.lineTo(pos.x*30-5, pos.y*30+5); // */
    //ctx.lineTo(pos.x*30-5, pos.y*30-5);
    ctx.closePath();
    ctx.strokeStyle = style;
    ctx.stroke();
    ctx.restore();
  }
  // Make a function to draw the vertices
  // vertices are local
  // Position needs to translate to world location
  // function
};