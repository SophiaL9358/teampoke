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
	import CamMic from "./assets/camMic.svelte";
	import jquery from "jquery";

    export var getQuestion;
    export var insertInStartQuestion = () => {return true}; // before showVideo turns true, true: continue, false: leave function
    export var insertInEndQuestion = () => {}; // after showVideo turns false
    export var title = "";

    // Variables
    var mediaRecorder;
    var recordedChunks;
    var interviewName;
    var downloadLinkProgress = "none" // none = no link, progress = still being created, done = can click on it!
    var objUrl;

    var secondsPassed = writable(0)
    var questionsPassed = writable(1)
    var totalQuestions = 1

    var showVideo = false;
    var showVideoAfterwards = true; // controls "show video of *interview name*"
    var loaded = false;

    var question = writable("---");
    const synth = window.speechSynthesis;

    const minQuestions = 2;
    const maxQuestions = 15;

    // Interview Options/Switches
    var TTSChecked = true; // controls TTS checkbox
    var RecordCheck = true;
    var VideoChecked = true;
    var TimerCheck = true;

    onMount(() => {
        document.getElementById("interviewName").value = generateInterviewName();
        loaded = true;
        DetectRTC.load(() => {
            changeCamMicPerms()    
        })
    })

    const startVideo = async () => {
        if (!(await insertInStartQuestion())){ // false = break the function, true = continue
            return;
        }
        if (document.getElementById("interviewName").value.includes("|")) {
            alert("Please do not include \"|\" in the interview name!")
            return;
        }

        interviewName = document.getElementById("interviewName").value;
        totalQuestions = document.getElementById("numQuestions").value;
        if (totalQuestions > maxQuestions) {totalQuestions = maxQuestions;}
        if (totalQuestions < minQuestions) {totalQuestions = minQuestions;}
        secondsPassed.set(0) // 830 = 13:50
        questionsPassed.set(1);
        showVideo = true;
        question.set("Loading...");
        
        var videoMode = false;
        if (VideoChecked){
            videoMode = { facingMode: "user "}
        }
        if (cameraReady != "Camera Ready" || microphoneReady != "Microphone Ready"){
           try {
            await navigator.mediaDevices.getUserMedia({ audio: true, video: videoMode})
           } catch(e) {
            console.log("Denied.");
           }
            
            changeCamMicPerms();
            if (cameraReady != "Camera Ready" || microphoneReady != "Microphone Ready"){
                alert("Please check your camera/mic permissions.")
                showVideo = false;
                return;
            }
        }
        navigator.mediaDevices.getUserMedia({ audio: true, video: videoMode})
            .then( (stream) => {
                changeCamMicPerms();
                
                // timer vars
                var timerID;

                if (VideoChecked){
                    document.getElementById("videoContainer").classList.remove("hide");
                } else {
                    document.getElementById("videoContainer").classList.add("hide");
                }

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
                    document.getElementById("numQuestions").value = totalQuestions;
                    downloadLinkProgress = "progress"
                    question.set("---");

                    const blobVid = new Blob(recordedChunks, { type: "video/webm"  }); // recordedChunks[0].type
                    // set interview name
                    var dateVar = new Date();
                    var time = dateVar.getTime()
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
                    if (RecordCheck && $user_sub != ""){ // doesn't work if user is not signed in                    
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
                    showVideo = false;
                    mediaRecorder.stop();
                    var video = document.querySelector("#streamVid");
                    var stream = video.srcObject;
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
                
            }).catch((e) => {
                console.log(e)
                console.log("Something went wrong!")
            })
        await getQuestion(question, totalQuestions);
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
        let utterance = new SpeechSynthesisUtterance($question[$questionsPassed - 1]);
        speechSynthesis.speak(utterance);
    }

    let cameraReady = "";
    let microphoneReady = "";

    const changeCamMicPerms = () => {
        if (DetectRTC.hasWebcam && DetectRTC.isWebsiteHasWebcamPermissions) { cameraReady = "Camera Ready"; }
        else if (!DetectRTC.hasWebcam) { cameraReady = "Camera Not Detected"; }
        else{ cameraReady = "No Camera Permissions"; }

        if (DetectRTC.hasMicrophone && DetectRTC.isWebsiteHasMicrophonePermissions) { microphoneReady = "Microphone Ready"; }
        else if (!DetectRTC.hasMicrophone) { microphoneReady = "Microphone Not Detected"; }
        else{ microphoneReady = "No Microphone Permissions"; }
    }
</script>
<Navbar doBeforeExiting = {() => {if (showVideo) {document.getElementById("stopBtn").click();}}}/>
<div class = "w-100 text-dark mb-5 pb-5 p-2 flex-center flex-column text-center w-100">
    {#if !showVideo}
        <h3 class = "mt-4">{title} Interview</h3>
        <a class = "mb-2" href="https://docs.google.com/forms/d/e/1FAIpQLSc_MjUCR9BvyFZFbxryo_GlnQtdQEDNcfoUxGfc_ahUxyTVXQ/viewform" target="_blank">Take the Post-Interview Survey</a>

        <div class = "row container d-flex justify-content-center">
            <div class = "col-lg-7 border border-2 p-3 mt-2 text-center d-flex flex-column align-items-center">            
                <slot></slot>
                <!-- Number of Questions -->
                <span class ="d-sm-unset d-flex text-nowrap w-100 mt-2"> 
                    <label for = "numQuestions"><b>Number of Questions:</b></label>&nbsp;&nbsp;
                    <input id = "numQuestions" type = "number" class = "w-100" min = "{minQuestions}" max = "{maxQuestions}" value = "5" placeholder="Name for Interview" />&nbsp;
                </span>
                <span class = "w-100 text-start text-secondary">
                    *Minimum of {minQuestions} question, maximum of {maxQuestions} questions
                </span>
    
                <!-- Interview Name -->
                <label for = "interviewName" class = "mt-3 text-start w-100 mb-1"><b>Interview Name:</b></label>
                <span class ="d-flex w-100 text-nowrap">
                    <input id ="interviewName" type = "text" class = "w-100" placeholder="Name for Interview" />&nbsp;
                    <button class = "btn btn-outline-secondary" on:click  ={() => {document.getElementById("interviewName").value = generateInterviewName()}}><i class="fa-solid fa-rotate-right"></i> </button>
                </span>
                <!-- <span class = "w-100 text-start text-secondary">
                    *Interview name can be edited later in the "Past Interviews" section on the home page
                </span> -->

                <!-- Cam/Mic Settings -->
                <CamMic cameraReady = {cameraReady} microphoneReady = {microphoneReady} recordVideo = {VideoChecked&&RecordCheck} recordAudio = {RecordCheck}/>

                {#if interviewName != undefined}
                    <span class = "mt-3"><input type = "checkbox" bind:checked = {showVideoAfterwards} id = "VideoCheck"/> <label for = "VideoCheck">Show video of "{interviewName}"</label></span>
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
                        <br><i class = "text-danger">Please do not exit the page/start a new interview until the download link is finished being created.</i>
                    </span>
                {:else if downloadLinkProgress == "error"}
                    <span><i class = "text-danger">An error occurred! Please try recording again. If this error continues, please contact the developers at poke.co2023@gmail.com.</i></span>
                {/if}
            </div>
            <div class = " col-lg-4 mx-3 border border-2 p-3 mt-2 d-flex flex-column text-start">
                <i class = "w-100 text-center">--&nbsp;Interview Options&nbsp;--</i>
                <div class="form-check form-switch mt-2">
                    <input class="form-check-input" bind:checked = {TTSChecked} type="checkbox" role="switch" id="TTSCheck">
                    <label class="form-check-label" for="TTSCheck">Question is read out loud</label>
                </div>
                {#if !TTSChecked}
                    <span class = "text-secondary">
                        *Click the <i class="fa-solid fa-volume-up"></i> icon to still read the question out loud!
                    </span>
                {/if} 
                <div class="form-check form-switch mt-2">
                    <input class="form-check-input" bind:checked={TimerCheck} type="checkbox" role="switch" id="TimerCheck">
                    <label class="form-check-label" for="TimerCheck">Show the timer</label>
                </div>
                <div class="form-check form-switch mt-2">
                    <input class="form-check-input" bind:checked={VideoChecked} type="checkbox" role="switch" id="VideoChecked">
                    <label class="form-check-label" for="VideoChecked">Show the camera/video</label>
                </div>                
                <!-- <i class = "w-100 text-center mt-3">-- Recording Options --</i> -->
                <div class="form-check form-switch mt-2">
                    <input class="form-check-input" bind:checked = {RecordCheck} type="checkbox" role="switch" id="RecordVideo">
                    <label class="form-check-label" for="RecordVideo">Save the video and audio</label>
                </div>
                {#if RecordCheck && !VideoChecked}
                    <span class = "text-secondary">
                        *Because show camera/video is off, only the audio will be saved
                    </span>
                {/if} 
            </div>

        </div>
        <br>
        <!-- Start Video Button -->
        <form on:submit = {() => {startVideo();}}  class = "flex-center w-100 mt-2" style = "height: 50px;">
            <input type = "submit" id = "startVideoButton" value = "Start Video" class = "btn btn-success py-2 fs-5"/>
        </form>
    {:else}
        Question {$questionsPassed} out of {totalQuestions}:
        <!-- Question -->
        <div class = "d-inline-flex text-center">
            <button id = "repeatspeechbtn" class = "speak-btn" on:click={() => {repeatQuestion();}}><i class="fa-solid fa-volume-up"></i></button>
            <span class = "fs-4 text-dark">
                {#if $question == "Loading..."}
                    <div class = "spinner-border spinner-border-sm text-secondary mx-2"></div>{$question}
                {:else} 
                    {$question[$questionsPassed-1]}
                {/if}
            </span>
        </div>

        <!-- Stop/Next Question Button & Timer & # of questions-->
        <span class = "d-flex flex-center mt-3">
            <input style = "height: 55px; width: 200px;" id = "stopBtn"  type  = "button" class = "btn btn-danger me-2 fs-5" value= "Stop Video" />
            {#if $questionsPassed < totalQuestions} 
            <input style = "height: 55px; width: 200px;" type = "button" value = "New Question" class = "btn btn-primary fs-5" 
                on:click = {async ()=> {questionsPassed.set($questionsPassed+1); if (TTSChecked){repeatQuestion();}}} /> 
            {/if}
            {#if TimerCheck}
                <span style= "height: 55px" class = "border border-1 rounded flex-center px-3 text-end ms-3 fs-5">{formatTime($secondsPassed)}</span>
            {/if}
        </span>
        
    
        <!-- Video -->
        
        <span class = "row mt-3 hide" id = "videoContainer">
            <div class = "col-md">
                <video id = "streamVid" autoplay = "true" muted>
                    <track kind = "captions">
                </video>
            </div>
        </span>

        <i class = "my-2 text-secondary">Recording under the interview name of "{interviewName}"</i>
        
        <div class = " mx-3 border border-2 p-3 mt-2 d-flex flex-column text-start">
            <i class = "w-100 text-center">-- Interview Options --</i>

            <div class="form-check form-switch mt-2">
                <input class="form-check-input" bind:checked = {TTSChecked} type="checkbox" role="switch" id="TTSCheck">
                <label class="form-check-label" for="TTSCheck">Question is read out loud</label>
            </div>
            {#if !TTSChecked}
                <span class = "text-secondary">
                    *Click the <i class="fa-solid fa-volume-up"></i> icon to still read the question out loud!
                </span>
            {/if} 
            <div class="form-check form-switch mt-1">
                <input class="form-check-input" bind:checked={TimerCheck} type="checkbox" role="switch" id="TimerCheck">
                <label class="form-check-label" for="TimerCheck">Show the timer</label>
            </div>
            <div class="form-check form-switch mt-2">
                <input class="form-check-input" bind:checked = {RecordCheck} type="checkbox" role="switch" id="RecordVideo">
                <label class="form-check-label" for="RecordVideo">Save the video and audio</label>
            </div>
            {#if RecordCheck && !VideoChecked}
                <span class = "text-secondary">
                    *Because show camera/video is off, only the audio will be saved
                </span>
            {/if} 
        </div>
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
        scale: 1.1;
        border-color: #2A7F80;
    }
    input:checked{
        background-color: #2A7F80;
    }

</style>
