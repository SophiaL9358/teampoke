<script>
	import jQuery from 'jquery';
	import { onMount } from 'svelte';
    import axios from 'axios'


    onMount(() => {
        startVideo();
    })

    var mediaRecorder;
    var recordedChunks;
    var video;
    var downloadLink;
    var stopBtn;

    const SPEECH_TEXT_API_TOKEN = "7e3f7994c52540bfb506b22bd1049800"
    const transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
    const headers={
    "Authorization": SPEECH_TEXT_API_TOKEN,
    "Content-Type": "application/json"
    }


    const startVideo = async () => {
        video = document.querySelector("#streamVid");
        downloadLink = document.getElementById("download")
        stopBtn = document.getElementById("stopBtn");

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            // SOPHIA REMINDER: UR DEBIT CARD IS CONNECTED TO GOOGLE CLOUD ACC
            .then( (stream) => {
                video.srcObject = stream;
                
                // audio
                recordedChunks = [];
                mediaRecorder = new MediaRecorder(stream);
                

                mediaRecorder.addEventListener('dataavailable', (e) => {
                    if (e.data.size >0) {
                        recordedChunks.push(e.data);
                    }
                })
                mediaRecorder.addEventListener('stop', async () => {
                    downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
                    downloadLink.download = 'test.mp3';
                    // audio things: 
                    console.log(downloadLink.href)
                    const data = {
                        audio_url: downloadLink.download
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
                            break
                        } else if (transcriptionResult.status === 'error') {
                            throw new Error(`Transcription failed: ${transcriptionResult.error}`)
                        } else {
                            await new Promise((resolve) => setTimeout(resolve, 3000))
                        }
                    }

                })
                stopBtn.addEventListener('click', () => {
                    video = document.querySelector("#streamVid");
                    var stream = video.srcObject;
                    var tracks = stream.getTracks();
                    
                    mediaRecorder.stop();
                    video.srcObject = null;

                    for (var i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        track.stop();
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
<div class = "row w-100">
    <div class = "col-md-3 p-4 d-flex justify-content-center flex-column align-content-center" style = "height: 100vh;">
        <i>Job Name</i>
        <textarea placeholder = "ie. Computer Science" class = "w-100" rows = "5"></textarea>
        <br><br>
        <i>Key Points on Resume!</i>
        <textarea placeholder = "ie. NIST Internship" class = "w-100" rows = "5"></textarea>
    </div>
    <div class = "col-md-9 p-4 pt-5 d-flex flex-column align-items-center">
        <!--

            <form class = "w-100">
            <span class = "w-100"><input type = "text"  placeholder = "Enter your answer here!" /> 
                <button >Enter</button></span>
        </form>
        <br>
        -->
        
        <span id = 'mainQuestion' class ="text-center fs-4">
            Tell me about a time where you showed leadership and problem solving?
        </span>
        
        <br>
        <span class = "row">
            <div class = "col-md">
                <video id = "streamVid" autoplay = "true">
                    <track kind = "captions">
                </video>
            </div>
            <div class = "col-md d-flex flex-column align-items-center justify-content-center">
                <button on:click = {startVideo} class = "btn btn-success">Start video</button>
                <br><br>
                <button id = "stopBtn" class = "btn btn-danger">Stop video</button>
            </div>
            
        </span>
        
        <a id = "download">Download Voice Recording</a>

        <br>
        <div class = "border border-3 w-75 text-center p-3">
            Lorem ipsum x 10000000000
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
    border: 2px rgb(173, 230, 189) solid;
    background-color:rgb(231, 250, 235);
}

textarea {
    border-radius: 10px;
}
</style>