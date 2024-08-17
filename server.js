const { port, sessionSecretKey} = require('./jsons/config.json');

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

app.use('/assets', express.static('assets')) // public files in ./assets

app.get('/', (req, res) => {
    return res.sendFile('landing.html', { root: './pages' });
})

app.get('/login', (req, res) => {
  return res.sendFile('login.html', { root: './pages' });
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})