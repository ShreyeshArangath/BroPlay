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
const userServiceAPI = express();
const broPlayAPI = express();

userServiceAPI.use(cors({ origin: true }));

//GET: users in a broPlayRoom by roomId
userServiceAPI.get("/:roomId", async (req, res) => {
    const data = []
    const roomId = req.params.roomId;
    console.log(roomId);
    const broPlayIdRef = db.collection('broPlayRoom').doc(roomId);
    const snapshot = await broPlayIdRef.get()
        .then((doc) => {
            data.push(doc.data());
        })
        .catch((err) => {
            console.log(err);
        });

    res.send((data));
});


exports.broPlayRooms = functions.https.onRequest(userServiceAPI);

// app.post("/users", async (req, res)=>{
//     await db.collection()
// });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});
