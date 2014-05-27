var http = require('http'),
  fs = require('fs'),
  socketio = require('socket.io');

function handler(req, res) {
  fs.readFile(__dirname + '/index.html',
    function(err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }

      res.writeHead(200);
      res.end(data);
    });
}

var app = http.createServer(handler);

app.listen(80);
var io = socketio.listen(app);

io.sockets.on('connection',function(socket) {
  console.log('client connected',socket.handshake);
});
