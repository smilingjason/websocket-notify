var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')))
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies

var subscribers= {};
subscribers['A'] = [];
subscribers['B'] = [];

app.get("/", function(req, res) {
    res.sendfile('index.html');
});

app.get("/a", function(req, res) {
    res.sendfile('a.html');
});

app.get("/b", function(req, res) {
    res.sendfile('b.html');
});

app.get("/modify", function(req, res) {
    res.sendfile('modify.html');
});

app.post("/modify", function(req, res) {
    var target = req.body.mytarget;
    var newvalue = req.body.newvalue;
    var msg = target + ' was changed to new value:' + newvalue;
    console.log(msg);
    var sub_a = subscribers[target];
    for(var i = 0; i < sub_a.length; i++) {
        sub_a[i].emit('message', msg);
    }
    msg += '<br> notify sent to all registered client. '
    res.send(msg);
});


io.on('connection', function(socket){
      console.log('a user connected');
      socket.emit('message', 'connection to server established');
      socket.on('subscribe', function (data) {
          console.log(data);
          //var jsondata = JSON.parse(data);
          console.log(data['target']);
          sub_a = subscribers[data['target']];
          sub_a[sub_a.length] = socket;
          sub_a[0].emit('message', 'thanks for register for ' + data['target']);
          socket.emit('sub-result', 'OK');
      });
});


http.listen(process.env.VCAP_APP_PORT || 3000, function() {
    console.log('listen on port %d', http.address().port);
});
