<script>
	import { onMount } from 'svelte';
    import axios from 'axios'
    import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
    import DetectRTC from "detectrtc/DetectRTC";
    import {user_sub, storage, app} from "$lib/global.js";
	import Navbar from '../Navbar.svelte';
    
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
    var question = "---";

    const SPEECH_TEXT_API_TOKEN = "7e3f7994c52540bfb506b22bd1049800"
    const transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
    const headers={
    "Authorization": SPEECH_TEXT_API_TOKEN,
    "Content-Type": "application/json"
    }

    const getQuestion = async () => {
        var randomIndex =Math.trunc(Math.random()*(split.length));
        
        //fs.read
        /*fs.('./questions.txt', (err, data) => {
            if (err) throw err;
            console.log(data.toString());
        })*/
        question = split[randomIndex];
    }
    const startVideo = async () => {
        video = document.querySelector("#streamVid");
        downloadLink = document.getElementById("download")
        stopBtn = document.getElementById("stopBtn");

        mainQuestion.classList.remove("hide");
        noVideoPrompt.classList.add("hide");
        question = "Loading...";
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            // SOPHIA REMINDER: UR DEBIT CARD IS CONNECTED TO GOOGLE CLOUD ACC
            .then( (stream) => {
                var mainQuestion = document.getElementById("mainQuestion");
                var noVideoPrompt = document.getElementById("noVideoPrompt");
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
                     question = "---";

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

                        var storagePath = $user_sub + "/"+date+".mp4"
                        console.log(storagePath);
                        var vidRef = ref(storage, storagePath);
                        await uploadBytes(vidRef, blobVid).then((e) => {console.log("video uploaded!")});
                        console.log("upload finished")
                    } else {
                        console.log("USER NOT SIGNED IN");
                    }

                    // a tag link
                    downloadLink.href = URL.createObjectURL(blobVid);
                    downloadLink.download = 'interview.mp4';

                    // run speech-text
                    var downloadURL = "Placeholder";
                    
                    await getDownloadURL(ref(storage, "video.mp4"))
                        .then((url) => {downloadURL = url; console.log(downloadURL)})
                        .catch(() => {console.log("Something went wrong!")})

                    console.log(downloadURL)
                    const data = {
                        audio_url: downloadURL //"https://github.com/SophiaL9358/teampoke/raw/main/static/yes.mp3"
                        //"http://localhost:5173/yes.mp4" 
                        //"https://github.com/AssemblyAI-Examples/audio-examples/raw/main/20230607_me_canadian_wildfires.mp3"
                    }
                    /*
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
                    }*/
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
    let cameraReady = "";
    let microphoneReady = "";
    DetectRTC.load(function() {
        console.log(DetectRTC.hasWebcam===true);
        console.log(DetectRTC.hasMicrophone===true);
    if (DetectRTC.hasWebcam === true && DetectRTC.isWebsiteHasWebcamPermissions === true) {
        cameraReady = "Ready";
    }
    else if (DetectRTC.hasWebcam === false) {
        cameraReady = "Not Connected";
    }
    else{
        cameraReady = "No Permissions";
    }

    if (DetectRTC.hasMicrophone === true && DetectRTC.isWebsiteHasMicrophonePermissions === true) {
        microphoneReady = "Ready";
    }
    else if (DetectRTC.hasMicrophone === false) {
        microphoneReady = "Not Connected";
    }
    else{
        microphoneReady = "No Permissions";
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
<div class = "w-100 text-light mb-5 pb-5">
    
    <div class = "w-100 p-4 d-flex flex-column align-items-center">
        <span class = "fs-4 text-dark">{question}</span>
        
        <span class = "d-flex">
            <span id = "noVideoPrompt" >
                <form on:submit = {() => {console.log("happening");startVideo();getQuestion();}}  class = "d-flex w-100 mt-2 justify-content-center align-content-center" style = "height: 50px;">
                    <!-- <i>Key Points on Resume!</i>
                        <input required placeholder = "ie. NIST Internship" class = "w-100" rows = "5" type = "text">-->
                        <input type = "submit" value = "Start Video" class = "btn btn-success" />
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
                <video id = "streamVid" autoplay = "true">
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