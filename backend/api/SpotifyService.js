const express = require('express');
const axios = require('axios').default;
const spotifyServiceAPI = express();
const spotifyWebAPI = require('spotify-web-api-node');
const querystring = require('querystring');
const bodyParser = require('body-parser');


const Spotify = require('../model/Spotify');

let session = new Spotify('');

const authEndpoint = 'https://accounts.spotify.com/authorize';

var code = 'AQDUUILvLcHltrrVUi6X0fyDgoGedcJSRCJQSiQ0IF_JJCaVHZVI0oWaX4v7MBABARFv9noeNNrRadm5lCo7LFoLUvuAqc6ydI2UZHXzDOfmp-UwewJVhSZdU6CZkdaAtdrNUxb4fy7UwjtBprhX6rGkEWFuMcSifoROaANr2izU0didGwP9L-D6wBhf_9xMzJkENQBVBMFDQD3kHAw08rWu8HoZAbWR53Y_bDA1NCrN3YtuoR67t8Zm7UuNt4KuejeLWV607CPvWrBIZfYFiJgpbYGX0qIcDy6wVHv8AgHZSPlI0M-Ro5upOrnna81h2yWlscpoJiXRExFB5FaG42y6J--0UPK8zz9sr1_jvDDeAmtKjA';

const baseAPIPath = process.env.SPOTIFY_PATH || "http://localhost:3000/spotify/";

const { clientId, clientSecret, redirectUri, scopes } = require('../config/spotifyConfig');

const spotifyAPI = new spotifyWebAPI({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
});

const state = 'abc';

spotifyServiceAPI.use(bodyParser.json());
spotifyServiceAPI.use(bodyParser.urlencoded({ extended: true }));

spotifyServiceAPI.get('/', (req, res) => {
    const authorizeURL = spotifyAPI.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL);
})

//Retrieve the profile of the user logged in 
const retrieveUserProfile = (accessToken) => {
    return axios.get('https://api.spotify.com/v1/me', {
        headers: {
            "Authorization": "Bearer " + accessToken
        }
    })
}

//Retrieve an access token given an authorization code
const retrieveAccessToken = (code) => {
    return axios.post('https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri
        }),
        {
            headers:
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
            },
        })
}

/**
 * @api {get} /callback/ Spotify redirect uri with authorization code
 * @apiName callback
 * @apiGroup spotify
 *
 *
 * @apiSuccess {String} dataToSend accessToken, expiresIn, refreshToken
 */
spotifyServiceAPI.get('/callback/', (req, res) => {
    code = req.query.code;
    retrieveAccessToken(req.query.code)
        .then(data => {
            const accessToken = data.data.access_token;
            const expiresIn = data.data.expires_in;
            const refreshToken = data.data.refresh_token;
            const dataToSend = {
                "accessToken": accessToken,
                "expiresIn": expiresIn,
                "refreshToken": refreshToken,
            }
            session.setTokens(accessToken, refreshToken);
            res.send(dataToSend);
        })
        .catch(error => {
            console.log("error")
            res.send(error);
        });

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

//GET: User Information
spotifyServiceAPI.get('/user', async (req, res) => {
    await retrieveUserProfile(session.getTokens().accessToken)
        .then((responseData) => {
            session.setUserId(responseData.data.id);
            res.send(responseData.data)
        })
        .catch((err) => {
            console.log(err);
        })
})


//GET: Get all the playlists for a given user
spotifyServiceAPI.get('/user/userPlaylists', async (req, res) => {
    const accessToken = session.getTokens().accessToken;
    let userId = session.getUserId();
    if (!userId) {
        await axios.get(`${baseAPIPath}/user`).then((data) => {
            session.setUserId(data.data.id);
        });
    }
    const playlistLink = `https://api.spotify.com/v1/users/${userId}/playlists`
    await axios.get(playlistLink,
        {
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        })
        .then((responseData) => {
            console.log(responseData.data.items);
            res.send(responseData.data.items);
        })
        .catch(err => {
            console.log(err)
        });
})

//POST: Create a new playlist 
spotifyServiceAPI.post('/user/userPlaylists', async (req, res) => {
    let userId = session.getUserId();
    const accessToken = session.getTokens().accessToken;

    if (!userId) {
        await axios.get(`${baseAPIPath}/user`).then((data) => {
            session.setUserId(data.data.id);
        });
    }

    const playlistLink = `https://api.spotify.com/v1/users/${userId}/playlists`;
    await axios.post(playlistLink, {
        name: req.body.name,
        public: req.body.public
    },
        {
            headers: {
                "Authorization": "Bearer " + accessToken,
                'Content-Type': "application/json",
            }
        })
        .then((responseData) => {
            console.log(responseData.data.items);
            res.send(responseData.data.items);
        })
        .catch(err => {
            console.log(err)
        });
})


module.exports = spotifyServiceAPI;
