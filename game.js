// Update
voidjs.update = function () {
  voidjs.entityCreator.lateCreate();
  voidjs.draw();
  var mouse = voidjs.control.mouse,
      world = voidjs.world,
      key = voidjs.key,
      ship = voidjs.player,
      destroy_entities = voidjs.destroy_entities,
      active_entities = voidjs.active_entities,
      entities = voidjs.entities;
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var b2AABB = Box2D.Collision.b2AABB;
  var shipAt = ship.GetPosition();
  //console.log(ship.m_linearVelocity.x + ', ' + ship.m_linearVelocity.y);
  /* Mouse experiment:
  if (mouse.active) {
    var mR = new b2Vec2(mouse.x, mouse.y);
    mR.Subtract(shipAt);
    ship.ApplyForce(mR, shipAt);
  }// */

  // Per alive player :
  if (ship.IsActive()) {
    // Trigger AI's:
    var pos = ship.GetPosition();
    var plate = new b2AABB();
    var area = 7;
    plate.lowerBound = {x: pos.x - area, y: pos.y - area};
    plate.upperBound = {x: pos.x + area, y: pos.y + area};

    voidjs.world.QueryAABB(function (fixture){
      if (fixture.m_body.isAI || fixture.isAI) {
        fixture.m_body.scripts.call(fixture.m_body);
      }
      return true;
    }, plate);
  }
  var i, j;
  // very slow loop: (Should be discontinued)
  for (i in entities) {
    if (entities[i].active_scripts !== undefined) {
      entities[i].active_scripts.call();
    }
  }
  for (i in active_entities) {
    if (entities[i].active_scripts !== undefined) {
      //entities[i].active_scripts.call();
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
  direction.Multiply(20);
  if (direction.x !== 0 || direction.y !== 0) {
    ship.ApplyForce(direction, shipAt);
  }
  if (world) {
    world.Step(voidjs.fps / 1000, 10, 10);
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
  var i = ship.active_scripts.getLength();
  console.log("Spawner at: " + i);
  return function(){
    if(tick > 60) {
      ship.SetPosition( ship.checkpoint?
        ship.checkpoint:
        {x:7, y:7}
        );
      ship.SetActive(true);
      ship.life = ship.max_life || 20;
      // Self-destruct
      console.log('Self destructing respawner');
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
      var amount = 10;
      var r = Math.PI *2; // 30 degrees freedom
      var pos = body.GetPosition();
      var bvel = body.GetLinearVelocity();
      for (var i = 0; i < amount; i++) {
        var vel = vcore.a2v(Math.random() * r, Math.random() * 7 + 3);
        vel.x += bvel.x;
        vel.y += bvel.y;
        voidjs.entityCreator.create('particle', [pos, vel, '#FFFFFF', 2, [1000, 2000], 0.1]);
      }
      voidjs.audio.play('collect');
    voidjs.world.RemoveBody(sensor);
  }
};
//once = true;
voidjs.scripts.sentry = function (args) {
  var self = args[0];
  // # Activation
  // During the update sequence the game does an AABB query around
  // the player looking for AI's. AI's will have their script (this) executed.
  // I think "this" will be the sentry entity, but if not then it can be passed as an arg
  // Players are centrally registrered so getting the closest one is just a matter of maths
  // It might be interesting to use a "team" system though. (AI's fighting each other + you)
  if (!self.target) {
    //if (once) {console.log(self); once = false;}
    var pos = self.GetPosition();
    var activation = function(fixture){
      var entity = fixture.m_body;
      if (entity.team !== undefined && entity.team != self.team) {
        //console.log(len + );
        var len = vcore.len(self, entity);
        if (len < self.target_range) {
          // Target within range
          self.target = entity.id;
          // Activate:
          self.active_scripts.register(voidjs.scripts.sentry_tracking(self));
          return true;
        }
      }
      return true;
    };
    vcore.q(pos, 5, activation);
  }
    //self.aggro[entity.id] = vcore.len(self, entity);
};

voidjs.scripts.sentry_tracking = function (self) {
  // The active scripts are not called with any arguments so we need to close them in

  // NB! active script is not necesarry for sentries
  // It's just for consistency in AI's and discovering
  // recurring patterns that can be modulised.

  // # Aggro system
  // Initially the Sentry will query (AABB) the area around itself looking
  // for oposing team entities. It will target the closest one by creating an
  // aggro table ([array]) with entity id's (closer being more aggressive)
  // The sentry will per loop continually target the highest aggro entity

  var aggro = {};
  var present = {};
  var script = self.active_scripts.getLength();
  var ticks = 120; // ~ 4 seconds
  var count = 0;
  // Begin closure:
  var tracking = function(fixture) {
    var entity = fixture.m_body;
    if (entity.team !== undefined && entity.team != self.team) {
      // Targeted entity is of another team
      var len = vcore.len(self, entity);
      if (len < self.target_range) {
        ticks = 120; // reset ticks
        if (!(entity.id in aggro)) {
          // Register a new entity in the aggro table
          aggro[entity.id] = 0;
        }
        present[entity.id] = 1;
        aggro[entity.id] += self.target_range - len;
        count++;
      }
    }
    return true;
  };
  var t = 0;
  return function () {
    var pos = self.GetPosition();
    present = {}; count = 0;
    vcore.q(pos, 5, tracking);
    if (count > 0) {
      for (var i in aggro) {
        aggro[i] *= 0.9; // Rapid deterioation
        if ((t === 0 || aggro[i] > aggro[t]) && i in present) {
          t = i;
        }
      }
      self.target = t;

      // Use weapon from inventory if available
      if (t && self.inventory.weapon) {
        self.inventory.weapon(self);
      }
    }
    ticks--;
    if (ticks <= 0) {
      // Self destruct:
      //console.log('Self destructing targeting script');
      self.active_scripts.remove(script);
      self.target = 0;
    }
  };

  // # Upon activation:
  // * Register an active script with a timed self-destruct
  //   - The active script should update the timer if the sentry is
  //     within range of a player
  //   - The scripts will create a new bullet if within range of player
  //     & unobstructed raycast using $weapon-inventory (voidjs.scripts.gun?)
};


voidjs.scripts.life = function (self) {
  return function () {
    if (self.kill && self.IsActive() && self.life <= 0) {
      self.kill();
    }
  };
};
voidjs.scripts.decay = function (self, rate) {
  return function () {
    self.life -= rate;
  };
};
voidjs.scripts.fade = function (self, art) {
  if (art === undefined) {
    art = self.style;
  }
  var r = parseInt(art.fill.substr(1,2), 16);
  var g = parseInt(art.fill.substr(3,2), 16);
  var b = parseInt(art.fill.substr(5,2), 16);
  return function () {
    var opac = 0;
    if (self.life !== 0) {
      opac = self.life / self.max_life;
    }
    if (opac > 0.1) {
      art.fill = 'rgba(' + r + ',' + g + ',' + b + ',' + opac + ')';
    } else {
      art.fill = false;
    }
  };
};
voidjs.scripts.regen = function (self, rate) {
  if (rate === undefined) {
    rate = 1 / voidjs.fps;
  }
  return function () {
    if (self.IsActive() && self.life) {
      var max = self.max_life || 20;
      if (self.life < max) {
        self.life += rate;
      }
      if (self.life > max) {
        self.life = max;
      }
    }
  };
};