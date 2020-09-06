const express = require('express');
const axios = require('axios').default;
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const btoa = require('btoa');
const authEndpoint = "https://accounts.spotify.com/authorize";
const accessTokenEndpoint = "https://accounts.spotify.com/api/token"
const { clientId, clientSecret, redirectUri, scopes } = require('../../backend/config/spotifyConfig');

const spotifyAPI = express();

passport.use(
    new SpotifyStrategy(
        {
            clientID: clientId,
            clientSecret: clientSecret,
            callbackURL: redirectUri
        },
        function (accessToken, refreshToken, expires_in, profile, done) {
            console.log(accessToken);
        }
    )
);

spotifyAPI.use(passport.initialize());
spotifyAPI.use(passport.session());


const authCode = "AQC50rM17SI-e8cmau3mUcyUgOVMnCdEKadUjBAdpazc6_eArhlBvHf7_TDXaGiKRyn3J8HO_SHCgs7kU2_Pb1A8Q5HQuVXAOdo1WSn1I-KISd5RsVrUCOcZkH1oehg30llEDk_pH3dx5tU-nes4ck6fIrSaVohWB9EXtUfdHzgeLDkxOh-1A3vL4bztpsE9TsQCMqoMGgqiTTckmnJlU-qlVkES41tJG2NI8KR_Q1Uscg";

spotifyAPI.get('/auth/spotify', passport.authenticate('spotify'), function (req, res) {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.å
});


// spotifyAPI.get('/authorize', async (req, res) => {
//     const data = await axios.get(authEndpoint, {
//         client_id: clientId,
//         client_secret: clientSecret,
//         redirect_uri: redirectUri,
//     })
//         .catch(err => {
//             console.log(err);
//         });
//     console.log(data);
//     res.redirect(data);
// });



spotifyAPI.get('/accessToken', async (req, res) => {

    await axios.post(accessTokenEndpoint, {
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: redirectUri
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        }
    }).then((data) => {
        res.send(data.data);
    })
        .catch(err => {
            console.error(err);

        })
})

module.exports = spotifyAPI;