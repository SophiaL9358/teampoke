<script>
	import { onMount } from 'svelte';
    import axios from 'axios'
    import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
    import DetectRTC from "detectrtc/DetectRTC";
    import {user_sub, storage, app} from "$lib/global.js";
	import Navbar from '../Navbar.svelte';
    
    // its too complicated to put it in a txt file cause modules and context and svelte and *dies*
    var questions = `Why are you interested in this internship, and what skills or experiences do you hope to gain?
What’s the best team you’ve ever been a part of and why?
What’s your ideal team?
Tell me about a time you overcame a challenge or obstacle.
Tell me about a time you had to learn something completely new.
Can you tell me about a project or accomplishment you’re proud of, and why?
Do you have any questions for us?
Tell me about yourself.
Walk me through your resume.
How did you hear about this position?
Why do you want to work at this company?
Why do you want this job?
Why should we hire you?
What can you bring to the company?
What are your greatest strengths?
What do you consider to be your weaknesses?
Tell me about a challenge or conflict you’ve faced at work, and how you dealt with it.
Tell me about a time you demonstrated leadership skills.
Tell me about a time you made a mistake.
Tell me about a time you failed.
What type of environment do you prefer?
What’s your work style?
What’s your management style?
How do you deal with pressure or stressful situations?
What do you like to do outside of work?
Are you planning on having children?
How do you stay organized?
How do you prioritize your work?
What are you passionate about?
What motivates you?
How do you like to be managed?
Do you consider yourself successful?
Where do you see yourself in five years?
How do you plan to achieve your career goals?
What are your career aspirations?
What’s your dream job?
What other companies are you interviewing with?
What makes you unique?
What should I know that’s not on your resume?
What would your first few months look like in this role?
Is there anything else you’d like us to know?`;
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
        navigator.mediaDevices.getUserMedia({ video: true })
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

                    var blobVid = new Blob(recordedChunks);
                    transcript ="--LOADING--"
                    // upload to firebsae
                    console.log("starting upload")
                    
                    // upload
                    if ($user_sub != ""){
                        var date = new Date();
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
                    downloadLink.download = 'video.mp4';

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
<div class = "w-100 text-light " style = "height: 110vh;">
    
    <div class = "w-100 p-4 d-flex flex-column align-items-center">
        <span class = "fs-4 text-dark">{question}</span>
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
              <td><i class="fa-solid fa-camera"></i></td>
              <td style="font-size:30px">{cameraReady}</td>
              <td style="width:30px"></td>
              <td><i class="fa-solid fa-microphone"></i></td>
              <td style="font-size:30px">{microphoneReady}</td>
            </tr>
          </table>
        <a id = "download" download>Download Voice Recording</a>
            <span class = "d-flex">
            <form  id = "noVideoPrompt" on:submit = {() => {console.log("happening");startVideo();getQuestion();}}  class = "d-flex w-100 mt-2 justify-content-center align-content-center" style = "height: 50px;">
                <!-- <i>Key Points on Resume!</i>
                    <input required placeholder = "ie. NIST Internship" class = "w-100" rows = "5" type = "text">-->
                    <input type = "submit" value = "Start Video" class = "btn btn-success" />
                </form>
        <span id = 'mainQuestion' class ="hide">
            <input id = "stopBtn"  type  = "button" class = "btn btn-danger mt-2 py-2" value= "Stop Video" />
        </span>
        <input type = "button" value = "New Question" class = "btn btn-primary mt-2 mx-1" on:click = {getQuestion} />  
      </span>
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