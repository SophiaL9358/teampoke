<script>
	import { onMount } from 'svelte';
    //import axios from 'axios';
    import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
    import DetectRTC from "detectrtc/DetectRTC";
    import {user_sub, storage, app} from "$lib/global.js";
	import Navbar from '../../Navbar.svelte';
    // its too complicated to put it in a txt file cause modules and context and svelte and *dies*
    var questions = `Tell me about yourself.
What attracted you to our company?
What jobs have you had in the past?
Have you ever had a volunteer job?
Do you have any specific trainings that would help you if you got the job you are applying for.
Tell me about your strengths.
 What are your weaknesses?
 Why are you leaving your current job?
Describe your ideal supervisor.
Describe your ideal work environment.
 Do you like to work as part of a team or more by yourself?
 How do you manage stress at work?
Why should we hire you?
What days of the weeks can you work?
What time are you available to work/what shifts are you interested in?
Do you have any questions for me?`;
    var split = questions.split("\n");
    // firebse config
    

    var mediaRecorder;
    var recordedChunks;
    var video;
    var downloadLink;
    var stopBtn;

    // Binded
    var transcript = "---";
    const baseQuestion = "---";
    var question = baseQuestion;

    const SPEECH_TEXT_API_TOKEN = "7e3f7994c52540bfb506b22bd1049800"
    const transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
    const headers={
    "Authorization": SPEECH_TEXT_API_TOKEN,
    "Content-Type": "application/json"
    }
    var startButton ;
      var recognition
      var text = "---";
    onMount(() => {
        recognition = new webkitSpeechRecognition() || new SpeechRecognition();
      
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 3;

    
    })

    const synth = window.speechSynthesis;
    const getQuestion = async () => {
        text = "";
        
        var randomIndex =Math.trunc(Math.random()*(split.length));
        
        //fs.read
        /*fs.('./questions.txt', (err, data) => {
            if (err) throw err;
            console.log(data.toString());
        })*/
        question = split[randomIndex];
        synth.cancel();
        let utterance = new SpeechSynthesisUtterance(question);
        speechSynthesis.speak(utterance);
        utterance.onend = () => {
            console.log("test")
        }
    }
    const getFollowQuestion = async () => {      
        var req = "FOLLOWUP QUESTION,"+text;
        console.log(req);
        const response = await fetch("../api", {
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
        question =  data.result;
    }
    const startVideo = async () => {
        video = document.querySelector("#streamVid");
        downloadLink = document.getElementById("download")
        stopBtn = document.getElementById("stopBtn");

        mainQuestion.classList.remove("hide");
        noVideoPrompt.classList.add("hide");
        question = "Loading...";
        navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: "user" }})
            // SOPHIA REMINDER: UR DEBIT CARD IS CONNECTED TO GOOGLE CLOUD ACC
            .then( (stream) => {
                var mainQuestion  = document.getElementById("mainQuestion");
                var noVideoPrompt = document.getElementById("noVideoPrompt");
                video.srcObject = stream;

                // voice recording
                recognition.onresult = event => {
                    const result2 = event.results[event.results.length - 1][0].transcript;
                    const result = event.results;
                    text = ""
                    for (var i = 0; i < event.results.length; i ++) {
                        text+=event.results[i][0].transcript+" "
                    }
                    console.log(text);
                };

                recognition.onend = () => {
                    console.log("RECORDING STOPPED")
                    if (question != baseQuestion){
                        recognition.start()
                        
                    }
                };

                recognition.onerror = event => {
                    console.error('Speech recognition error:', event.error);
                };

                recognition.onnomatch = () => {
                    console.log('No speech was recognized.');
                };
                
                recognition.start();

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
                    recognition.stop()
                    mainQuestion.classList.add("hide");
                     noVideoPrompt.classList.remove("hide");
                     question = baseQuestion;

                    var blobVid = new Blob(recordedChunks);
                    transcript ="--LOADING--"
                    // upload to firebsae
                    console.log("starting upload")
                    
                    // upload
                    if ($user_sub != ""){
                        var dateVar = new Date();
                        var interviewName = document.getElementById("interviewName").value;
                        var date= interviewName+"|"+(dateVar.getMonth()+1)+"-"+dateVar.getDate()+"-"+dateVar.getFullYear();
                        date += "|"+dateVar.getHours()+":"+dateVar.getMinutes()

                        var storagePath = $user_sub + "/Videos/"+date+".mp4"
                        console.log(storagePath);
                        var vidRef = ref(storage, storagePath);
                        await uploadBytes(vidRef, blobVid).then((e) => {console.log("video uploaded!")});
                        console.log("upload finished")
                    } else {
                        console.log("USER NOT SIGNED IN");
                    }

                    // a tag link
                    downloadLink.href = URL.createObjectURL(blobVid);
                    downloadLink.download = document.getElementById("interviewName").value+".mp4";

                    // run speech-text
                    var downloadURL = "Placeholder";
                    
                    await getDownloadURL(ref(storage, "video.mp4"))
                        .then((url) => {downloadURL = url; console.log(downloadURL)})
                        .catch(() => {console.log("Something went wrong!")})

                    console.log(downloadURL)
                    console.log('OUT');

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
    const repeatQuestion = async () => {
        
        synth.cancel();
        let utterance = new SpeechSynthesisUtterance(question);
        speechSynthesis.speak(utterance);
    }

    let cameraReady = "";
    let microphoneReady = "";
    DetectRTC.load(function() {
        console.log(DetectRTC.hasWebcam===true);
        console.log(DetectRTC.hasMicrophone===true);
    if (DetectRTC.hasWebcam === true && DetectRTC.isWebsiteHasWebcamPermissions === true) {
        cameraReady = "Ready";
        document.getElementById("startVideoButton").disabled = false;
    }
    else{
        document.getElementById("startVideoButton").disabled = true;
    if (DetectRTC.hasWebcam === false) {
        cameraReady = "Not Connected";
        
    }
    else{
        cameraReady = "Not Connected";
    }
    }
    if (DetectRTC.hasMicrophone === true && DetectRTC.isWebsiteHasMicrophonePermissions === true) {
        microphoneReady = "Ready";
        document.getElementById("startVideoButton").disabled = false;
    }
    else{
        document.getElementById("startVideoButton").disabled = true; 
    if (DetectRTC.hasMicrophone === false) {
        microphoneReady = "Not Connected";
    }
    else{
        microphoneReady = "No Permissions";
    }
    }
    function test(){
        var hi = new Date();
        console.log(hi);
        console.log(hi)
    }
    test();
})
</script>
{#if user_sub == ""}
<Navbar guest = true/>
{:else}
<Navbar back=true/>
{/if}
<div class = "w-200 text-dark mb-5 pb-5">
    <div class = "w-200 p-2 d-flex flex-column align-items-center">
        <div class = "d-inline-flex">
        <button id = "repeatspeechbtn" class = "speak-btn" on:click={() => {repeatQuestion();}}><i class="fa-solid fa-volume-up"></i></button>
        <span class = "fs-4 text-dark">{question}</span>
    </div>
        <span class = "d-flex">
            <span id = "noVideoPrompt" >
                <form on:submit = {() => {console.log("happening");startVideo();getQuestion();}}  class = "d-flex w-100 mt-2 justify-content-center align-content-center" style = "height: 50px;">
                    <!-- <i>Key Points on Resume!</i>
                        <input required placeholder = "ie. NIST Internship" class = "w-100" rows = "5" type = "text">-->
                        <input type = "submit" value = "Start Video" class = "btn btn-success" id = "startVideoButton"/>
                </form>
            </span>
            <span id = 'mainQuestion' class ="hide">
                <input id = "stopBtn"  type  = "button" class = "btn btn-danger mt-2 py-2" value= "Stop Video" />
                <input type = "button" value = "New Question" class = "btn btn-primary mt-2 mx-1" on:click = {getQuestion} />  
            </span>
        </span>

        <br>
        <span class = "row">
            <div class = "col-md">
                <video id = "streamVid" autoplay = "true" muted>
                    <track kind = "captions">
                </video>
            </div>
            
        </span>
        <table>
            <tr class ="text-dark">
              <td><i class="fa-solid fa-camera me-1"></i></td>
              <td style="font-size:30px">{cameraReady}</td>
              <td class = "px-1" style="width:30px"></td>
              <td><i class="fa-solid fa-microphone me-1"></i></td>
              <td style="font-size:30px">{microphoneReady}</td>
            </tr>
          </table>
        
        <div class = "border border-2 p-3">
            <input id ="interviewName" type = "text" value = "Practice Interview" placeholder="Name for Interview" />
            <a id = "download" download>Download Voice Recording</a>
           
        </div>
        <div class="container w-100 text-center mt-3">
            <div id="output" class="outputText">{text}</div>
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
</style>
