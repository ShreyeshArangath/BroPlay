const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const db = admin.firestore();

const broPlayRoomServiceAPI = express();
broPlayRoomServiceAPI.use(cors({ origin: true }));

//GET: users in a broPlayRoom by roomId
broPlayRoomServiceAPI.get("/:roomId", async (req, res) => {
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

//POST: add an user to a broPlayRoom using a roomId
broPlayRoomServiceAPI.post("/:roomId", async (req, res) => {
    let preExistingUsers = []
    const user = req.body;
    const roomId = req.params.roomId;
    const broPlayIdRef = db.collection('broPlayRoom').doc(roomId);
    await broPlayIdRef.get()
        .then((doc) => {
            preExistingUsers.push(doc.data());
        })
        .catch((err) => {
            console.log(err);
        });
    //preExistingUsers: array of objects 
    preExistingUsers = preExistingUsers[0];
    preExistingUsers.users.push(user.userName);

    await broPlayIdRef.update(preExistingUsers);
    res.send(preExistingUsers);
})

// DELETE: deletes an user from a broPlayRoom using a roomId and userName
broPlayRoomServiceAPI.delete("/:roomId", async (req, res) => {
    let preExistingUsers = []
    const user = req.body;
    const roomId = req.params.roomId;
    const broPlayIdRef = db.collection('broPlayRoom').doc(roomId);
    await broPlayIdRef.get()
        .then((doc) => {
            preExistingUsers.push(doc.data());
        })
        .catch((err) => {
            console.log(err);
        });

    preExistingUsers = preExistingUsers[0];
    preExistingUsers.users = preExistingUsers.users.filter(element => element != user.userName);
    await broPlayIdRef.update(preExistingUsers);

    res.send(preExistingUsers);
})


module.exports = broPlayRoomServiceAPI;