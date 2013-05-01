voidjs.listener = new Box2D.Dynamics.b2ContactListener();
voidjs.listener.BeginContact = function(contact, impulse) {
  var fixA = contact.GetFixtureA();
  var fixB = contact.GetFixtureB();
  var sensor = false, body;
  // Check if one of the bodies is a sensor:
  if (fixA.IsSensor()) {
    sensor = fixA.GetBody();
    body = fixB.GetBody();
  } else if (fixB.IsSensor()){
    sensor = fixB.GetBody();
    body = fixA.GetBody();
  }
  if (sensor !== false) {
    sensor.scripts.call(body, sensor, contact, impulse);
  }

  // If not then maybe play a sound at collision?
  //....
};
// Sensors does not show up here:
voidjs.listener.PostSolve = function(contact, impulse) {
  var fixA = contact.GetFixtureA();
  var fixB = contact.GetFixtureB();
  var sensor = false, body;
  // Check if one of the bodies is a sensor:
  if (fixA.IsSensor()) {
    sensor = fixA.GetBody();
    body = fixB.GetBody();
  } else if (fixB.IsSensor()){
    sensor = fixB.GetBody();
    body = fixA.GetBody();
  }
  if (sensor === false) {
    if (impulse.normalImpulses[0] > 1) {
      voidjs.audio.play('hurt');
    }
    else if (impulse.normalImpulses[0] > 0.5) {
      voidjs.audio.play('hurt', 1);
    }
  }
};
