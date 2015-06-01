voidjs.descriptions = {};
voidjs.descriptions_map = {
  'vertices': ['fixture'],
  'x': ['body'],
  'y': ['body'],
  'width': ['fixture', 0.3],
  'height': ['fixture', 0.3],
  'mode': ['after', 0],
  'cd': ['after', 500],
  // 'fill': ['style', "#FF0000"],
  'decay': ['after', [50,100]],
  'size': ['after', 0.75],
  'p1': ['body'],
  'p2': ['body'],
  'speed': ['body'],
  'damage': ['body'],
  'position': ['body'],
  'velocity': ['body'],
  'fill': ['style', c[4]],
  'linearDamping': ['body', 2],
};

voidjs.descriptions_special = {
  'x' : 0,
  'y' : function (definition, data) {
    // definition = bodyDef
    definition.position = new Box2D.Common.Math.b2Vec2(data['x'], data['y']);
  },
  'width' : 0,
  'height' : function (definition, data) {
    // definition = fixtureDef
    definition.shape.SetAsBox(data['width'], data['height']);
  },
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
  },
  'position': 0,
  'velocity' : function(definition, data) {
    var p1 = data['position'];
    var d  = data['velocity'];
    definition.position = {x: p1.x, y: p1.y};
    definition.linearVelocity = d;
  },
  'vertices': vcore.aTob2Vec2
};

// Walls
voidjs.descriptions.wall = {
  map: ['vertices'],
  required : 1,
  body: { type: Box2D.Dynamics.b2Body.b2_staticBody },
  style: {fill: c[0], stroke: c[1], layer: 20}
};

// Like wall, just no collision
voidjs.descriptions.background = {
  map: ['vertices'],
  required : 1,
  body: {type: Box2D.Dynamics.b2Body.b2_staticBody},
  fixture: {isSensor: true},
  style:{fill: c[2], stroke: c[1]}
};

// A simple collectible
voidjs.descriptions.shard = {
  map : ['x', 'y', 'width', 'height'],
  body: {type: Box2D.Dynamics.b2Body.b2_staticBody},
  fixture: {isSensor: true},
  style:{fill: 0, stroke: c[3], layer: 9},
  scripts: [voidjs.scripts.collectible]
};

// Players
voidjs.descriptions.player = {
  map : ['x', 'y'],
  body: { linearDamping: 10 },
  style: {
    fill: c[3],
    stroke: false,
    layer: 10
  },
  active_scripts: [
    voidjs.scripts.life,
    voidjs.scripts.regen
  ],
  after: function(entity) {
    entity.checkpoint = false;
    entity.isPlayer = true;
    entity.hasCamera = true;
    entity.player_number = voidjs.player.length;
    entity.camera = vcore.camera();
    entity.canvas = vcore.canvas(entity.player_number);
    entity.team = 1;
    entity.life = 10;
    entity.max_life = 10;
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
      entity.active_scripts.register(voidjs.scripts.spawner(entity));
    };
    voidjs.player.push(entity);
    voidjs.fullscreen();
    entity.inventory = voidjs.inventory.new();
    entity.Inflict = function( bullet, shake ) {
      if (bullet.damage && entity.life) {
        entity.life -= bullet.damage;
        console.log( entity.life );
      }
      if (shake === undefined) {
        shake = 0.2;
      }
      if (shake && entity.isPlayer && entity.camera) {
        entity.camera.shake(shake, 250);
        voidjs.audio.play( 'hurt', 1 );
      }
    };
  }
};

// Simple sentries
voidjs.descriptions.sentry = {
  map : ['x', 'y', 'mode'],
  scripts: [ voidjs.scripts.sentry ],
  active_scripts: [
    voidjs.scripts.life,
  ],
  style: {
    fill: c[4],
    stroke: false,
    //art: {main : { vertices: vcore.scale(voidjs.shapes.sentry)}},
    layer: 10
  },
  body: {type: Box2D.Dynamics.b2Body.b2_staticBody},
  after: function(entity, args) {
    entity.life = 3;
    entity.max_life = entity.life;
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
      weapon: voidjs.items.sentry_gun(smart, damage, speed)
    };


    entity.Inflict = function( bullet, shake ) {
      if (bullet.damage && entity.life) {
        entity.life -= bullet.damage;
        console.log( entity.life );
      }
    };
  }
};

