<script>
    import { ref, getDownloadURL, uploadBytes, uploadString, getBlob } from "firebase/storage";
    import DetectRTC from "detectrtc/DetectRTC";
    import {user_sub, storage, app, formatTime} from "$lib/global.js";;
	import { writable } from 'svelte/store';
    import { generateInterviewName } from '$lib/global.js';
	import { onMount } from "svelte";
    import * as ebml from 'ts-ebml';
    import getBlobDuration from 'get-blob-duration'
	import Navbar from "../Navbar.svelte";

    export var getQuestion;
    export var insertInStartQuestion = () => {return true}; // before showVideo turns true, true: continue, false: leave function
    export var insertInEndQuestion = () => {}; // after showVideo turns false
    var mediaRecorder;
    var recordedChunks;
    var interviewName;
    var downloadLinkProgress = "none" // none = no link, progress = still being created, done = can click on it!
    var objUrl;

    var secondsPassed = writable(0)

    var showVideo = false;
    var TTSChecked = true; // controls TTS checkbox
    var showVideoAfterwards = true; // controls "show video of *interview name*"
    var loaded = false;

    var question = writable("---");
    const synth = window.speechSynthesis;

    onMount(() => {
        // var video = document.querySelector("#streamVid");
        // video.srcObject = null // start video

        document.getElementById("interviewName").value = generateInterviewName()
        loaded = true
    })

    const startVideo = async () => {
        if (!(await insertInStartQuestion())){ // false = break the function, true = continue
            return;
        }
        if (document.getElementById("interviewName").value.includes("|")) {
            alert("Please do not include \"|\" in the interview name!")
            return;
        }
        if (cameraReady != "Ready" || microphoneReady != "Ready"){
            alert("Please check the permissions/connections for your microphone and camera to start.");
            return;
        }
        interviewName = document.getElementById("interviewName").value;
        showVideo = true;
        question.set("Loading...");

        
        navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: "user" }})
            .then( (stream) => {
                // timer vars
                var timerID;
                secondsPassed.set(0) // 830 = 13:50

                // video vars
                var video = document.querySelector("#streamVid");
                video.srcObject = stream // start video

                // audio
                recordedChunks = [];
                const options = {
                    mimeType: 'video/webm' // \;codecs=vp9
                };

                mediaRecorder = new MediaRecorder(stream, options);

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

                    const blobVid = new Blob(recordedChunks, { type: "video/webm"  }); // recordedChunks[0].type
                    // set interview name
                    var dateVar = new Date();
                    var time = dateVar.getTime()
                    // (dateVar.getMonth()+1)+"/"+dateVar.getDate()+"/"+dateVar.getFullYear();
                    var fullInterviewName= interviewName+"|"+time;

                    // change so its seekable
                    // const decoder = new ebml.Decoder();
                    // const reader = new ebml.Reader();
                    // const webMBuf = await blobVid.arrayBuffer();
                    // const elms = decoder.decode(webMBuf);

                    // elms.forEach((elm)=>{
                    //     if (elm.type !== 'unknown') {
                    //         reader.read(elm)
                    //     }
                    //  });
                    // reader.stop();
                    // const duration = await getBlobDuration(blobVid)
                    // console.log(reader.duration)
                    // const refinedMetadataBuf = ebml.tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues);
                    // const body = webMBuf.slice(reader.metadataSize);
                    // const refinedBlob = new Blob([refinedMetadataBuf, body], {type: "video/webm"});
                    var refinedBlob = await injectMetadata(blobVid); // TODO: figure this out later..
                    objUrl = URL.createObjectURL(refinedBlob);
                    
                    // upload to firebsae
                    if ($user_sub != ""){ // doesn't work if user is not signed in                    
                        var storagePath = $user_sub + "/Videos/"+fullInterviewName+".webm"
                        var vidRef = ref(storage, storagePath);
                        await uploadBytes(vidRef, refinedBlob).then((e) => {});
                    }

                    // set download link
                    var downloadLink = document.getElementById("download")
                    
                    downloadLink.href = objUrl;
                    downloadLink.download = interviewName+".webm";
                    downloadLink.classList.remove('hide')
                    downloadLinkProgress = "done"

                    
                })

                // stop recording
                document.getElementById("stopBtn").addEventListener('click', () => {
                    // stop timer
                    clearInterval(timerID)
                    secondsPassed.set(0)
                    
                    // stop video
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

                // start recording
                mediaRecorder.start();
                
                // start timer
                timerID = setInterval(() => {                    
                    if ($secondsPassed == 840) { // 20 minutes
                        alert("You have reached the 14 minute mark! To prevent the video from being too large, the interview will automatically end at 15 minutes.")
                    } else if ($secondsPassed == 900) {
                        document.getElementById("stopBtn").click();
                        alert("You have reached the 15 minute mark! To prevent the video from being too large, the interview will now be stopped.")
                    }
                    
                    secondsPassed.set($secondsPassed+1)
                    
                }, 1000)
                
            }).catch(() => {
                console.log("Something went wrong!")
            })
        await getQuestion(question);
        if (TTSChecked){
            repeatQuestion();
        }
        
    }

    const readAsArrayBuffer = function(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            reader.onloadend = () => { resolve(reader.result); };
            reader.onerror = (ev) => { reject(ev.error); };
        });
    }

    const injectMetadata = async function(blob) {
        const decoder = new ebml.Decoder();
        const reader = new ebml.Reader();
        reader.logging = false;
        reader.drop_default_duration = false;

        var buffer = await blob.arrayBuffer()
        const elms = decoder.decode(buffer);
        elms.forEach((elm) => { reader.read(elm);});
        reader.stop();
        var iwannadie = await getBlobDuration(blob) * 1000000000 / reader.timecodeScale
        // console.log(await getBlobDuration(blob) * 1000000000 / reader.timecodeScale)
        
        var refinedMetadataBuf = ebml.tools.makeMetadataSeekable(reader.metadatas, iwannadie, reader.cues);
        var body = buffer.slice(reader.metadataSize);

        const result = new Blob([refinedMetadataBuf, body],
            {type: "video/webm"}); // blob.type
        // console.log(result, "res")
        return result;
        
    }    


    const repeatQuestion = async () => { // say question outloud
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
<Navbar doBeforeExiting = {() => {if (showVideo) {document.getElementById("stopBtn").click();}}}/>
<div class = "w-100 text-dark mb-5 pb-5 p-2 flex-center flex-column">
    {#if !showVideo}
        <div class = "border border-2 p-3 mt-5 text-dark text-center d-flex flex-column align-items-center" style = "width: 700px;">
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
            <span><input type = "checkbox" id = "TTSCheck" bind:checked = {TTSChecked}/> <label for = "TTSCheck">Question is read out loud (Text to Speech)</label></span>
            {#if !TTSChecked}
                <span class = "text-secondary">
                    *Click the <i class="fa-solid fa-volume-up"></i> icon to still read the question out loud!
                </span>
            {/if} 

            {#if interviewName != undefined}
                <span><input type = "checkbox" bind:checked = {showVideoAfterwards} id = "VideoCheck"/> <label for = "VideoCheck">Show video of "{interviewName}"</label></span>
                {#if showVideoAfterwards}
                    <video src = {objUrl} alt = "Video of {interviewName}" controls = true id = "videoAfter">
                        <track kind = "captions">
                    </video>
                {/if}
            {/if}
            

            <a id = "download" class = "fs-5 hide mt-3" download>Download Video Recording "{interviewName}.webm"</a>
            {#if downloadLinkProgress == "progress"}
                <span class = "text-primary mt-3">
                    <div class = "spinner-border spinner-border-sm text-primary me-1"></div> Download link is in progress...
                    <br>
                    <i class = "text-danger">Please do not exit the page/start a new interview until the download link is finished being created.</i>
                </span>
            {:else if downloadLinkProgress == "error"}
            <span>
                <i class = "text-danger">An error occurred! Please try recording again. If this error continues, please contact the developers at poke.co2023@gmail.com.</i>
            </span>
            {/if}
        </div>
        <br>

        <!-- Start Video Button -->
        <form on:submit = {() => {startVideo();}}  class = "flex-center w-100 mt-2" style = "height: 50px;">
            <input type = "submit" id = "startVideoButton" value = "Start Video" class = "btn btn-success py-2 fs-5"/>
        </form>
    {:else}
        <!-- Question -->
        <div class = "d-inline-flex text-center">
            <button id = "repeatspeechbtn" class = "speak-btn" on:click={() => {repeatQuestion();}}><i class="fa-solid fa-volume-up"></i></button>
            <span class = "fs-4 text-dark">{$question}</span>
        </div>

        <!-- Stop/Next Question Button -->
        <span class = "d-flex flex-center fs-5 mt-3">
            <input style = "height: 50px;" id = "stopBtn"  type  = "button" class = "btn btn-danger py-2" value= "Stop Video" />
            <input style = "height: 50px;" type = "button" value = "New Question" class = "btn btn-primary ms-2 me-3" on:click = {async ()=> {await getQuestion(question);if (TTSChecked){repeatQuestion();}}} /> 
            <span style= "height: 50px" class = "border border-1 rounded flex-center px-3 text-end">{formatTime($secondsPassed)}</span>
        </span>
        
    
        <!-- Video -->
        <span class = "row mt-3">
            <div class = "col-md">
                <video id = "streamVid" autoplay = "true" muted>
                    <track kind = "captions">
                </video>
            </div>
        </span>

        <i class = "my-2 text-secondary">Recording under the interview name of "{interviewName}"</i>
        
        <span><input type = "checkbox" id = "TTSCheck" bind:checked = {TTSChecked}/> <label for = "TTSCheck">Question is read out loud (Text to Speech)    </label></span>
        {#if !TTSChecked}
            <span class = "text-secondary">
                *Click the <i class="fa-solid fa-volume-up"></i> icon to still read the question out loud!
            </span>
        {/if} 
    {/if}       
</div>

<style>    
    #streamVid {
        -webkit-transform: scaleX(-1);
        transform: scaleX(-1);
        width: 600px;
    }
    video {
        width: 500px;
        aspect-ratio: 16/9;
        background-color: rgb(231, 250, 235);
        border: 1.5px black solid;
    }
    input[type="checkbox"] {
        scale: 1.3;
        margin-right: 0.3em;
    }
    
</style>
