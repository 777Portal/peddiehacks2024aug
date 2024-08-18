const { clientId, clientSecret, redirectUri, mods} = require('../jsons/config.json');

const { request } = require('undici'); // tried to use native fetch and it made me want to d]e, so we use a library for handling web requests.

const express = require('express')
const router = express.Router();

const fs = require('fs'); // for saving stuff
const { writeFile, readFile } = require('fs');

router.get('/authorize', async (req, res) => {
    if ( req.session.authenticated ) return res.redirect('/');
    const { code } = req.query;
    if ( !code ) return res.redirect('/login');
  
    const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        scope: 'identify',
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const o2authData = await tokenResponseData.body.json();
    if (o2authData.error) return res.redirect('/login')

    let userResult = await request('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${o2authData.token_type} ${o2authData.access_token}`,
      },
    });
    userResult = await userResult.body.json()

    const sessionId = req.session.id; // get session ID so we can safely transport session data between socket and https
    let id = userResult.id

    if ( mods.hasOwnProperty(id) ) req.session.mod = true; // will allow me to delete bad blips

    req.session.authenticated = true;
    req.session.profile = userResult

    sessionData[sessionId] = req.session

    if ( users.hasOwnProperty(id) ) 
    {
        users[id].profile = userResult.profile
        return res.status(200).redirect('/') 
    }

    // so at this point we know the user doesn't exist
    console.log(userResult)

    users[id] = {}; // initiliaze the user info.

    let user = users[id] // then asign the user object so we can modify it
    
    user.firstLogin = new Date()
    user.lastBlip = new Date('2007-1-21')
    user.profile = userResult
    user.isMod = mods.hasOwnProperty(id)

    writeFile('./jsons/users.json', JSON.stringify(users), (error) => {console.error(error, users)}) // update users.json

    return res.status(200).redirect('/')
})

module.exports = router;