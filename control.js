// @TODO:
// Implement a key listening system.
// eg. a listening function in update should call
// if (voids.key.#.check()) {} to see if a key has been pressed
voidjs.control.keydown = function(e) {
  voidjs.control.toggle(e.keyCode, true);
};
voidjs.control.keyup = function(e) {
  var key = voidjs.key;
  if (key.fire) {
    voidjs.activate_item(voidjs.player.inventory.weapon, voidjs.player);
  }
  if(key.select) {
  }

  voidjs.control.toggle(e.keyCode, false);
};
voidjs.control.toggle = function(key, bool) {
  switch (key) {
    // Left
    case 65:
    case 37:
      voidjs.key.left = bool;
    break;
    // Right
    case 68:
    case 39:
      voidjs.key.right = bool;
    break;
    // Up
    case 87:
    case 38:
      voidjs.key.up = bool;
    break;
    // Down
    case 83:
    case 40:
      voidjs.key.down = bool;
    break;
    // Select
    case 13:
    case 93:
      voidjs.key.select = bool;
    break;
    // Fire
    case 32:
      voidjs.key.fire = bool;
    break;
  }
};
voidjs.control.mousedown = function (e) {
  var mouse = voidjs.control.mouse;
  mouse.active = true;
  voidjs.control.mousemove(e);
};
voidjs.control.mouseup = function (e) {
  var mouse = voidjs.control.mouse;
  mouse.active = false;
  voidjs.control.mousemove(e);
};


        //http://js-tut.aardon.de/js-tut/tutorial/position.html
var getElementPosition = function (element) {
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
};
voidjs.control.mousemove = function (e) {
  var canvasPosition = getElementPosition(voidjs.canvas);
  var mouse = voidjs.control.mouse;
  mouse.x = (e.clientX - canvasPosition.x) / 30;
  mouse.y = (e.clientY - canvasPosition.y) / 30;
};