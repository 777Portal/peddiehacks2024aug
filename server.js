const { port, sessionSecretKey} = require('./jsons/config.json');

blips = require('./jsons/blips.json');

users = require('./jsons/users.json'); // it feels so wrong, but for my modules to access these vars, they have to not have "var" for global variablility.
console.log(users)

sessionData = {}; // so we can check data between the web scoket and the regular express server w/o having to manually set it on both ends.

const session = require('express-session'); // to remember authentication.
const sessionMiddleware = session({
  secret: sessionSecretKey,
  resave: true,
  saveUninitialized: true,
});

const express = require('express')
const app = express()
app.use(sessionMiddleware)

const server = require('http').createServer(app); // turn into http so we can make socket.io instance

const io = require('socket.io')(server); // socket.io
io.engine.use(sessionMiddleware); // and add that session to the socket.io as well.

const authentication = require("./routes/authentication") // import auth routes
app.use('/api/v1/auth/', authentication)

const blipRoutes = require("./routes/blips") // import auth routes
app.use('/api/v1/blips/', blipRoutes)

app.use('/assets', express.static('assets')) // public files in ./assets

app.get('/', (req, res) => {
    return res.sendFile('landing.html', { root: './pages' });
})

app.get('/login', (req, res) => {
  return res.sendFile('login.html', { root: './pages' });
})

app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
});

//Whenever someone connects this gets executed

let sockets = {};
io.on('connection', function(socket) {
  let socketSessionData = socket.request?.session
  console.log('A user connected', socketSessionData.username);

  socket.on('MOVE', (eventInfo) =>{
      let x = eventInfo.x,
          y = eventInfo.y

      // console.log(x, y)
      socket.emit('BLIPS', blips)
    })

    socket.on('createNewBlip', (eventInfo) =>{
      let link = eventInfo.link,
          thought = eventInfo.thought,
          animation = eventInfo.animation,
          x = eventInfo.x,
          y = eventInfo.y

      console.log(x, y)
      socket.emit('BLIPS', blips)
    })


  socket.on('disconnect', function () {
     console.log('A user disconnected');
  });
});


server.listen(port, () => {
    console.log(`app listening on port ${port}`)
})