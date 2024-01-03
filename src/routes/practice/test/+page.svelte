<video id="videoElement" width="640" height="480" autoplay controls></video>
  <button id="startRecording">Start Recording</button>
  <button id="stopRecording">Stop Recording</button>
  <a id="download">Download Video</a>

  <script>
	import { onMount } from "svelte";

    var videoElement
    var startRecordingButton
    var stopRecordingButton
    var downloadButton
    var mediaRecorder
    onMount(() => {
       videoElement = document.getElementById('videoElement');
      startRecordingButton = document.getElementById('startRecording');
      stopRecordingButton = document.getElementById('stopRecording');
      downloadButton = document.getElementById('download')

      

        startRecordingButton.addEventListener('click', () => {
          // Get user media (video in this case)
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoElement.srcObject = stream;
          mediaRecorder = new MediaRecorder(stream);

          // Event handler for data available
          mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

          // Event handler for when recording is stopped
          mediaRecorder.onstop = () => {
            console.log("here")
            const blob = new Blob(chunks, { type: 'video/mp4' });
            console.log(blob.type)
            chunks = [];

            // Create a download link for the recorded video
            const url = URL.createObjectURL(blob);
            console.log(url)
            downloadButton.href = url;
            downloadButton.download = 'recorded-video.mp4';

            // Set the recorded video as the source for playback
            videoElement.src = url;
          };
           // Start recording
           
           stopRecordingButton.addEventListener('click', () => {
              mediaRecorder.stop();
            });
            mediaRecorder.start();
          })
          .catch(error => console.error('Error accessing camera:', error));
          
        });

        // Stop recording
        
    })
    let chunks = [];

    
  </script>