const express = require('express')
const router = express.Router();

const fs = require('fs'); // for saving stuff
const { writeFile, readFile } = require('fs');

const checkAuth = (req, res, next) => {
    if (!req.session.mod) {
      console.log('attempted')
      return res.redirect('/');
    }
    next();
};

router.get('/info/:id', async (req, res) => {
    let id = req.params.id

    let blipReferenced = blips[id];
    if (!blipReferenced) return res.status(404).json( { 'errors': `blip ${id} not found. please double check the blip id`})

    return res.status(200).json(blipReferenced)
})

router.get('/delete/:id', checkAuth, async (req, res) => {
    let id = req.params.id

    let blipToDelete = blips[id];
    console.log(blipToDelete, id)
    if (!blipToDelete) return res.status(404).json( { 'errors': `blip ${id} not found. please double check the blip id`})

    delete blips[id];

    writeFile('./jsons/blips.json', JSON.stringify(blips), (error) => {res.status(500).json( { 'errors': error})})
    
    return res.status(200).json(blips)
})

module.exports = router;