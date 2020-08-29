const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

admin.initializeApp(functions.config().firebase);

const app = express();
const main = express();

main.use('/api', app);
main.use(bodyParser.json())
main.unsubscribe(bodyParser.urlencoded({ extended: false }))

app.get("/api/users", (req, res) => {

})

const db = admin.firestore();
export const webAPI = functions.https.onRequest(main);




// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
