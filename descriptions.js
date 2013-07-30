voidjs.descriptions = {};

// Walls
voidjs.descriptions.wall = {
  map: [['vertices', 'fixture']],
  required : 1,
  special: { 'vertices': vcore.aTob2Vec2 },
  body: { type: Box2D.Dynamics.b2Body.b2_staticBody },
  style: {fill: c[0], stroke: c[1], layer: 20}
};

// Like wall, just no collision
voidjs.descriptions.background = {
  map: [['vertices', 'fixture']],
  required : 1,
  special: { 'vertices': vcore.aTob2Vec2 },
  body: {type: Box2D.Dynamics.b2Body.b2_staticBody},
  fixture: {isSensor: true},
  style:{fill: c[2], stroke: c[1]}
};

// A simple collectible
voidjs.descriptions.shard = {
  map : [
    ['x', 'body'],
    ['y', 'body'],
    ['width', 'fixture', 0.1],
    ['height', 'fixture', 0.1]
  ],
  body: {type: Box2D.Dynamics.b2Body.b2_staticBody},
  fixture: {isSensor: true},
  style:{fill: 0, stroke: c[3], layer: 9},
  scripts: [voidjs.scripts.collectible]
};

// Players
voidjs.descriptions.player = {
  map : [
    ['x', 'body'],
    ['y', 'body']
  ],
  body: { linearDamping: 10 },
  style: {
    fill: c[3],
    stroke: false,
    layer: 10
  },
  after: function(entity) {
    entity.checkpoint = false;
    entity.isPlayer = true;
    entity.hasCamera = true;
    entity.playerNumber = 0;
    entity.team = 1;
    entity.life = 10;
    entity.max_life = 10;
    entity.active_scripts = vcore.scripts();
    entity.active_scripts.register(voidjs.scripts.life(entity));
    entity.active_scripts.register(voidjs.scripts.regen(entity));
    entity.m_fixtureList.m_shape.SetAsBox(0.15, 0.15);
    entity.kill = function() {
      entity.SetActive(false);
      var amount = 10;
      var r = Math.PI *2; // 30 degrees freedom
      for (var i = 0; i < amount; i++) {
        var vel = vcore.a2v(Math.random() * r, Math.random() * 7 + 3);
        var pos = entity.GetPosition();
        voidjs.entityCreator.create('particle', [pos, vel, c[3], 2, [1000, 2000], 0.1]);
      }
      entity.active_scripts.register(voidjs.scripts.spawner());
    };
    voidjs.player = entity;
    //console.log('Player:');
    //console.log(entity);
  }
};

// Simple sentries
voidjs.descriptions.sentry = {
  map : [
    ['x', 'body'],
    ['y', 'body'],
    ['mode', 'after', 0]
  ],
  //special: {mode:0},
  scripts: [ voidjs.scripts.sentry ],
  style: {
    fill: c[4],
    stroke: false,
    //art: {main : { vertices: vcore.scale(voidjs.shapes.sentry)}},
    layer: 10
  },
  body: {type: Box2D.Dynamics.b2Body.b2_staticBody},
  after: function(entity, args) {
    entity.active_scripts = vcore.scripts();
    entity.isAI = 1;
    entity.team = 2;
    entity.target_range = 7;
    var smart = 0;
    var speed = 5;
    var damage = 6;
    if (args) {
      if (args[2] == 1) {
        smart = 1;
        speed = 7;
        //entity.style.art.main = { vertices: vcore.scale(voidjs.shapes.smartsentry)}
      }
      if (args[2] == 2) {
        damage = 20;
        //entity.style.art.main = { vertices: vcore.scale(voidjs.shapes.powersentry)}
      }
      if (args[2] == 3) {
        smart = 1;
        speed = 7;
        damage = 20;
        //entity.style.art.main = { vertices: vcore.scale(voidjs.shapes.lethalsentry)}
      }
    }
    entity.inventory = {
      weapon: voidjs.items.gun(smart, damage, speed)
    };
  }
};
voidjs.items = {};
voidjs.items.gun = function(smart, damage, speed, cooldown) {
  if (speed === undefined) {
    speed = 8;
  }
  if (!cooldown) {
    cooldown = 500; // milliseconds
  }
  var acd = 0; // active cooldowns

  return function(self) {
    if (acd > 0) {
      acd-= voidjs.fps;
    } else {
      // No cooldown active
      // Activate the cooldown
      acd = cooldown;
      // Shoot at target
      var target = voidjs.entities[self.target];
      var p1 = self.GetPosition();
      var p2;
      if (smart) {
        p2 = vcore.predict(p1, speed, target);
      }
      else {
        p2 = target.GetPosition();
      }
      voidjs.entityCreator.create('bullet', [p1, p2, speed, damage]);
    }
  };
};

