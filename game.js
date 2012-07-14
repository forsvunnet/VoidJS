// Update
voidjs.update = function () {
  voidjs.draw();
  var mouse = voidjs.control.mouse,
      world = voidjs.world,
      key = voidjs.key,
      ship = voidjs.player,
      destroy_entities = voidjs.destroy_entities,
      entities = voidjs.entities;
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var shipAt = ship.GetPosition();
  //console.log(ship.m_linearVelocity.x + ', ' + ship.m_linearVelocity.y);
  /* Mouse experiment:
  if (mouse.active) {
    var mR = new b2Vec2(mouse.x, mouse.y);
    mR.Subtract(shipAt);
    ship.ApplyForce(mR, shipAt);
  }// */
  if (mouse.active && ship.IsActive()) {
    // Kill Ship:
    //ship.kill();
  }
  var i, j;
  for (i in entities) {
    if (entities[i].active_scripts !== undefined) {
      entities[i].active_scripts.call();
    }
  }
  for (i in destroy_entities) {
    world.RemoveBody(destroy_entities[i]);
  }
  // Clear array
  destroy_entities.length = 0;

  ship.ApplyTorque(0.02);
  var direction = new b2Vec2(0,0);
  direction.x +=
    key.left  ? -1:
    key.right ?  1:
    0;
  direction.y +=
    key.up    ? -1:
    key.down  ?  1:
    0;
  direction.Normalize();
  direction.Multiply(25);
  if (direction.x !== 0 || direction.y !== 0) {
    ship.ApplyForce(direction, shipAt);
  }
  if (world) {
    world.Step(1 / 60, 10, 10);
    world.DrawDebugData();
    world.ClearForces();
  }
};

/**
 * Player respawner
 */
voidjs.scripts.spawner = function () {
  // If player dies:
    // Wait x seconds
    // Respawn player at last checkpoint
  var ship = voidjs.player;
  var tick = 0;
  // Find this script in the que in order to self-destruct
  var i = ship.scripts.getLength();
  return function(){
    if(tick > 60) {
      ship.SetPosition( ship.checkpoint?
        ship.checkpoint:
        {x:7, y:7}
        );
      ship.SetActive(true);
      // Self-destruct
      ship.active_scripts.remove(i);
    }
    tick++;
  };
};

/**
 * Checkpoint code
 */
voidjs.scripts.checkpoint = function(args){
  var body = args[0];
  var sensor = args[1];
  if (body.hasOwnProperty('checkpoint') && body.isPlayer) {
    body.checkpoint = sensor.GetPosition();
    // Activated checkpoint code:
    console.log('Checkpoint Activated');
  }
};

/**
 * Finish line
 */
voidjs.scripts.finish = function(args){
  var body = args[0];
  var sensor = args[1];
  if (body.isPlayer) {
    window.clearInterval(voidjs.ticker);
    voidjs.goto('menu', 'LevelComplete');
  }
};

/**
 * Collectible self-destruct
 */
voidjs.scripts.collectible = function(args){
  var body = args[0];
  var sensor = args[1];
  if (body.isPlayer) {
    var vel = body.GetLinearVelocity().Normalize();
    vcore.v2a(vel);
    voidjs.particles.base({pos:body.GetPosition(), vel:vel});
    voidjs.world.RemoveBody(sensor);
    delete voidjs.entities[sensor.id];
  }
};

vcore.v2a = function(vector) {
  return Math.atan2(vector.y, vector.x);
};
vcore.a2v = function(angle) {
  return {x:Math.sin(angle), y:Math.cos(angle)};
};