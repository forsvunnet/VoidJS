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
    ['width', 'fixture', 0.3],
    ['height', 'fixture', 0.3]
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
    entity.inventory = {
      weapon: voidjs.items.player_sword(),
      //shield: voidjs.items.player_shield()
    };
    entity.Inflict = function(bullet, shake) {
      if (bullet.damage && entity.life) {
        entity.life -= bullet.damage;
      }
      if (shake === undefined) {
        shake = 0.2;
      }
      if (shake && entity.isPlayer && entity.hasCamera) {
        var camera = entity.playerNumber || 0;
        voidjs.camera.shake(camera, shake, 250);
        voidjs.audio.play('hurt', 1);
      }
    };
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
    entity.life = 10;
    entity.max_life = entity.life;
    entity.active_scripts.register(voidjs.scripts.life(entity));
    entity.kill = function() {
      entity.SetActive(false);
      var amount = 10;
      var r = Math.PI *2; // 30 degrees freedom
      for (var i = 0; i < amount; i++) {
        var vel = vcore.a2v(Math.random() * r, Math.random() * 7 + 3);
        var pos = entity.GetPosition();
        voidjs.entityCreator.create('particle', [pos, vel, c[3], 2, [1000, 2000], 0.1]);
      }
    };
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
voidjs.items.gun = function(smart, damage, speed, cooldown, magazine, reload_time) {
  if (speed === undefined) {
    speed = 8;
  }
  if (!cooldown) {
    cooldown = 250; // milliseconds
  }
  if (!magazine) {
    magazine = 3; // shots
  }
  if (!reload_time) {
    reload_time = 1000; // milliseconds
  }
  var acd = 0; // active cooldowns
  var bullets = magazine;

  return function(self) {
    var target = voidjs.entities[self.target];
    //console.log(target);
    if (self.IsActive()) {
      if (acd > 0) {
        acd-= voidjs.fps;
      } else {
        // No cooldown active
        // Activate the cooldown
        acd = cooldown;
        if (--bullets <= 0) {
          // Refill the magazine
          bullets = magazine;
          // Apply reload time
          acd = reload_time;
        }
        // Shoot at target
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
    }
  };
};
voidjs.items.player_shield = function(damage, cooldown) {
  if (damage === undefined) {
    damage = 100;
  }
  if (!cooldown) {
    cooldown = 500; // milliseconds
  }
  // Items are not entities, but they can easily create entities
  // Storing entities in closures is bad.
  // The id is fine because it is not an object
  var shield_id = voidjs.entityCreator.create('player_shield', [cooldown]);
  // Entities are useful for scrips that need to run every frame,
  // but i concede that I need to make an array for non entity scripts
  // to run every frame too.
  return function(self) {
    // Sword and shield are basically the same. Simplify?
    // @TODO: Make this smarter
    var shield = voidjs.entities[shield_id];
    if (self.life > 0 && shield.cd <= 0) {
      shield.life = shield.max_life;
      shield.SetActive(true);
      shield.cd = cooldown;
    }
  };
};
voidjs.activate_item = function(item, args) {
  if (typeof item === 'function') {
    item(args);
  }
  else if (typeof item === 'object') {
    item.script(args);
  }
};
voidjs.items.player_sword = function(damage, cooldown) {
  if (damage === undefined) {
    damage = 100;
  }
  if (!cooldown) {
    cooldown = 500; // milliseconds
  }

  // Que creation.
  var sword_id = voidjs.entityCreator.create('player_sword', [cooldown]);


  return {
    entity_id: sword_id,
    script: function(self) {
      var sword = voidjs.entities[sword_id];
      if (sword && self.life > 0 && sword.cd <= 0) {
        sword.activation_id++;
        sword.life = sword.max_life;
        sword.SetPosition(self.GetPosition());
        sword.SetLinearVelocity(self.GetLinearVelocity());
        sword.SetActive(true);
        sword.cd = cooldown;
      }
    }
  };
};
// This is a phantom entity
// I'm not even sure this should be an entity?
// Maybe we can do crazy stuff with this as an entity later?
voidjs.descriptions.player_sword = {
    map : [
    ['cd', 'after', 500],
    ['fill', 'style', "#FF0000"],
    ['decay', 'after', [50,100]],
    ['size', 'after', 0.75]
  ],
  style: {
    stroke: false,
    fill: c[3],
    layer: 3
  },
  body: {
    bullet: true,
    angularDamping: 0,
    linearDamping: 0
  },
  scripts: [
    function (args) {
      var bullet = args[1];
      var body = args[0];
      // Return if the body has been hit already by the same activation
      if (body.hit_by !== undefined && body.hit_by[bullet.activation_id] == bullet.id) {
        return;
      }

      if (bullet.life > 0 && body.team !== bullet.team && body.life) {
        // Register a new activation hit
        if (body.hit_by == undefined) { body.hit_by = {}; }
        body.hit_by[bullet.id] = bullet.activation_id;

        if (bullet.damage && body.life) {
          body.life -= bullet.damage;
        }
        // Particles in the reverse direction of the hit:
        var amount = Math.random() * 2 + 1;
        var angle = vcore.v2a(bullet.m_linearVelocity);
        var r = Math.PI / 6; // 30 degrees freedom
        for (var i = 0; i < amount; i++) {
          var vel = vcore.a2v(Math.PI + angle + (Math.random() * 2 * r) -r, Math.random() * 5 + 1);
          var pos = body.GetPosition();
          voidjs.entityCreator.create('particle', [pos, vel]);
        }
        if (body.isPlayer && body.hasCamera) {
          var camera = body.player_number || 0;
          voidjs.camera.shake(camera, 0.2, 250);
          voidjs.audio.play('hurt', 1);
        }
      }
    }
  ],
  fixture: { isSensor: true },
  after: function(entity, args) {
    entity.m_fixtureList.m_shape.SetAsBox(args[3], args[3]);
    entity.angularVelocity = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? -1 : 1);
    entity.life = 0;
    entity.activation_id = 0;
    entity.damage = 500;
    entity.team = 1;
    entity.max_life = 250;//entity.life;
    entity.active_scripts = vcore.scripts();
    entity.active_scripts.register(voidjs.scripts.decay(entity, voidjs.fps));
    entity.active_scripts.register(voidjs.scripts.life(entity));
    entity.cd = args[0];
    entity.m_mass = 0;
    //console.log(args);
    entity.active_scripts.register(function() {
      //entity.SetPosition(voidjs.player.GetPosition());
      if (entity.cd > 0) {
        entity.cd -= voidjs.fps;
      }
    });
    //var b2WeldJoint = Box2D.Dynamics.Joints.b2WeldJoint;
    var b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;
    var joint = new b2WeldJointDef();
    entity.SetPosition(voidjs.player.GetPosition());
    joint.Initialize(entity, voidjs.player, {x:0, y:0});
    voidjs.world.CreateJoint(joint);
    entity.active_scripts.register(voidjs.scripts.fade(entity));
    entity.SetActive(false);
    entity.kill = function() {
      //console.log('sword died');
      if (entity.IsActive()) {
        entity.SetActive(false);
      }
      //voidjs.world.RemoveBody(entity);
    };
  }
};
voidjs.descriptions.player_shield = {
    map : [
    ['cd', 'after', 500],
    ['fill', 'style', c[4]],
    ['decay', 'after', [50,100]],
    ['size', 'after', 0.5]
  ],
  style: {
    stroke: false,
    fill: c[3],
    layer: 3
  },
  body: {
    bullet: true,
    angularDamping: 0
  },
  scripts: [
    function (args) {
      var bullet = args[1];
      var body = args[0];
      if (body.team !== bullet.team){
        console.log(body.team);
        console.log(bullet.team);
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
        //voidjs.world.RemoveBody(bullet);
      }
    }
  ],
  fixture: { isSensor: true },
  after: function(entity, args) {
    entity.m_fixtureList.m_shape.SetAsBox(args[3], args[3]);
    entity.angularVelocity = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? -1 : 1);
    entity.life = 0;
    entity.damage = 500;
    entity.team = 1;
    entity.max_life = 250;//entity.life;
    entity.active_scripts = vcore.scripts();
    entity.active_scripts.register(voidjs.scripts.decay(entity, voidjs.fps));
    entity.active_scripts.register(voidjs.scripts.life(entity));
    entity.cd = args[0];

    entity.active_scripts.register(function() {
      entity.SetPosition(voidjs.player.GetPosition());
      if (entity.cd > 0) {
        entity.cd -= voidjs.fps;
      }
    });
    entity.active_scripts.register(voidjs.scripts.fade(entity));
    entity.kill = function() {
      //console.log('sword died');
      if (entity.IsActive()) {
        entity.SetActive(false);
      }
      //voidjs.world.RemoveBody(entity);
    };
  }
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
        if (body.Inflict) {
          body.Inflict(bullet);
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
        // Goodbye bullet:
        voidjs.world.RemoveBody(bullet);
        // @TODO: re-use bullets
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