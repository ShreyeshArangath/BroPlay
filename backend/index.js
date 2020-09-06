const express = require('express');

const main = express();
const port = process.env.PORT || 3000;

const spotify = require('./api/SpotifyService');

main.use('/spotify', spotify);
main.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = main;