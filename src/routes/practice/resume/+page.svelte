<script>
	import { onMount } from 'svelte';
    import { ref, getDownloadURL, uploadBytes, getBlob } from "firebase/storage";
    import DetectRTC from "detectrtc/DetectRTC";
    import {user_sub, storage, app, db} from "$lib/global.js";
	import Navbar from '../../Navbar.svelte';
    import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

    

    var mediaRecorder;
    var recordedChunks;
    var video;
    var downloadLink;
    var stopBtn;
    var savedJob = "";
    var resumeText = "";
    var resumeSections = [];

    // Binded
    var transcript = "---";
    var question = "---";

    const SPEECH_TEXT_API_TOKEN = "7e3f7994c52540bfb506b22bd1049800"
    const transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
    const headers={
    "Authorization": SPEECH_TEXT_API_TOKEN,
    "Content-Type": "application/json"
    }
    onMount(() => {
        getBlob(ref(storage, $user_sub+"/Resume/resume.pdf")).then(async (file)=> {
            let buffer = await fetch(URL.createObjectURL(file)).then(r => r.arrayBuffer());
            getPdfText(buffer).then((text) =>{
                resumeText = text;
                while (resumeText.length > 1){
                    var end = 300;
                    if (resumeText.length < end) {
                        end= resumeText.length;
                    }
                    console.log(end);
                    resumeSections.push(resumeText.substring(0, end));
                    resumeText = resumeText.substring(end);
                }
            })
            console.log(resumeSections)
        })
        console.log(resumeSections, 'test')
        // getSavedJob();
    })

    async function getPdfText(data) {
        let pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/+esm").then(m => m.default);
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.worker.min.js";

        let doc = await pdfjsLib.getDocument({data}).promise;
        let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
            return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('');
        });
        return (await Promise.all(pageTexts)).join('');
    }


    const getQuestion = async () => {      
        var index = Math.floor(Math.random() * resumeSections.length)%resumeSections.length;
        console.log(index);  

        var req = "RESUME QUESTION,"+resumeSections[index];
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
        var setup = document.getElementById("setup");
        var videoStreamRow = document.getElementById("videoStreamRow");

        mainQuestion.classList.remove("hide");
        noVideoPrompt.classList.add("hide");
        setup.classList.add("hide");
        videoStreamRow.classList.remove("hide");
        downloadLink.classList.add("hide");

        question = "Loading...";
        navigator.mediaDevices.getUserMedia({ video: true })
            // SOPHIA REMINDER: UR DEBIT CARD IS CONNECTED TO GOOGLE CLOUD ACC
            .then( (stream) => {
                var mainQuestion = document.getElementById("mainQuestion");
                var noVideoPrompt = document.getElementById("noVideoPrompt");
                var setup = document.getElementById("setup");
                var videoStreamRow = document.getElementById("videoStreamRow");
                var downloadLink = document.getElementById("download")
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
                     setup.classList.remove("hide");
                     videoStreamRow.classList.add("hide");
                     downloadLink.classList.remove("hide");
                     question = "---";

                    var blobVid = new Blob(recordedChunks);
                    transcript ="--LOADING--"
                    // upload to firebsae
                    console.log("Starting upload")
                    
                    // upload
                    if ($user_sub != ""){
                        var dateVar = new Date();
                        var interviewName = document.getElementById("interviewName").value;
                        var date= interviewName+"|"+(dateVar.getMonth()+1)+"-"+dateVar.getDate()+"-"+dateVar.getFullYear();
                        date += "|"+dateVar.getHours()+":"+dateVar.getMinutes()

                        var storagePath = $user_sub + "/Videos/"+date+".mp4"
                        var vidRef = ref(storage, storagePath);
                        await uploadBytes(vidRef, blobVid).then((e) => {console.log("video uploaded!")});
                        console.log("Upload finished")
                    } else {
                        console.log("USER NOT SIGNED IN");
                    }

                    // a tag link
                    downloadLink.href = URL.createObjectURL(blobVid);
                    downloadLink.download = 'interview.mp4';

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
                console.log("Something went wrong!",e);
            });
        getQuestion();
        
    }
    let cameraReady = "";
    let microphoneReady = "";
    DetectRTC.load(function() {
        console.log("Webcam?", DetectRTC.hasWebcam===true);
        console.log("Mic?", DetectRTC.hasMicrophone===true);
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
})
</script>
{#if user_sub == ""}
<Navbar guest = true/>
{:else}
<Navbar back=true/>
{/if}
<div class = "w-100 text-light mb-5 pb-5 flex-center flex-column">
    <div id = "setup" class = "border border-2 p-2 mt-5 text-dark text-center d-flex flex-column align-items-center" style = "width: 600px;">
        <i>Setup for the next interview practice</i>
        
        <span class ="d-flex w-100 text-nowrap mt-4">
            <b>Interview Name:</b>&nbsp;&nbsp;
            <input id ="interviewName" type = "text" class = "w-100" value = "Resume Specific Practice Interview" placeholder="Name for Interview" />
        </span>
        <span class = "w-100 text-start text-secondary">
            *Interview name can be edited later in the "Past Interviews" section on the home page
            <br><br>
            <input type = "checkbox" id = "showResume"/> <label for = "showResume" class = "text-dark">Show Resume Text</label>
        </span>
        <br>
        {resumeText}
        
        <table class = "mt-3 mb-2">
            <tr class ="text-dark">
              <td><i class="fa-solid fa-camera me-1"></i></td>
              <td style="font-size:30px">{cameraReady}</td>
              <td class = "px-1" style="width:30px"></td>
              <td><i class="fa-solid fa-microphone me-1"></i></td>
              <td style="font-size:30px">{microphoneReady}</td>
            </tr>
        </table>
    </div>
    


    <div class = "w-100 p-4 d-flex flex-column align-items-center text-center">
        <span class = "fs-4 text-dark">{question}</span>
        
        <span class = "d-flex">
            <span id = "noVideoPrompt" >
                <form on:submit = {() => {startVideo();}}  class = "d-flex w-100 mt-2 justify-content-center align-content-center" style = "height: 50px;">
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
        <a id = "download" class = "mt-3" download>Download Video Recording of Practice</a>
        <span class = "row hide" id = "videoStreamRow">
            <div class = "col-md">
                <video id = "streamVid" autoplay = "true">
                    <track kind = "captions">
                </video>
            </div>
            
        </span>
        
    </div>
</div> 
<style>
    
video {
    width: 600px;
    aspect-ratio: 16/9;
    background-color: rgb(231, 250, 235);
    border: 3px black solid;

    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
    -moz-transform:rotateY(180deg); /* Firefox */

}
input[type="checkbox"]{
    scale:1.5;
    margin: 5px 10px;
}
</style>
