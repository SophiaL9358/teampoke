import { writable } from "svelte/store";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { onMount } from "svelte";

import { Buffer } from 'buffer';

// @ts-ignore
globalThis.Buffer = Buffer;
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

export var user_sub = writable("");
export var user_name = writable("");

app = initializeApp(firebaseConfig);
storage = getStorage(app)
db = getFirestore(app);

export function logoutAndReturn(){
    user_sub.set("");
    user_name.set("")
    window.location.pathname = '/';
}


var rawAdj = "whimsical, playful, lighthearted, zany, cheerful, quirky, "+
"joyful, eccentric, fun-loving, amusing, spirited, jovial, merry, wacky, "+
"delightful, upbeat, radiant, gleeful, bubbly, sunny, hilarious, unconventional, "+
"enchanting, dynamic, vivacious, comical, whimsy, zippy, animated, jubilant, "+
"carefree, frolicsome, fantastic, cheery, sprightly, unpredictable, exuberant, "+
"jolly, optimistic, high-spirited, blithe, witty, gleaming, gladsome, ecstatic, "+
"buoyant, bizarre, magnetic, sparkling"
var rawNoun = "quirkball, zanymoth, jinxaroo, dizzicorn, whoozit, "+
"bumblegum, zoodlebug, mirthbot, quibblesnack, wobblefrog, jigglezip, "+
"snazzlebee, doodleflip, wackyjazz, noodlejoy, bliparoo, quackle, zigglypuff, "+
"dazzleroo, bunkaroo, quizzlepop, jollybug, zippyzap, bofflebee, snickaroo, "+
"quibbletwirl, jigglywump, doodledrop, gleebug, quirklepop, zanyzap, bubbleroo, "+
"dizzysnap, jogglewig, fizzbuzz, quizzler, zippydoo, boparoo, jollytwist, noodlebug, "+
"wobblewham, jumblebee, zestaroo, dorkaroo, quirkybop, zingaroo, snazzler, jinxaroo, quackaroo, wackywoo"
var rawNoun2 = "laughter, joyfulness, pizzazz, ticklish, frolic, bubbles, harmony, "+
"snuggles, giggles, jamboree, whiskers, jollity, gleaming, chuckles, flair, banter, "+
"mischief, zephyr, bonanza, twinkle, prism, mirth, jubilee, quirks, zinger, grin, snazzy, "+
"tango, fiesta, frolic, bliss, dazzle, jazz, bounce, puddle, quirk, fizz, funk, zest, "+
"jolt, wink, spritz, zoom, glee, blip, riff, jive, zap, jolt"
var adj = rawAdj.split(", ")
var noun = rawNoun.split(", ")
var noun2 = rawNoun2.split(", ")

export function generateInterviewName() {
    var randAdj = adj[Math.trunc(Math.random()*(adj.length))]
    var randNoun = noun[Math.trunc(Math.random()*(noun.length))]
    var randNoun2 = noun2[Math.trunc(Math.random()*(noun.length))]
    return randAdj + " " + randNoun + " " + randNoun2
}

export const formatTime = (seconds) => {
    seconds = Math.floor(seconds)
    let minutes =  Math.floor(seconds/60)
    seconds = seconds - minutes*60
    if (minutes == 0) {
        return seconds +"s"
    }
    return minutes+"m "+seconds+"s"
}

export const formatDate =  (date) => {

}