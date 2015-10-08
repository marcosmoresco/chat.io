var http = require('http'),
  express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser');

var app = express(),
  nicknames = {};

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(bodyParser());
app.use(session({
  secret: 'keyboard cat',
  key: 'express.sid',
  store: new session.MemoryStore()
}));

app.get('/test', function(req, res) {
  res.send('<h1> ArkHam Chat <h1>');
});

var user = null;
app.get('/', function(req, res) {

  if (!!req.session.logged) {
    user = req.session.nickname;
    console.log('user ' + user);
    res.sendFile(__dirname + '/index.html');
  } else {
    res.sendFile(__dirname + '/auth.html');
  }

});


app.post('/auth', function(req, res) {

  var timeoutSession = 10; //10 seconds
  nicknames[req.body.nickname] = req.body.nickname;
  req.session.logged = true;
  req.session.nickname = req.body.nickname;
  req.session.cookie.expires = new Date(Date.now() + (10000 * timeoutSession));
  res.redirect('/');
});

var server = app.listen(3001, function() {
  console.log('[Listening on port %d]', server.address().port);
});

var io = require('socket.io').listen(server);

io.on('connection', function(socket) {
  socket.nickname = user;
  console.log('a user connected');

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg) {
    console.log(socket.nickname + ' - msg = ' + msg);
    var msgJson = {};
    msgJson.msg = socket.nickname + ' : ' + msg;
    msgJson.nickname = socket.nickname;

    io.emit('chat message', msgJson);
    io.sockets.emit('nicknames', nicknames);
  });

  socket.on('nickname', function(nick) {
    console.log(socket.id);
    nicknames[nick] = nick;
    socket.broadcast.emit('announcement', nick + ' connected');
    io.sockets.emit('nicknames', nicknames);

  });

  socket.on('get all users', function() {
    io.emit('nicknames', nicknames);
  });

});
