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

//mood types:

var moods = {
  'sad': 0,
  'content': 0,
  'happy': 0
};

function broadcastStatus() {
  data = {
    type: 'moodtracker.status',
    clientsCount: ws.clientsCount,
    moods: moods
  };

  console.log('Broadcasting status:',data);

  for (i=0;i<ws.clients.length;i++) {
    if (ws.clients[i])
      ws.clients[i].send(JSON.stringify(data));
  }
}

ws.on('connection',function(socket) {
  var i,
  myMood;

  socket.on('error',function(e) {
    console.log('socker error ',e);
  });

  socket.on('close',function() {
    moods[myMood]--;
    broadcastStatus();
  });

  socket.on('data',function(data) {
    console.log('received "'+data+'"');

    //interpreting as json:
    json = JSON.parse(data);
    if (json.type == 'moodtracker.change' && json.moodName) {
      if (myMood !== undefined) {
        moods[myMood]--;
      }
      myMood = json.moodName;
      moods[myMood]++;
      broadcastStatus();
    }
  });

  console.log('client connected, number of clients:',ws.clientsCount);
  //sending client count to newly connected client
  broadcastStatus();

});