/**
 * Sword entity description ( player )
 * @progress 60%
 * @type description
 */
voidjs.descriptions.player_sword = {
  map : ['cd', 'fill', 'decay', 'size'],
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
  scripts: [voidjs.scripts.item_sword],
  fixture: { isSensor: true },
  active_scripts: [
    [voidjs.scripts.decay, voidjs.fps],
    voidjs.scripts.cooldown,
    voidjs.scripts.life,
    voidjs.scripts.fade
  ],
  after: function(entity, args) {
    entity.m_fixtureList.m_shape.SetAsBox(args[3], args[3]);
    entity.angularVelocity = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? -1 : 1);
    entity.life = 0;
    entity.activation_id = 0;
    entity.damage = 500;
    entity.team = 1;
    entity.max_life = 250;//entity.life;
    entity.cd = args[0];
    entity.m_mass = 0;

    var b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;
    var joint = new b2WeldJointDef();

    entity.SetActive(false);
    entity.kill = function() {
      if (entity.IsActive()) {
        entity.SetActive(false);
      }
    };
  }
};
voidjs.descriptions.player_shield = {
  map : ['cd', 'fill', 'decay', 'size'],
  style: {
    stroke: false,
    fill: c[3],
    layer: 3
  },
  body: {
    bullet: true,
    angularDamping: 0
  },
  scripts: [voidjs.scripts.item_shield],
  active_scripts: [
    [voidjs.scripts.decay, voidjs.fps],
    voidjs.scripts.life,
    voidjs.scripts.fade,
    voidjs.scripts.cooldown
  ],
  fixture: { isSensor: true },
  after: function(entity, args) {
    entity.m_fixtureList.m_shape.SetAsBox(args[3], args[3]);
    entity.angularVelocity = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? -1 : 1);
    entity.life = 0;
    entity.damage = 500;
    entity.team = 1;
    entity.max_life = 250;//entity.life;
    entity.cd = args[0];

    entity.kill = function() {
      if (entity.IsActive()) {
        entity.SetActive(false);
      }
    };
  }
};
voidjs.descriptions.bullet = {
  map : ['p1', 'p2', 'speed', 'damage'],
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
        var r = Math.PI / 3; // 60 degrees freedom
        for (var i = 0; i < amount; i++) {
          var vel = vcore.a2v(Math.PI + angle + (Math.random() * 2 * r) -r, Math.random() * 3 + 2);
          var pos = bullet.GetPosition();
          voidjs.entityCreator.create('particle', [pos, vel, '#FFFF55', 2, [200, 400], Math.random() * 0.1 + 0.07]);
        }
        // Goodbye bullet:
        voidjs.world.RemoveBody(bullet);
        // @TODO: re-use bullets
      }
    }
  ],
  after: function(entity, args) {
    // Set to team 0 to allow Friendly Fire
    if ( undefined === args[4] )
      entity.team = 2;
    else
      entity.team = args[4];
    entity.damage = args[3];
    entity.m_fixtureList.m_shape.SetAsBox(0.1, 0.1);
  }
};

voidjs.descriptions.particle = {
  map : ['position', 'velocity', 'fill', 'linearDamping', 'decay', 'size'],
  style: {
    stroke: false,
    layer: 20
  },
  body: {
    bullet: true,
    angularDamping: 0
  },
  fixture: { isSensor: true },
  active_scripts: [
    [voidjs.scripts.decay, voidjs.fps],
    voidjs.scripts.life,
    voidjs.scripts.fade
  ],
  after: function(entity, args) {
    entity.m_fixtureList.m_shape.SetAsBox(args[5], args[5]);
    entity.angularVelocity = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? -1 : 1);
    entity.life = Math.random() * (args[4][1] - args[4][0]) + args[4][0];
    entity.max_life = entity.life;

    // @TODO: BUG @BUG: style.fill should already be filled in
    entity.style.fill = args[2];

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
