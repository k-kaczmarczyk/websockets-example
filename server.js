var http = require('http'),
  url = require('url'),
  path = require('path'),
  fs = require('fs'),
  ws = require('websocket.io'),
  io = require('socket.io')(8080);

function handler(req, res) {
  var uri = url.parse(req.url).pathname,
  filename = path.join(process.cwd(),uri);

  if (fs.exists(filename,function(exists) {
    if(!exists) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    console.log('handler',uri,filename);

    fs.readFile(filename, "binary", function(err, data) {
      if (err) {
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
      }

      res.writeHead(200);
      res.write(data, "binary");
      res.end();
    });

  }));
}

var app = http.createServer(handler);
app.listen(80);



var ws = ws.attach(app);

ws.on('error',function(error) {
  console.log('error');
});

io.sockets.on('connection',function(socket) {
  console.log('Connected to socket.io');
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

  //sending client count to newly connected client
  broadcastStatus();

});
