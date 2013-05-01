/*  var socket = io.connect('http://192.168.2.114:8080');
  socket.on('init', function (data) {
    console.log(data);
    socket.emit('setup', { type: 'controller' });
  });
*/

function touchHandler(event) {
  var touches = event.changedTouches,
  first = touches[0],
  type = "";
  switch(event.type) {
    case "touchstart": type = "mousedown"; break;
    case "touchmove":  type = "mousemove"; break;
    case "touchend":   type = "mouseup";   break;
    default: return;
  }

  //initMouseEvent(type, canBubble, cancelable, view, clickCount,
  //           screenX, screenY, clientX, clientY, ctrlKey,
  //           altKey, shiftKey, metaKey, button, relatedTarget);

  /*var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(type, true, true, window, 1,
    first.screenX, first.screenY,
    first.clientX, first.clientY, false,
    false, false, false, 0, null);
  */
  //first.target.dispatchEvent(simulatedEvent);
  event.preventDefault();
}
function init() {
  document.addEventListener("touchstart", touchHandler, true);
  document.addEventListener("touchmove", touchHandler, true);
  document.addEventListener("touchend", touchHandler, true);
  document.addEventListener("touchcancel", touchHandler, true);
}