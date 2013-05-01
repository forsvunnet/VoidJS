var app = require('http').createServer();
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(8080);

io.sockets.on('connection', function (socket) {
  socket.emit('init');
  socket.on('setup', function (data) {
    console.log(data.type);
  });
  // Server knows position of entities
  // Server facilitates control input

  // Client 1 Game

  // Client 2 Control


  // Oh god I hope this can remain simple :(
  // I sincerely hope this socket stuff wont complicate the code
  
  //@TODO:
  // Savegame:
  // Save / Restore client information to a global server.
  // REST call to forsvunnet.co.uk?


  // RPC calls, in even of object getting killed etc.
  // Entities needs ID's
  // First-come-first-serve should work fine
  // Examples of RPC calls could be as follows:
  // RPC('collect', '142');
  // RPC('die', '157');
  // RPC('create', obj);
});