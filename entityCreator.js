
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

  ////////////////////////////////
  // Fixture definition
  ////////////////////////////////
  var fixDef = new b2FixtureDef();
  voidjs.entityCreator.fixture = fixDef;
  voidjs.entityCreator.shapes = {
    polygon : new b2PolygonShape(),
    cirle :  new b2CircleShape()
  };

  ////////////////////////////////
  // Body definition
  ////////////////////////////////
  voidjs.entityCreator.body = new b2BodyDef();

};
voidjs.entityCreator.buildLevel = function (level) {
  for (var type in level) {
    var struct = level[type];
    for (var j in struct) {
      var entity_pair = struct[j];
      var args = entity_pair[0], specs = false;
      if (entity_pair.length > 1) {
        specs = entity_pair[1];
      }
      voidjs.entityCreator.build(type, args, specs);

    }
  }

};
voidjs.entityCreator.build = function (type, args, specs) {
  var bodyDef = voidjs.entityCreator.body;
  var fixDef = voidjs.entityCreator.fixture;

  // Look for a description:
  if (voidjs.prefabs.hasOwnProperty(type)) {
    // Hello there <TYPE>, what is your description?
    var description = voidjs.prefabs[type];

    // Reset defaults
    voidjs.entityCreator.reset(description.defaults);
    // Apply mappings:
    var testmap = ['x', 'y', 'width', 'height', 'rotation'];

    //  var entity = world.CreateBody(bodyDef);
    //}

    // Style

    // Scripts

    //
  }
};
voidjs.entityCreator.reset = function (definition){
  var bodyDef = voidjs.entityCreator.body;
  var fixDef = voidjs.entityCreator.fixture;
  var i;
  if (definition && definition.body) {
    for (i in definition.body) {
      if (definition.body.hasOwnProperty(i)){
        bodyDef[i] = definition.body[i];
      }
    }
  } else {
    // defaults
    bodyDef.linearDamping = 2;
    bodyDef.angularDamping = 2;
  }
  if (definition && definition.fixture) {
    for (i in definition.fixture) {
      if (definition.fixture.hasOwnProperty(i)){
        fixDef[i] = definition.fixture[i];
      }
    }
  } else {
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    fixDef.shape = voidjs.entityCreator.shapes.polygon;
  }

};