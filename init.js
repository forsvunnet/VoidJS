function lerp(s,e,t) {
  if (t === undefined) {
    t = 0.2;
  }
  return (s+t*(e-s));
}
var voidjs = {
  canvas : document.getElementById('canvas'),
  key : {
    left:   false,
    right:  false,
    up:     false,
    down:   false
  },
  entities  : {},
  world     : undefined,
  mouse     : undefined,
  init:function() {
    // Set up variables
    var b2Vec2            = Box2D.Common.Math.b2Vec2,
        b2AABB            = Box2D.Collision.b2AABB,
        b2BodyDef         = Box2D.Dynamics.b2BodyDef,
        b2Body            = Box2D.Dynamics.b2Body,
        b2FixtureDef      = Box2D.Dynamics.b2FixtureDef,
        b2Fixture         = Box2D.Dynamics.b2Fixture,
        b2World           = Box2D.Dynamics.b2World,
        b2MassData        = Box2D.Collision.Shapes.b2MassData,
        b2PolygonShape    = Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape     = Box2D.Collision.Shapes.b2CircleShape,
        b2DebugDraw       = Box2D.Dynamics.b2DebugDraw,
        b2MouseJointDef   = Box2D.Dynamics.Joints.b2MouseJointDef
      ;
    var gravity = new b2Vec2(0, 0);
    var world = new b2World(gravity, true);
    voidjs.world = world;
    // Fixtures
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    // Rigidbodies
    var bodyDef = new b2BodyDef();
    bodyDef.linearDamping = 2;
    bodyDef.angularDamping = 2;

    // Make walls
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(20, 2);
    bodyDef.position.Set(10, 400 / 30 + 1.8);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    bodyDef.position.Set(10, -1.8);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    fixDef.shape.SetAsBox(2, 14);
    bodyDef.position.Set(-1.8, 13);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    bodyDef.position.Set(21.8, 13);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
   
    // Create some objects
    bodyDef.type = b2Body.b2_dynamicBody;

    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(0.2, 0.2);
    //console.log(fixDef.shape.SetAsBox);
    bodyDef.position = new b2Vec2(7,7);
    
    var ship = world.CreateBody(bodyDef);
    voidjs.entities.player = ship;
    ship.CreateFixture(fixDef);
    ship.vertices = fixDef.shape.m_vertices;

    // Setup debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(voidjs.canvas.getContext("2d"));
    debugDraw.SetDrawScale(30.0);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    //world.SetDebugDraw(debugDraw);
     
    window.setInterval(this.update, 1000 / 60);
    
    // Mouse
    var mouse = {
      x:undefined,
      y:undefined,
      active:false
    };
    voidjs.mouse = mouse;
    var canvasPosition = getElementPosition(voidjs.canvas);
     
    document.addEventListener("mousedown", function(e) {
      handleMouseMove(e);
      document.addEventListener("mousemove", handleMouseMove, true);
    }, true);
     
    document.addEventListener("mouseup", function() {
      document.removeEventListener("mousemove", handleMouseMove, true);
      mouse.active = false;
    }, true);
     
    function handleMouseMove(e) {
      mouse.x = (e.clientX - canvasPosition.x) / 30;
      mouse.y = (e.clientY - canvasPosition.y) / 30;
      mouse.active = true;
    }

    //helpers

    //http://js-tut.aardon.de/js-tut/tutorial/position.html
    function getElementPosition(element) {
      var elem=element, tagname="", x=0, y=0;
     
      while ((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
         y += elem.offsetTop;
         x += elem.offsetLeft;
         tagname = elem.tagName.toUpperCase();

         if(tagname == "BODY")
            elem=0;

         if(typeof(elem) == "object") {
            if(typeof(elem.offsetParent) == "object")
               elem = elem.offsetParent;
         }
      }

      return {x: x, y: y};
    }

    document.addEventListener("keydown", this.keydown);
    document.addEventListener("keyup", this.keyup);
  }
};