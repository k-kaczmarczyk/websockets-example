var http = require('http'),
  fs = require('fs'),
  ws = require('websocket.io');

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
var ws = ws.attach(app);

ws.on('error',function(error) {
  console.log('error');
});

ws.on('connection',function(socket) {
  socket.on('error',function(e) {
    console.log('socker error ',e);
  });
  console.log('client connected, number of clients:',ws.clientsCount);
  //sending client count to newly connected client
  data = {
    clientCount: ws.clientsCount
  };
  socket.send(JSON.stringify(data));
});
