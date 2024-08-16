const express = require('express')
const app = express()

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const fs = require('fs');
const { getPackedSettings } = require('http2');

const port = 3000

app.use('/assets', express.static('assets'))

app.get('/', (req, res) => {
    console.log(req)
    return res.sendFile('landing.html', { root: './pages' });
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
