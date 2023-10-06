<script>
	import jQuery from 'jquery';
	import { onMount } from 'svelte';
    import axios from 'axios'
    import { initializeApp } from "firebase/app";
    import { getAnalytics } from "firebase/analytics";
    import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";


    // firebse config
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
    var app;
    var storage;
    
    // everything else

    onMount(() => {
        //startVideo();
        app = initializeApp(firebaseConfig);
        storage = getStorage(app)
    })

    var mediaRecorder;
    var recordedChunks;
    var video;
    var downloadLink;
    var stopBtn;

    // Binded
    var transcript = "---";
    var question = "---";

    const SPEECH_TEXT_API_TOKEN = "7e3f7994c52540bfb506b22bd1049800"
    const transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
    const headers={
    "Authorization": SPEECH_TEXT_API_TOKEN,
    "Content-Type": "application/json"
    }

    const getPositionCompletion = async () => {
        var position = document.getElementById("jobName");
        var req = "POSITION QUESTION," + position.value;
        console.log(req.startsWith("POSITION QUESTION"))
        
       const response = await fetch("./api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ req }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      console.log(data.result)
      question = data.result;
    }
    const getFirstQuestion = async () => {
        var req = "FIRST QUESTION"
       const response = await fetch("./api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ req }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      console.log(data.result)
      question = data.result;
    }
    const startVideo = async () => {
        video = document.querySelector("#streamVid");
        downloadLink = document.getElementById("download")
        stopBtn = document.getElementById("stopBtn");

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            // SOPHIA REMINDER: UR DEBIT CARD IS CONNECTED TO GOOGLE CLOUD ACC
            .then( (stream) => {
                var mainQuestion = document.getElementById("mainQuestion");
                var noVideoPrompt = document.getElementById("noVideoPrompt");
                mainQuestion.classList.remove("hide");
                noVideoPrompt.classList.add("hide");
                video.srcObject = stream;
                
                // audio
                recordedChunks = [];
                mediaRecorder = new MediaRecorder(stream);
                
                // record data
                mediaRecorder.addEventListener('dataavailable', (e) => {
                    if (e.data.size >0) {
                        recordedChunks.push(e.data);
                    }
                })

                // when stop recording
                mediaRecorder.addEventListener('stop', async () => {
                    mainQuestion.classList.add("hide");
                     noVideoPrompt.classList.remove("hide");

                    var blobVid = new Blob(recordedChunks);
                    transcript ="--LOADING--"
                    // upload to firebsae
                    var vidRef = ref(storage, "voice.mp3");
                    await uploadBytes(vidRef, blobVid).then((e) => {console.log("video uploaded!")});


                    // a tag link
                    downloadLink.href = URL.createObjectURL(blobVid);
                    downloadLink.download = 'test.mp3';

                    // run speech-text
                    var downloadURL = "Placeholder";
                    await getDownloadURL(ref(storage, "voice.mp3"))
                        .then((url) => {downloadURL = url; console.log(downloadURL)})
                        .catch(() => {console.log("Something went wrong!")})

                    console.log(downloadURL)
                    const data = {
                        audio_url: downloadURL //"https://github.com/SophiaL9358/teampoke/raw/main/static/yes.mp3"
                        //"http://localhost:5173/yes.mp4" 
                        //"https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3"
                    }
                    
                    const response = await axios.post(transcript_endpoint, data, { headers: headers })
                    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${response.data.id}`
                    while (true) {
                        console.log("running")
                        const pollingResponse = await axios.get(pollingEndpoint, {
                            headers: headers
                        })
                        const transcriptionResult = pollingResponse.data

                        if (transcriptionResult.status === 'completed') {
                            // print the results
                            console.log(transcriptionResult.text)
                            transcript = transcriptionResult.text;
                            break
                        } else if (transcriptionResult.status === 'error') {
                            throw new Error(`Transcription failed: ${transcriptionResult.error}`)
                        } else {
                            await new Promise((resolve) => setTimeout(resolve, 3000))
                        }
                    }
                    console.log('OUT')

                })

                // stop recording
                stopBtn.addEventListener('click', () => {
                    video = document.querySelector("#streamVid");
                    var stream = video.srcObject;
                    mediaRecorder.stop();
                    video.srcObject = null;

                    if (stream != null) {
                        var tracks = stream.getTracks();
                        for (var i = 0; i < tracks.length; i++) {
                            var track = tracks[i];
                            track.stop();
                        }
                    }
                    
                })
                mediaRecorder.start();

                

                
                
            })  
            .catch(function (e) {
                console.log(e)
            console.log("Something went wrong!");
            });
        
    }

</script>
<div class = "w-100">
    
    <div class = "w-100 p-4 pt-5 d-flex flex-column align-items-center">
            <span id = 'mainQuestion' class ="text-center fs-4 hide">
                {question}
                <br>
                <input id = "stopBtn"  type  = "button" class = "btn btn-danger mt-1" value= "Stop video" />
            </span>
        
            <form  id = "noVideoPrompt" on:submit = {() => {console.log("happening");startVideo();getFirstQuestion();}}  class = "d-flex w-100 justify-content-center align-content-center" style = "height: 50px;">
                <input required id = "jobName" placeholder = "Job name"  type = "text"> &nbsp;&nbsp;
            <!-- <i>Key Points on Resume!</i>
                <input required placeholder = "ie. NIST Internship" class = "w-100" rows = "5" type = "text">-->
                <input type = "submit" value = "Start video" class = "btn btn-success" />
            </form>
        
        <br>
        <span class = "row">
            <div class = "col-md">
                <video id = "streamVid" autoplay = "true">
                    <track kind = "captions">
                </video>
            </div>
            
        </span>
        
        <a id = "download" download>Download Voice Recording</a>

        <br>
        <div class = "border border-3 w-75 text-center p-3">
            {#if transcript == "--LOADING--"}
                Loading <div class = "spinner-grow spinner-grow-sm text-success"></div>
            {:else}
                {transcript} 
            {/if}
        </div>

        
    </div> 
</div>

<style>
video {
    width: 500px;
    aspect-ratio: 16/9;
    background-color: rgb(231, 250, 235);
    border: 3px black solid;

    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
    -moz-transform:rotateY(180deg); /* Firefox */

}

.col-md-3 {
    background-color: rgb(230, 255, 236);
   /* background-color:rgb(231, 250, 235);
   rgb(173, 230, 189)
   
       border: 2px rgb(173, 230, 189) solid;
*/
}

textarea {
    border-radius: 10px;
}
</style>