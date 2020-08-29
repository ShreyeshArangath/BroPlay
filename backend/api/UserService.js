const express = require('express');
const app = express();
const User = require('../model/User');
const firebase = require('firebase-admin');
const firebaseConfig = require('../config/config');
const serviceAccountConfig = require('../config/serviceAccountConfig.json');
const functions = require('firebase-functions');
const cors = require('cors');


app.use(cors({ origin: true }));


firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccountConfig),
    databaseURL: firebaseConfig.firebaseConfig.databaseURL,
})
const database = firebase.firestore();

userDatabase = {
    "broPlayRoomId": {
        "users": ["userName1", "userName2"]
    },
    "users": {
        "userName": {
            "name": "This is my name",
            "email": "thisismyemail@gmail.com"
        }
    }
}



let users = []
var user1 = new User("1", "Shreyesh", "thisismyemail@gmail.com").getJSON();
var user2 = new User("2", "Bob", "thisismyemail@gmail.com").getJSON();
var user3 = new User("3", "Dylan", "thisismyemail@gmail.com").getJSON();
users.push(user1);
users.push(user2);

app.get('/api/users/', (req, res) => {
    database.collection('broPlayRoom').get()
        .then(doc => {
            console.log(doc)
        })
        .catch(err => {
            console.error('Error', err);
        });
})

app.post('/api/users', (req, res) => {
    const user = req.body;
    console.log(user)
    users.push(user);
    res.send("Got it!");
})

const port = 3000;
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
