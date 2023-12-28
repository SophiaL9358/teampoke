import { writable } from "svelte/store";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { onMount } from "svelte";

export var user_sub = writable("");
export var user_name = writable("");

export function logoutAndReturn(){
    user_sub.set("");
    user_name.set("")
    window.location.pathname = '/';
}

const firebaseConfig = {
    apiKey: "AIzaSyCqMXF0c9ewaFpaddxF1p2iTn6AuZbeC4g",
    authDomain: "aeee-416c3.firebaseapp.com",
    databaseURL: "https://aeee-416c3.firebaseio.com",
    projectId: "aeee-416c3",
    storageBucket: "aeee-416c3.appspot.com",
    messagingSenderId: "745101593585",
    appId: "1:745101593585:web:56d9d0572cbe6aa376d250",
    measurementId: "G-WMS61VSZG9",
    storageBucket: 'gs://aeee-416c3.appspot.com'
};
export var app;
export var storage;
export var db;
// everything else


app = initializeApp(firebaseConfig);
storage = getStorage(app)
db = getFirestore(app);

/*

const firebaseConfig = {
    apiKey: "AIzaSyDIMSd2qMl2vltWtTDgNjRFlgTWl73jMXw",
    authDomain: "mock-interview-app-403217.firebaseapp.com",
    projectId: "mock-interview-app-403217",
    storageBucket: "mock-interview-app-403217.appspot.com",
    messagingSenderId: "1083819190018",
    appId: "1:1083819190018:web:046cef3647a6736bd0841b",
    measurementId: "G-K0RYJF8CBX"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);*/