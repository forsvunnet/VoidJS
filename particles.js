voidjs.particles = {base: function(unsan){
  var data = {
    pos : { x : unsan.pos.x, y : unsan.pos.y },
    vel : { x : unsan.vel.x, y : unsan.vel.y }
  };
  var entity = {};
  entity.vertices = [{x:0, y:0}, {x:1/4, y:0}, {x:0.5/4, y:0.85/4}];
  entity.data = data;
  // Normalize movement vector
  var mag = Math.sqrt(data.vel.x * data.vel.x + data.vel.y * data.vel.y);
  data.norm = {x: data.vel.x / mag, y: data.vel.y / mag};
  //console.log('vel: ' + (parseInt(data.vel.x*100)/100) + ' ' + (parseInt(data.vel.y*100)/100));
  //console.log('nor: ' + (parseInt(data.norm.x*100)/100) + ' ' + (parseInt(data.norm.y*100)/100));
  //console.log('mag: ' + (parseInt(mag.x*100)/100) + ' '+(parseInt(mag.y*100)/100));
  entity.draw = voidjs.stencil.drawBox;
  entity.id = millis() + '_' + voidjs.entity_index();
  entity.style = {stroke:'rgb('+rCol(200)+','+(0)+','+rCol(0)+')'};
  voidjs.entities[entity.id] = entity;
  entity.active_scripts = vcore.scripts();
  entity.active_scripts.register(
    voidjs.particles.scripts.base(entity.data)
  );
  function rCol (off) {
    off = off?off:0;
    return Math.round(Math.random()*(255-off)+off).toString();
  }
  entity.IsActive = function () { return true; };
  data.angle = 0;
  entity.GetAngle = function () { return data.angle; };
  entity.GetPosition = function () { return {x:entity.data.pos.x,y:entity.data.pos.y}; };
},
scripts: {
  base: function(data) {
    //console.log(data);
    var obj = data;
    return function(){
      //console.log(data);
      var speed = 0.1;
      obj.angle += 0.05;
      obj.pos.x += obj.norm.x * speed;
      obj.pos.y += obj.norm.y * speed;
    };
  }
}
};
