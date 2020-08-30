const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const db = admin.firestore();

const userServiceAPI = express();

//TODO: Add more security
//GET: Get a user's information 
userServiceAPI.get('/users/:userName', async (req, res) => {
    let user = []
    const userName = req.params.userName;
    const userDatabaseRef = db.collection('users');

    await userDatabaseRef.where('userName', '==', userName).get()
        .then((doc) => {
            doc.forEach((element) => {
                user.push(element.data());
            })
        })
        .catch((error) => {
            console.log(error);
        })
    if (user.length > 0) {
        res.status(200).send(user);
    }
    else {
        res.status(400).send(`Cannot find ${userName}`);
    }

})


// POST: Create a new user with a user name
userServiceAPI.post('/users/:userName', async (req, res) => {
    let preExistingUser = []
    const userToPost = req.body;
    const userName = req.params.userName;
    const userDatabaseRef = db.collection('users');

    await userDatabaseRef.where('userName', '==', userName).get()
        .then((doc) => {
            doc.forEach((element) => {
                preExistingUser.push(element.data());
            })
        })
        .catch((error) => {
            console.log(error);
        })

    if (preExistingUser.length > 0) {
        res.status(404).send("The user name already exists")
    }
    else {
        await userDatabaseRef.add(userToPost);
        res.status(200).send(userToPost)
    }
})


//DELETE: Delete an user with a given user name
userServiceAPI.delete('/users/:userName', async (req, res) => {
    let userID = ''
    const userDatabaseRef = db.collection('users');
    const userName = req.params.userName;
    await userDatabaseRef.where('userName', '==', userName).get()
        .then((doc) => {
            userID = doc.docs[0].id //Get the ID of the document
        })
        .catch((error) => {
            console.log(error);
        })
    if (userID != '') {
        await userDatabaseRef.doc(userID).delete();
        res.status(400).send(`Deleted ${userName}`);
    }
    else {
        res.status(200).send(`Cannot find ${userName}`);
    }

})

module.exports = userServiceAPI;
