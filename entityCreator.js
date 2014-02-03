
voidjs.entityCreator = {};

// Setup fresh box2d definitions
voidjs.entityCreator.init = function () {
    var b2Vec2            = Box2D.Common.Math.b2Vec2,
        b2AABB            = Box2D.Collision.b2AABB,
        b2BodyDef         = Box2D.Dynamics.b2BodyDef,
        b2Body            = Box2D.Dynamics.b2Body,
        b2FixtureDef      = Box2D.Dynamics.b2FixtureDef,
        b2Fixture         = Box2D.Dynamics.b2Fixture,
        b2World           = Box2D.Dynamics.b2World,
        b2ContactListener = Box2D.Dynamics.b2ContactListener,
        b2MassData        = Box2D.Collision.Shapes.b2MassData,
        b2PolygonShape    = Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape     = Box2D.Collision.Shapes.b2CircleShape;

  // Fixture definition
  var fixDef = new b2FixtureDef();
  voidjs.entityCreator.shapes = {
    polygon : new b2PolygonShape(),
    cirle :  new b2CircleShape()
  };
  fixDef.shape = voidjs.entityCreator.shapes.polygon;
  fixDef.shape.SetAsBox(0.2, 0.2);
  voidjs.entityCreator.fixture = fixDef;
  var bodyDef = new b2BodyDef();
  bodyDef.type = b2Body.b2_dynamicBody;

  // Body definition
  voidjs.entityCreator.body = bodyDef;

  // Style definition
  voidjs.entityCreator.style = {};

  // Scripts definition
  voidjs.entityCreator.scripts = 0;

};

// Take a level description and build it
voidjs.entityCreator.buildLevel = function(level) {
  // Make new entities
  var entities = {};
  voidjs.entities = entities;
  for (var type in level) {
    if (type == 'player') {
      continue;
    }
    //eg type = wall
    var struct = level[type];
    // struct = array of walls
    for (var j in struct) {
      var args = struct[j];
      voidjs.entityCreator.create(type, args, 0, 0);
    }
  }

};
// Storage for entities attempted to be created inside a world step
voidjs.entityCreator.late = [];

// Create an entity or procastinate it untill the end of the step
voidjs.entityCreator.create = function(type, args, id, delay) {
  if (delay === undefined) {
    delay = 1;
  }
  if (!voidjs.world.IsLocked() && !delay) {
    voidjs.entityCreator.prepare(type, args);
    var entity = voidjs.entityCreator.build(args, id);
    id = entity.id;
    voidjs.entities[id] = entity;
  } else {
    id = voidjs.entityCreator.id();
    voidjs.entityCreator.late.push([type, args, id]);
  }

  // Keep track of entities
  if (voidjs.entity_type_tracker[type] === undefined) {
    voidjs.entity_type_tracker[type] = [];
  }
  voidjs.entity_type_tracker[type].push(id);
  return id;
};

// Loop through the storage and create new entities
voidjs.entityCreator.lateCreate = function() {
  var late = voidjs.entityCreator.late;
  for (var i = 0; i < late.length; i++) {
    voidjs.entityCreator.create(late[i][0], late[i][1], late[i][2], 0);
  }
  voidjs.entityCreator.late = [];
};

// Create a new id
voidjs.entityCreator.id = function() {
  return millis() + '_' + voidjs.entity_index();
};

// Build an entity
voidjs.entityCreator.build = function(args, id) {
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var world = voidjs.world;
  //console.log(voidjs.entityCreator.body);
  var entity = world.CreateBody(voidjs.entityCreator.body);
  if (id) {
    entity.id = id;
  }
  else {
    entity.id = voidjs.entityCreator.id();
  }
  //console.log(voidjs.entityCreator.fixture.shape);
  if (voidjs.entityCreator.fixture.shape.m_vertexCount === 0) {
    voidjs.entityCreator.fixture.shape.SetAsBox(0.2, 0.2);
  }

  entity.CreateFixture(voidjs.entityCreator.fixture);
  // Short-link vertices
  entity.vertices = entity.m_fixtureList.m_shape.m_vertices;
  entity.draw = voidjs.stencil.drawEntity;
  entity.style = voidjs.entityCreator.style;
  voidjs.entityCreator.style = {};

  // Creates a new instance of a script register
  // It's quite complex code so better leave it at that
  entity.scripts = vcore.scripts();
  var script, i;
  if (voidjs.entityCreator.scripts) {
    for (i in voidjs.entityCreator.scripts) {
      script = voidjs.entityCreator.scripts[i];
      entity.scripts.register(script);
    }
  }
  if (voidjs.entityCreator.after) {
    voidjs.entityCreator.after(entity, args);
  }
  return entity;
};
/*// - Chrome code:
var p = voidjs.player;
var f = p.GetFixtureList();
p.vertices = f.m_shape.m_vertices;
f.m_shape.SetAsVector([{x:0, y:-.2}, {x: .2, y: .2}, {x: -.2, y: .2}]);
//*/

