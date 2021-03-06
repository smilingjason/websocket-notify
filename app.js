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
        var s = sub_a[i];
        //if (s)
        sub_a[i].emit('message', msg);
    }
    msg += '<br> notify sent to all registered client. ';
    msg += '<br> please switch to your register page to view the notification. ';
    msg += '<br> <a href="modify">modify again</a>';
    res.send(msg);
});


io.on('connection', function(socket){
      //var address = socket.handshake.address;
      var address = socket.request.connection.remoteAddress;
      console.log("New connection from " + address );
      socket.emit('message', 'connection to server established');
      socket.on('subscribe', function (data) {
          console.log(data);
          //var jsondata = JSON.parse(data);
          //console.log(data['target']);
          sub_a = subscribers[data['target']];
          if (sub_a.length >= 10) { // max 10 client for each topic
              sub_a[0].emit('message', 'max client reached, you are disconnected, refresh the page to reconnect');
              for(var i = 0; i < sub_a.length - 1; i++) {
                  sub_a[i] = sub_a[i+1];
              }
              sub_a[sub_a.length - 1] = socket; 
          } else {
              sub_a[sub_a.length] = socket;
          }
          sub_a[sub_a.length - 1].emit('message', 'thanks for register for ' + data['target']);
          socket.emit('sub-result', 'OK');
      });
});


http.listen(process.env.VCAP_APP_PORT || 3000, function() {
    console.log('listen on port %d', http.address().port);
});
