var moods = [
  'sad',
  'content',
  'happy'
],
myMood = 'content',
wsConnection = new WebSocket("ws://localhost");
ioConnection = io("http://localhost:8080");

function sendMyMood() {
  wsConnection.send(JSON.stringify({
    type:'moodtracker.change',
    moodName:myMood
  }));
}

function setStatus(txt,el) {
  el = el || 'status';
  document.getElementById(el).textContent = txt;
}

function updateTable(table,updater) {
  [].forEach.call(document.getElementById(table).getElementsByTagName('td'),updater);
}

function setMood(mood) {
  updateTable('my-mood',function(td,idx) {
    if (idx===0)
      return; //leave first untouched
    else if (idx-1 == moods.indexOf(mood))
      td.textContent = 'x';
    else
      td.textContent = '';
  });
  myMood = mood;
  sendMyMood();
}

function updateMoodStats(stats) {
  updateTable('others-mood',function(td,idx) {
    var mood;

    if (idx===0)
      return; //left first one untouched
    mood = moods[idx-1];
    td.textContent = stats[mood];
  });
}



//WebSocket logic

wsConnection.onopen = function() {
  setStatus('Connected');
  sendMyMood();
};

wsConnection.onerror = function(error) {
  setStatus('Error');
};

wsConnection.onmessage = function(e) {
  var data = JSON.parse(e.data);

  setStatus('Got message: '+e.data);
  if (data.type == 'moodtracker.status') {
    setStatus(data.clientsCount,'clients');
    updateMoodStats(data.moods);
  }

};

//Socket.IO logic

ioConnection.on('connect',function() {
  console.log('Connected to socket.io');
});