voidjs.descriptions.bullet = {
  map : [
    ['p1', 'body'],
    ['p2', 'body'],
    ['speed', 'body'],
    ['damage', 'body']
  ],
  special: {
    'p1' : 0,
    'p2' : 0,
    'speed' : 0,
    'damage' : function(definition, data) {
      var p1 = data['p1'], p2 = data['p2'];
      var angle = vcore.v2a({x: p2.x - p1.x, y: p2.y - p1.y});
      var vel = vcore.a2v(angle, data['speed']);
      //vel.x*=-1;
      definition.linearVelocity = vel;
      var d = vcore.a2v(angle, 0.1);

      definition.position = {x: p1.x + d.x, y: p1.y + d.y};
    }
  },
  style: {
    fill: c[4],
    stroke: false,
    layer: 11
  },
  body: {
    bullet: true,
    angularDamping: 0,
    angularVelocity: 10,
    linearDamping: 0
  },
  fixture: { isSensor: true },
  scripts: [
    function (args) {
      var bullet = args[1];
      var body = args[0];
      if (body.team !== bullet.team){
        if (bullet.damage && body.life) {
          body.life -= bullet.damage;
        }
        // Particles in the reverse direction of the hit:
        var amount = Math.random() * 2 + 1;
        var angle = vcore.v2a(bullet.m_linearVelocity);
        var r = Math.PI / 6; // 30 degrees freedom
        for (var i = 0; i < amount; i++) {
          var vel = vcore.a2v(Math.PI + angle + (Math.random() * 2 * r) -r, Math.random() * 5 + 1);
          var pos = bullet.GetPosition();
          voidjs.entityCreator.create('particle', [pos, vel]);
        }
        if (body.isPlayer && body.hasCamera) {
          var camera = body.playerNumber || 0;
          voidjs.camera.shake(camera, 0.2, 250);
          voidjs.audio.play('hurt', 1);
        }
        // Goodbye bullet:
        voidjs.world.RemoveBody(bullet);
      }
    }
  ],
  after: function(entity, args) {
    // Set to team 0 to allow Friendly Fire
    entity.team = 2;
    entity.damage = args[3];
    entity.m_fixtureList.m_shape.SetAsBox(0.1, 0.1);
  }
};

voidjs.descriptions.particle = {
  map : [
    ['position', 'body'],
    ['velocity', 'body'],
    ['fill', 'style', c[4]],
    ['linearDamping', 'body', 2],
    ['decay', 'after', [500,1000]],
    ['size', 'after', 0.05]
  ],
  special: {
    'position': 0,
    'velocity' : function(definition, data) {
      var p1 = data['position'];
      var d  = data['velocity'];
      definition.position = {x: p1.x, y: p1.y};
      definition.linearVelocity = d;
    }
  },
  style: {
    stroke: false,
    layer: 20
  },
  body: {
    bullet: true,
    angularDamping: 0
  },
  fixture: { isSensor: true },
  after: function(entity, args) {
    entity.m_fixtureList.m_shape.SetAsBox(args[5], args[5]);
    entity.angularVelocity = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? -1 : 1);
    entity.life = Math.random() * (args[4][1] - args[4][0]) + args[4][0];
    entity.max_life = entity.life;
    entity.active_scripts = vcore.scripts();
    entity.active_scripts.register(voidjs.scripts.decay(entity, voidjs.fps));
    entity.active_scripts.register(voidjs.scripts.life(entity));

    // @TODO: BUG @BUG: style.fill should already be filled in
    entity.style.fill = args[2];
    entity.active_scripts.register(voidjs.scripts.fade(entity));
    entity.kill = function() {
      voidjs.world.RemoveBody(entity);
    };
  }
};

voidjs.descriptions.checkpoint = {
  fixture: {isSensor: true},
  scripts: [
    voidjs.scripts.checkpoint
  ],
  style: {layer: 1, fill: c[5]}
};
voidjs.descriptions.end = {
  fixture: {isSensor: true},
  scripts: [
    voidjs.scripts.finish
  ],
  style: {layer: 1, fill: c[5]}
};