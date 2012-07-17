voidjs.descriptions = {};
voidjs.descriptions.wall = {
  map: [['vertices', 'fixture']],
  required : 1,
  special: { 'vertices': vcore.aTob2Vec2 },
  body: { type: Box2D.Dynamics.b2Body.b2_staticBody },
  style: {fill: '#223033', layer: 20}
};
voidjs.descriptions.background = {
  map: [['vertices', 'fixture']],
  required : 1,
  special: { 'vertices': vcore.aTob2Vec2 },
  body: {type: Box2D.Dynamics.b2Body.b2_staticBody},
  fixture: {isSensor: true},
  style:{fill: '#0099FF'}
};

voidjs.descriptions.player = {
  map : [
    ['x', 'body'],
    ['y', 'body']
  ],
  body: { linearDamping: 10 },
  style: {
    fill: '#fff',
    stroke: false,
    layer: 10
  },
  after: function(entity) {
    entity.checkpoint = false;
    entity.isPlayer = true;
    entity.team = 1;
    entity.active_scripts = vcore.scripts();
    entity.GetFixtureList().m_shape.SetAsBox(0.2, 0.2);
    entity.kill = function() {
      entity.SetActive(false);
      entity.active_scripts.register(voidjs.scripts.spawner());
    };
    voidjs.player = entity;
    //console.log('Player:');
    //console.log(entity);
  }
};

voidjs.descriptions.sentry = {
  map : [
    ['x', 'body'],
    ['y', 'body']
  ],
  scripts: [ voidjs.scripts.sentry ],
  style: {
    fill: '#F09',
    stroke: false,
    layer: 10
  },
  body: {type: Box2D.Dynamics.b2Body.b2_staticBody},
  //fixture: {},
  after: function(entity) {
    entity.active_scripts = vcore.scripts();
    entity.isAI = 1;
    entity.team = 2;
    entity.target_range = 5;
    entity.inventory = {
      weapon: voidjs.items.gun(5)
    };
  }
};
voidjs.items = {};
voidjs.items.gun = function(damage, speed, cooldown) {
  if (speed === undefined) {
    speed = 5;
  }
  if (!cooldown) {
    cooldown = 1000; // milliseconds
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
      var p2 = target.GetPosition();

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
      var d = vcore.a2v(angle, 0.5);

      definition.position = {x: p1.x + d.x, y: p1.y + d.y};
    }
  },
  style: {
    fill: '#FF9',
    stroke: false,
    layer: 11
  },
  body: {
    bullet: true,
    linearDamping: 0
  },
  fixture: { isSensor: true },
  scripts: [
    function (args) {
      if (args[0].team !== args[1].team){
        voidjs.world.RemoveBody(args[1]);
      }
    }
  ],
  after: function(entity) {
    // Set to team 0 to allow Friendly Fire
    entity.team = 2;
    entity.m_fixtureList.m_shape.SetAsBox(0.1, 0.1);
    b.push(entity);
  }
};
b = [];
vpp = function () {
  p = voidjs.player.m_xf.position;
  voidjs.entityCreator.prepare('sentry', [p.x, p.y]);
  var entity = voidjs.entityCreator.build();
  voidjs.entities[entity.id] = entity;
  //console.log(entity);
};


voidjs.descriptions.checkpoint = {
  fixture: {isSensor: true},
  scripts: [
    voidjs.scripts.checkpoint
  ],
  style: {layer: 1}
};
voidjs.descriptions.end = {
  fixture: {isSensor: true},
  scripts: [
    voidjs.scripts.finish
  ],
  style: {layer: 1}
};