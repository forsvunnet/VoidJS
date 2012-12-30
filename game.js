// Update
voidjs.update = function () {
  voidjs.draw();
  var mouse = voidjs.mouse,
      world = voidjs.world,
      key = voidjs.key,
      ship = voidjs.entities.player;
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var shipAt = ship.GetPosition();
  if (mouse.active) {
    var mR = new b2Vec2(mouse.x, mouse.y);
    mR.Subtract(shipAt);
    //mR.Multiply(0.1);
    ship.ApplyForce(
      mR,
      shipAt
    );
  }
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
  direction.Multiply(5);
  if (direction.x !== 0 || direction.y !== 0) {
    ship.ApplyForce(direction, shipAt);
  }
  if (world) {
    world.Step(1 / 60, 10, 10);
    world.DrawDebugData();
    world.ClearForces();
  }
};