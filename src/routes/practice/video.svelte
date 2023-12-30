<script>
    import { ref, getDownloadURL, uploadBytes, uploadString } from "firebase/storage";
    import DetectRTC from "detectrtc/DetectRTC";
    import {user_sub, storage, app} from "$lib/global.js";;
	import { writable } from 'svelte/store';
    import { generateInterviewName } from '$lib/global.js';
	import { onMount } from "svelte";

    export var getQuestion;
    export var insertInStartQuestion = () => {return true}; // before showVideo turns true
    export var insertInEndQuestion = () => {}; // after showVideo turns false
    var mediaRecorder;
    var recordedChunks;
    var showVideo = false;
    var interviewName;
    var downloadLinkProgress = "none" // none = no link, progress = still being created, done = can click on it!

    var question = writable("---");
    const synth = window.speechSynthesis;

    onMount(() => {
        document.getElementById("interviewName").value = generateInterviewName()
    })

    const startVideo = async () => {
        if (!(await insertInStartQuestion())){ // false = break the function, true = continue
            return;
        }
        interviewName = document.getElementById("interviewName").value;
        showVideo = true;
        question.set("Loading...");
        await getQuestion(question);
        repeatQuestion();
        navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: "user" }})
            .then( (stream) => {
                var video = video = document.querySelector("#streamVid");
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
                    insertInEndQuestion();
                    document.getElementById("interviewName").value = generateInterviewName()
                    downloadLinkProgress = "progress"
                    question.set("---");

                    var blobVid = new Blob(recordedChunks);

                    // set interview name
                    var dateVar = new Date();
                    var fullInterviewName= interviewName+"|"+(dateVar.getMonth()+1)+"-"+dateVar.getDate()+"-"+dateVar.getFullYear();
                    fullInterviewName += "|"+dateVar.getHours()+":"+dateVar.getMinutes()

                    // upload to firebsae
                    if ($user_sub != ""){ // doesn't work if user is not signed in                    
                        var storagePath = $user_sub + "/Videos/"+fullInterviewName+".mp4"
                        var vidRef = ref(storage, storagePath);
                        await uploadBytes(vidRef, blobVid).then((e) => {});
                    }

                    // a tag link
                    var downloadLink = document.getElementById("download")
                    downloadLink.href = URL.createObjectURL(blobVid);
                    downloadLink.download = interviewName+".mp4";
                    downloadLink.classList.remove('hide')
                    downloadLinkProgress = "done"

                })

                // stop recording
                document.getElementById("stopBtn").addEventListener('click', () => {
                    var video = document.querySelector("#streamVid");
                    var stream = video.srcObject;
                    showVideo = false;
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
    }

    const repeatQuestion = async () => { // say question outloud
        console.log($question);
        synth.cancel();
        let utterance = new SpeechSynthesisUtterance($question);
        speechSynthesis.speak(utterance);
    }

    let cameraReady = "";
    let microphoneReady = "";

    DetectRTC.load(() => {
        if (DetectRTC.hasWebcam && DetectRTC.isWebsiteHasWebcamPermissions) { cameraReady = "Camera Ready"; }
        else if (!DetectRTC.hasWebcam) { cameraReady = "Camera Not Detected"; }
        else{ cameraReady = "No Camera Permissions"; }

        if (DetectRTC.hasMicrophone && DetectRTC.isWebsiteHasMicrophonePermissions) { microphoneReady = "Microphone Ready"; }
        else if (!DetectRTC.hasMicrophone) { microphoneReady = "Microphone Not Detected"; }
        else{ microphoneReady = "No Microphone Permissions"; }
    })

</script>
<div class = "w-100 text-dark mb-5 pb-5 p-2 flex-center flex-column">
    {#if !showVideo}
        <div class = "border border-2 p-3 mt-5 text-dark text-center d-flex flex-column align-items-center" style = "width: 600px;">
            <i>Setup for the interview practice</i>
            
            <slot></slot>
            <!-- Interview Name -->
            <span class ="d-flex w-100 text-nowrap mt-3">
                <b>Interview Name:</b>&nbsp;&nbsp;
                <input id ="interviewName" type = "text" class = "w-100" placeholder="Name for Interview" />
            </span>
            <span class = "w-100 text-start text-secondary">
                *Interview name can be edited later in the "Past Interviews" section on the home page
            </span>
            <!-- Cam/Mic Settings -->
            <table class = "my-3">
                <tr class ="text-dark">
                    {#if cameraReady == "Camera Ready"}
                        <td class = "fs-4">
                            <i class="fa-solid fa-camera me-1 fs-5"></i>
                            {cameraReady}
                        </td>
                    {:else}
                        <td class = "fs-5 text-danger">
                            <i class="fa-solid fa-camera me-1 fs-5 text-danger"></i>
                            {cameraReady}
                        </td>
                    {/if}
                    <td class = "px-3"></td>
                    {#if microphoneReady == "Microphone Ready"}
                        <td class = "fs-4">
                            <i class="fa-solid fa-microphone me-1 fs-5"></i>
                            {microphoneReady}
                        </td>
                    {:else}
                        <td class = "fs-5 text-danger">
                            <i class="fa-solid fa-microphone me-1 fs-5 text-danger"></i>
                            {microphoneReady}
                        </td>
                    {/if}
                </tr>
            </table>
            
            <a id = "download" class = "fs-5 hide" download>Download Video Recording "{interviewName}.mp4"</a>
            {#if downloadLinkProgress == "progress"}
                <span class = "text-primary">
                    <div class = "spinner-border spinner-border-sm text-primary me-1"></div> Download link is in progress...
                    <br>
                    <i class = "text-danger">Please do not exit the page until the download link is finished being created.</i>
                </span>
            {/if}
        </div>
        <br>

        <!-- Start Video Button -->
        <form on:submit = {() => {startVideo();}}  class = "flex-center w-100 mt-2" style = "height: 50px;">
            <input type = "submit" value = "Start Video" class = "btn btn-success py-2 fs-5" />
        </form>
    {:else}
        <!-- Question -->
        <div class = "d-inline-flex text-center">
            <button id = "repeatspeechbtn" class = "speak-btn" on:click={() => {repeatQuestion();}}><i class="fa-solid fa-volume-up"></i></button>
            <span class = "fs-4 text-dark">{$question}</span>
        </div>

        <!-- Stop Button -->
        <span class = "d-flex">
            <input id = "stopBtn"  type  = "button" class = "btn btn-danger mt-2 py-2" value= "Stop Video" />
            <input type = "button" value = "New Question" class = "btn btn-primary mt-2 mx-1" on:click = {async ()=> {await getQuestion(question);repeatQuestion();}} /> 
        </span>
        <br>
    
        <!-- Video -->
        <span class = "row">
            <div class = "col-md">
                <video id = "streamVid" autoplay = "true" muted>
                    <track kind = "captions">
                </video>
            </div>
        </span>

        <i class = "mt-2 text-secondary">Recording under the interview name of "{interviewName}"</i>

    {/if}       
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
