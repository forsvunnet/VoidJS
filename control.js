
voidjs.keydown = function(e) {
  switch (e.keyCode) {
    // Left
    case 65:
    case 37:
      voidjs.key.left = true;
    break;
    // Right
    case 68:
    case 39:
      voidjs.key.right = true;
    break;
    // Up
    case 87:
    case 38:
      voidjs.key.up = true;
    break;
    // Down
    case 83:
    case 40:
      voidjs.key.down = true;
    break;

  }
};
voidjs.keyup = function(e) {
  switch (e.keyCode) {
    // Left
    case 65:
    case 37:
      voidjs.key.left = false;
    break;
    // Right
    case 68:
    case 39:
      voidjs.key.right = false;
    break;
    // Up
    case 87:
    case 38:
      voidjs.key.up = false;
    break;
    // Down
    case 83:
    case 40:
      voidjs.key.down = false;
    break;

  }
};