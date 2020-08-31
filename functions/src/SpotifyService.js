const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const db = admin.firestore();
const fetch = require('node-fetch');
const btoa = require('btoa');
const spotifyServiceAPI = express();
const spotifyWebAPI = require('spotify-web-api-node');

const authEndpoint = 'https://accounts.spotify.com/authorize';


const { clientId, clientSecret, redirectUri, scopes } = require('../../backend/config/spotifyConfig');

const spotifyAPI = new spotifyWebAPI({
    clientId: clientId,
    clientSecret: clientSecret,
    grant_type: 'client_credentials'
});

//GET: Get access token using the client credentials
spotifyServiceAPI.get('/token', async (req, res) => {
    await spotifyAPI.clientCredentialsGrant().then(
        function (data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);

            spotifyAPI.setAccessToken(data.body['access_token']);
            res.send(spotifyAPI.getAccessToken());
        },
        function (err) {
            console.log('Something went wrong when retrieving an access token', err);
        }
    );
});

// GET:  Search tracks whose name, album or artist contains the query parameter
spotifyServiceAPI.get('/songs/:queryParameter', async (req, res) => {
    const queryParameter = req.params.queryParameter;
    const searchResults = [];

    //TODO: Try the other authorization method & handle pagination! 
    await spotifyAPI.clientCredentialsGrant()
        .then((data) => {
            spotifyAPI.setAccessToken(data.body['access_token']);
            return spotifyAPI.searchTracks(queryParameter);
        })
        .then((data) => {
            let results = data.body.tracks.items;
            results.forEach((track, index) => {
                searchResults.push(track);
            });
            res.send(searchResults);
        })
        .catch((err) => {
            console.log('Something went wrong:', err.message);
        });
})

// GET: Search artists by the name of the artist 
spotifyServiceAPI.get('/artists/:artist', async (req, res) => {
    const artist = req.params.artist;
    await spotifyAPI.clientCredentialsGrant()
        .then((data) => {
            spotifyAPI.setAccessToken(data.body['access_token']);
            return spotifyAPI.searchArtists(artist);
        })
        .then((data) => {
            const searchResults = data.body.artists;
            res.send(searchResults);
        })
        .catch((err) => {
            console.log('Something went wrong:', err.message);
        });
});

spotifyServiceAPI.get('/playlists/userPlaylists/:userID', async (req, res) => {
    const userID = req.params.userID;
    const temp = "314szctljxkma77xqelnv67ksnry?si=ziJeGN2_SqWXZlmU0gz8Cw"; //Temp

    await spotifyAPI.clientCredentialsGrant()
        .then((data) => {
            spotifyAPI.setAccessToken(data.body['access_token']);

            return spotifyAPI.getUser(userID);
        })
        .then((userData) => {
            const userID = userData.body.id;
            console.log(userID);
            return spotifyAPI.getUserPlaylists(userID);
        })
        .then((playlistData) => {
            const searchResults = playlistData.body;
            res.send(searchResults);
        })
        .catch((err) => {
            console.log('Something went wrong:', err);
        })
});

// // GET: Get a list of tracks using the name of the artist
// spotifyServiceAPI.get('/songs/:artist', async (req, res) => {
//     const artist = req.params.artist;
//     const searchResults = []

//     //TODO: Try the other authorization method & handle pagination! 
//     await spotifyAPI.clientCredentialsGrant()
//         .then((data) => {
//             spotifyAPI.setAccessToken(data.body['access_token']);
//             return spotifyAPI.searchTracks(`artist:${artist}`);
//         })
//         .then((data) => {
//             let results = data.body.tracks.items;
//             results.forEach((track, index) => {
//                 searchResults.push(track);
//             });
//             res.send(searchResults);
//         })
//         .catch(function (err) {
//             console.log('Something went wrong:', err.message);
//         });
// });


// //GET : Get a list of tracks using the name of the track
// spotifyServiceAPI.get("/songs/:trackName", async (req, res) => {
//     const trackName = req.params.trackName;
//     const searchResults = [];

//     await spotifyAPI.clientCredentialsGrant()
//         .then(data => {
//             spotifyAPI.setAccessToken(data.body['access_token']);
//             return spotifyAPI.searchTracks(`track:${trackName}`);
//         })
//         .then(data => {
//             let results = data.body.tracks;
//             results.forEach((track, index) => {
//                 searchResults.push(track);
//             });
//             res.send(searchResults);
//         })
//         .catch(function (err) {
//             console.log('Something went wrong:', err.message);
//         })
// })


module.exports = spotifyServiceAPI;
