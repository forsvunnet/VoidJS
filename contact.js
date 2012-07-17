voidjs.listener = new Box2D.Dynamics.b2ContactListener();
voidjs.listener.BeginContact = function(contact, impulse) {
  var fixA = contact.GetFixtureA();
  var fixB = contact.GetFixtureB();
  var sensor = false, body;
  // Check if one of the bodies is a sensor:
  if (fixA.IsSensor()) {
    sensor = fixA.m_body;
    body = fixB.m_body;
  }
  else if (fixB.IsSensor()){
    sensor = fixB.m_body;
    body = fixA.m_body;
  }
  if (sensor !== false) {
    sensor.scripts.call(body, sensor, contact, impulse);
  }
  else {
    // Bullets dont collide with sensors
    var bullet = false;
    if (fixA.m_body.IsBullet()) {
      bullet = fixA.m_body;
      body = fixB.m_body;
    }
    else if (fixB.m_body.IsBullet()){
      bullet = fixB.m_body;
      body = fixA.m_body;
    }
    if (bullet !== false) {
      bullet.scripts.call(body, bullet, contact, impulse);
    }
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
    sensor = fixA.m_body;
    body = fixB.m_body;
  } else if (fixB.IsSensor()){
    sensor = fixB.m_body;
    body = fixA.m_body;
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
