// Import the functions you need from the SDKs you need
// https://firebase.google.com/docs/web/setup#available-libraries

import * as firebase from "firebase/app";
import * as auth from 'firebase/auth';
import * as firestore from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_MEASUREMENT_ID,
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const authentication = auth.getAuth(app);

// https://firebase.google.com/docs/reference/js/firestore_?hl=en
const db = firestore.getFirestore(app);

export const libs = {
    firebase, auth, firestore
};

export {
    app,
    authentication,
    db,
};
