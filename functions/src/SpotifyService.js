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
    clientSecret: clientSecret
});

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
})


module.exports = spotifyServiceAPI;
