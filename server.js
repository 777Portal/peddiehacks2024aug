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

const fs = require('fs'); // for saving stuff
const { writeFile, readFile } = require('fs');

const authentication = require("./routes/authentication") // import auth routes
app.use('/api/v1/auth/', authentication)

const blipRoutes = require("./routes/blips") // import auth routes
app.use('/api/v1/blips/', blipRoutes)

const selfRoutes = require("./routes/self") // import auth routes
app.use('/api/v1/self/', selfRoutes)

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
      socket.emit('BLIPS', blips)
    })

    socket.on('CREATEBLIP', async (eventInfo) =>{
      let link = eventInfo.link,
          thought = eventInfo.thought,
          animation = eventInfo.animation,
          x = eventInfo.x,
          y = eventInfo.y

      thought = thought.substr(0, 300)

      console.log(link)

      if (!socketSessionData.authenticated) return socket.emit('ERR', {error: 'Not logged in!'});

      let animations = ['discord', 'guitar', 'blackCat', 'neutralFace', 'camera']; // have to move this to config at some point for easier access

      if (!animations.includes(animation)) return socket.emit('ERR', {error: 'That type doesn\'t exist!'});

      let userLastBlip = users[socketSessionData.profile.id].lastBlip // get their last blip

      diff = getSecondDiff(new Date(), userLastBlip) // check if the last blip was within 30s

      if (diff < 30) return socket.emit('ERR', {error: 'You are still on cooldown!'}) //  if it was return,

      const response = await fetch('https://open.spotify.com/oembed?url=' + link);
      if (!response.ok) return console.error(`Response status error: ${response.status} on blip.`); // ensure its an actual spotify song
      const spotifyJson = await response.json();
      
      let uuid = crypto.randomUUID(); // get random uuid
      while (blips[uuid] ){ //  if it already exists remake it
        uuid = crypto.randomUUID();
      }

      let profile = socketSessionData.profile

      // finally declare all the fun stuff
      blips[uuid] = {};
      blips[uuid].userId = profile.id;
      blips[uuid].html = spotifyJson.html;
      blips[uuid].scale = 1;
      blips[uuid].x = x;
      blips[uuid].y = y;
      blips[uuid].text = thought;
      blips[uuid].type = animation;
      blips[uuid].id = uuid;
      blips[uuid].creationTime = new Date();

      users[socketSessionData.profile.id].lastBlip = new Date(); // and update this so they can't span the heck out of the website without different accounts

      console.log()

      
      console.log(link, thought, animation, x, y)
      // and update all clients that the new blip has been created.
      socket.emit('BLIPS', blips)
      writeFile('./jsons/blips.json', JSON.stringify(blips), (error) => {console.error(error, blips)}) // update users.json
    })


  socket.on('disconnect', function () {
     console.log('A user disconnected');
  });
});

server.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

function getSecondDiff(secondDate, firstDate) 
{
  const secondsDiff = Math.abs(secondDate - firstDate) / 1000;
  return secondsDiff
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
