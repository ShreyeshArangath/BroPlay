# BroPlay 

## React Native Application 

```bash
expo start  /*starts the dev server for mobile development*/
```

## Spotify Service 

1. OAuth + Access Token generation 
2. Current user information 
3. Search tracks by artists, track name
4. Search playlists 
5. Create playlists

To run the spotify API, please navigate to ```./backend/ ``` and use the command 
```bash
nodemon index.js 
```
 to start the node development server. 

## Firebase Functions Requirements (Node v10.x)

1. Firebase Firestore 
2. Firebase Cloud Functions 
3. Firebase Real Time Database

To run the firebase functions, please navigate to ```./functions/ ``` and use the command 
```bash
firebase serve --only functions
 ``` 
to start dev server for the firebase functions on your local machine. To deploy the functions on your Google Cloud account use 
``` bash
firebase deploy 
```

