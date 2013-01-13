var app = require('http').createServer();
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(8080);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });

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