
<script>
	import { onMount } from "svelte";

      var startButton ;
      var outputDiv 
      var recognition
      var text = "";
    onMount(() => {
         startButton = document.getElementById('startButton');
        outputDiv = document.getElementById('output');
        recognition = new webkitSpeechRecognition() || new SpeechRecognition();
      
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 3;

        startButton.addEventListener('click', () => {
            recognition.start();
            startButton.textContent = 'Recording...';
        });

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
            startButton.disabled = false;
            startButton.textContent = 'Start Recording';
        };

        recognition.onerror = event => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onnomatch = () => {
            console.log('No speech was recognized.');
        };
    })
</script>

<div class="container">
    <h1 class="title">Speech to Text</h1>
    <button id="startButton" class="recordButton">Start Recording</button>
    <div id="output" class="outputText">{text}</div>
</div>

<style>
    body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}

.container {
  text-align: center;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.title {
  color: #333;
  margin-bottom: 20px;
}

.recordButton {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.recordButton:hover {
  background-color: #0056b3;
}

.outputText {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  font-size: 18px;
}

</style>