// Prepare an entity
voidjs.entityCreator.prepare = function (type, args) {
  var i;
  var def = {
    'body': voidjs.entityCreator.body,
    'fixture': voidjs.entityCreator.fixture,
    'style': voidjs.entityCreator.style
  };

  // Look for a description:
  if (voidjs.descriptions.hasOwnProperty(type)) {
    // Hello there <TYPE>, what is your description?
    var description = voidjs.descriptions[type];

    // Reset defaults
    voidjs.entityCreator.reset(description);

    // Apply default mappings:
    // I defined the mapping format like this because body, fixture
    // and style attributes might be in a jumbled order.
    var map = [
      ['x', 'body'],
      ['y', 'body'],
      ['width', 'fixture', 1],
      ['height', 'fixture', 1],
      ['rotation', 'body', 0]
    ];

    var data = {}; // A temporary data obj used by the specials
    var special = voidjs.descriptions_special;

    // Override defaults with description definitions
    if (description.map !== undefined) {
      map = [];
      for (i =0; i < description.map.length; i++) {
        var key = description.map[i];
        var arguments = voidjs.descriptions_map[key];

        // The key and arguments must be consolidated because
        // right now they look like this:
        // Key = 'width'
        // Arguments = ['fixture', 1]

        // Build a packet with keys and arguments
        var packet = [key];
        for (j = 0; j < arguments.length; j++) {
          packet.push(arguments[j]);
        }

        // Place the packet in the map
        map.push(packet);
      }
    }
    var required = 0;
    for (i = 0; i < map.length; i++) {
      required = i;
      if (map.length > 2) {
        break;
      }
    }
    //if (description.required !== undefined) { required = description.required; }
    // @TODO: Count required instead
    //if (description.special !== undefined) { special = description.special; }
    if (description.scripts !== undefined) { voidjs.entityCreator.scripts = description.scripts; }
    if (description.after !== undefined) { voidjs.entityCreator.after = description.after; }

    // Make sure the required amount of arguments have been passed
    if (args.length < required) {
      alert(type + ' does not have the required amount of arguments in the level description');
      return;
    }

    // Loop through attributes and set them one by one
    for (i = 0; i < map.length; i++) {
      // The map is grouped by what type
      var attribute = map[i];
      var key = attribute[0];
      var value;
      if (i < args.length) {
        // In case of an array it means it carries a default.
        // If the arg length is greater than the current map
        // it means that the level description overrides the default.
        value = args[i];
      }
      else {
        // ... otherwise use the default.
        value = attribute[2];
        // + pass it back up the line
        args[i] = attribute[2];
      }

      // Always store the value (so it can be used in after or in a special)
      data[key] = value;

      if (key in special) {
        if (special[key]) {
          // If a callback is not false, run it.
          special[key](def[attribute[1]], data);
        }
      }
      else if (attribute[1] != 'after') { // After is not a valid def
        // No special treatment for the key, let it pass
        // Apply the value to the definition

        def[attribute[1]][key] = value;
        //console.log('def[' + attribute[1] + '][' + key + '] = ' + value);
      }
    }

    // In the case of width and height it needs to be applied to shape
  }
  else {
    alert('Type: ' + type + ' not found in descriptions');
  }
};

// Reset an entity
voidjs.entityCreator.reset = function (description){
  voidjs.entityCreator.style = {};
  var def = {
    'body': voidjs.entityCreator.body,
    'fixture' : voidjs.entityCreator.fixture,
    'style' : voidjs.entityCreator.style
  };

  voidjs.entityCreator.scripts = 0;
  voidjs.entityCreator.after = 0;

  // Fixture defaults
  def['fixture'].density = 1.0;
  def['fixture'].friction = 0.5;
  def['fixture'].restitution = 0.2;
  def['fixture'].isSensor = false;
  def['fixture'].shape = voidjs.entityCreator.shapes.polygon;
  def['fixture'].shape.m_normals = [];
  def['fixture'].shape.m_vertices = [];
  def['fixture'].shape.m_vertexCount = 0;

  // Body defaults
  def['body'].type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  def['body'].linearDamping = 2;
  def['body'].angularDamping = 2;
  def['body'].bullet = false;
  def['body'].position = {x:0, y:0};

  // Style defaults
  def['style'].layer = 0;
  def['style'].stroke = 0;
  def['style'].fill = 0;

  var i, j, props = ['body', 'fixture', 'style'];
  
  for (i in props){
    var property = props[i];
    if (description && description[property]) {
      for (j in description[property]) {
        if (description[property].hasOwnProperty(j)){
          def[property][j] = description[property][j];
        }
      }
    }
  }
};

voidjs.entityCreator.create_spawners = function(level) {
  // @TODO: Allocation  (infi loop untill all allocated slots have been placed (of different types))

  // Copy the locations of possible spawn locations:
  var locations = [];
  for (var i = 0; i < voidjs.entity_type_tracker.background.length; i++) {
    var bgi = voidjs.entity_type_tracker.background[i];
    var background = voidjs.entities[bgi];
    var pos = background.m_fixtureList.m_shape.m_centroid;
    locations.push([pos.x, pos.y]);
  }

  // @TODO: Base allocation on a difficulty variable (Amount of players * progression etc..)
  var allocations = {
    'sentry': 50,
    'shard': 50
  };
  for (var type in allocations) {
    var number = allocations[type];
    while (number > 0 && locations.length > 0) {
      // @TODO: Smarter placement (no entity placement near checkpoints)
      var index = parseInt(Math.random() * locations.length, 10);
      var loc = locations.splice(index, 1);
      voidjs.entityCreator.create(type, loc[0], 0, 0);
      number--;
    }
  }
};