const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const db = admin.firestore();
const fetch = require('node-fetch');
const btoa = require('btoa');
const axios = require('axios').default;
const qs = require('querystring');
const spotifyServiceAPI = express();
const request = require('request');
const spotifyWebAPI = require('spotify-web-api-node');
const querystring = require('querystring');

const authEndpoint = 'https://accounts.spotify.com/authorize';


const { clientId, clientSecret, redirectUri, scopes } = require('../../backend/config/spotifyConfig');

const spotifyAPI = new spotifyWebAPI({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
});

const state = 'abc';

const authCode = 'AQDRnWhT-l_6nvEl6e5qDjL2EaVIrDKwyoB05PJ7YRlnLab8d5my-4cGPaWTnuoIdybjyhuHWix4NMB0qurfK5CIoXqUHUllrX6mOynLhHOeyQPjgbS5RhDacTlhtfmW5jgMA5UHeio7gYkOFNQlpWNQPmdyOjvUXWf7n2US_hW8RprfSrQa9YjJfHUm8yjTb5st5E1vSQ4QIL6HeW2P98vc5ISD0ycXBE8DwlqHcGv-3LPjNnQBzK97JM_hMVAJLTRZrRBB4SQhAq8DFOOXWA_Sa26xWJqfzspV2sT24iT7EQJ0tyvF77_aAPBWcrP73TL9pXztW1ODmur-jjbslXuFvSdDg4h-yGc9p4DSPoOK3fVEvA';
let code = ''
const _getToken = async () => {

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=authorization_code'
    });

    const data = await result.json();
    return data.access_token;
}


spotifyServiceAPI.get('/', (req, res) => {
    const authorizeURL = spotifyAPI.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL);
})


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

// GET: Spotify callback with authorization code 
spotifyServiceAPI.get('/callback/', (req, res) => {

    axios.post('https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: redirectUri
        }),
        {
            headers:
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
            },
        })
        .then(data => {
            const accessToken = data.data.access_token;
            const expiresIn = data.data.expires_in;
            const refreshToken = data.data.refresh_token;
            res.send({ accessToken, expiresIn, refreshToken });
        })
        .catch(error => {
            console.log(error)
        })
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

//GET: Get all the playlists for a given user

spotifyServiceAPI.get('/:code/playlists/userPlaylists', async (req, res) => {
    const temp = "314szctljxkma77xqelnv67ksnry?si=ziJeGN2_SqWXZlmU0gz8Cw"; //Temp
    const authCode = req.params.code;
    await spotifyAPI.authorizationCodeGrant(code)
        .then(function (data) {
            spotifyAPI.setAccessToken(data.body['access_token']);
            spotifyAPI.setRefreshToken(data.body['refresh_token']);
        }, function (err) {
            console.log('Something went wrong authorizationCodeGrant!', err);
        });

    awaitspotifyAPI.getMe()
        .then(function (data) {
            // "Retrieved data for Faruk Sahin"
            console.log('Retrieved data for ' + data.body['display_name']);

            // "Email is farukemresahin@gmail.com"
            console.log('Email is ' + data.body.email);

            // "Image URL is http://media.giphy.com/media/Aab07O5PYOmQ/giphy.gif"
            console.log('Image URL is ' + data.body.images[0].url);

            // "This user has a premium account"
            console.log('This user has a ' + data.body.product + ' account');
        })
        .catch(function (err) {
            console.log('Something went wrong', err.message);
        });
});


// POST: Create a new playlist for a given user 

spotifyServiceAPI.post('/playlists/userPlaylists/:userID/:playlistName', async (req, res) => {
    const userID = req.params.userID;
    const playlistName = req.params.playlistName;

    await spotifyAPI.authorizationCodeGrant(code)
        .then(data => {
            spotifyAPI.setAccessToken(data.body['access_token']);
            console.log(userID, playlistName);
            return spotifyAPI.createPlaylist(userID, playlistName, { 'public': false });
        })
        .then(responseData => {
            console.log(responseData);
            res.send("Playlist Created!");
        })
        .catch(err => {
            console.log(err.message);
        })
})

module.exports = spotifyServiceAPI;
