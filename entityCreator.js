
voidjs.entityCreator = {};
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
voidjs.entityCreator.buildLevel = function (level) {
  // Make new entities
  var entities = {};
  voidjs.entities = entities;
  for (var type in level) {
    var struct = level[type];
    for (var j in struct) {
      var entity_pair = struct[j];
      var args = entity_pair[0], specs = false;
      if (entity_pair.length > 1) {
        specs = entity_pair[1];
      }
      voidjs.entityCreator.prepare(type, args, specs);
      var entity = voidjs.entityCreator.build();
      entities[entity.id] = entity;
    }
  }

};
voidjs.entityCreator.build = function() {
  var world = voidjs.world;
  var entity = world.CreateBody(voidjs.entityCreator.body);
  entity.id = millis() + '_' + voidjs.entity_index();
  entity.CreateFixture(voidjs.entityCreator.fixture);
  entity.vertices = [];
  for (var i in voidjs.entityCreator.fixture.shape.m_vertices) {
    entity.vertices.push( new b2Vec2(
      voidjs.entityCreator.fixture.shape.m_vertices[i].x,
      voidjs.entityCreator.fixture.shape.m_vertices[i].y
    ));
  }
  entity.draw = voidjs.stencil.drawBox;
  entity.style = voidjs.entityCreator.style;

  // Creates a new instance of a script register
  // It's quite complex code so better leave it at that
  entity.scripts = vcore.scripts();
  if (voidjs.entityCreator.scripts) {
    for (var script in voidjs.entityCreator.scripts) {
      entity.scripts.register(script);
    }
  }
  return entity;
};
voidjs.entityCreator.prepare = function (type, args, specs) {
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
    voidjs.entityCreator.reset(description.defaults);

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
    var required = 2;

    var data = {}; // A temporary data obj used by the specials
    var special = {
      'x' : 0,
      'y' : function (definition, data) {
        definition.position.Set(data['x'], data['y']);
      },
      'width' : 0,
      'height' : function (definition, data) {
        definition.shape.SetAsBox(data['width'], data['height']);
      }
    };

    // Override defaults with description definitions
    if (description.map !== undefined) { map = description.map; }
    if (description.required !== undefined) { required = description.required; }
    if (description.special !== undefined) { special = description.special; }
    if (description.scripts !== undefined) { voidjs.entityCreator.scripts = description.scripts; }

    // Make sure the required amount of arguments have been passed
    if (args.length >= required) {
      alert(type + ' does not have the required amount of arguments in level description');
      return;
    }

    // Loop through attributes and set them one by one
    for (var i = 0; i < map.length; i++) {
      // The map is grouped by what type
      var attribute = map[i];
      var key = attribute[0];
      var value;
      if (args.length < i) {
        // In case of an array it means it carries a default.
        // If the arg length is greater than the current map
        // it means that the level description overrides the default.
        value = args[i];
      }
      else {
        // ... otherwise use the default.
        value = attribute[2];
      }

      // Apply the value to the definition
      if (key in special) {
        data[key] = value;
        // If a callback is defined, run it.
        if (special[key]) {
          special(def[attribute[1]], data);
        }
      }
      else {
        // No special treatment for the key, let it pass
        def[attribute[1]][key] = value;
      }
    }

    // In the case of width and height it needs to be applied to shape
  }
  else {
    alert('Type: ' + type + ' not found in descriptions');
  }
};
voidjs.entityCreator.reset = function (definition){
  var def = {
    'body': voidjs.entityCreator.body,
    'fixture' : voidjs.entityCreator.fixture,
    'style' : voidjs.entityCreator.style
  };

  voidjs.entityCreator.scripts = 0;

  // Fixture defaults
  def['fixture'].density = 1.0;
  def['fixture'].friction = 0.5;
  def['fixture'].restitution = 0.2;
  def['fixture'].shape = voidjs.entityCreator.shapes.polygon;

  // Body defaults
  def['body'].linearDamping = 2;
  def['body'].angularDamping = 2;

  // Style defaults
  def['style'].stroke = 'rgb('+rCol(200)+','+(0)+','+rCol(0)+')';
  def['style'].fill = '#444';

  var property, i;
  for (property in ['body', 'fixture', 'style']){
    if (definition && definition[property]) {
      for (i in definition[property]) {
        if (definition[property].hasOwnProperty(i)){
          def[property][i] = definition[property][i];
        }
      }
    }
  }
};