const functions = require('firebase-functions');
const firebaseCert = require('../backend/config/serviceAccountConfig.json');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert(firebaseCert),
    databaseURL: 'https://broplay-reactnative.firebaseio.com'
})

const db = admin.firestore();
const broPlayAPI = express();

const broPlayRoomServiceAPI = require('./src/BroPlayRoomService');
const userServiceAPI = require('./src/UserService');
const spotifyServiceAPI = require('./src/SpotifyService');

exports.broPlayRooms = functions.https.onRequest(broPlayRoomServiceAPI);
exports.userService = functions.https.onRequest(userServiceAPI);
exports.spotifyService = functions.https.onRequest(spotifyServiceAPI);

// app.post("/users", async (req, res)=>{
//     await db.collection()
// });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});
