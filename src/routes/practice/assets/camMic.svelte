<script>
    export var cameraReady;
    export var microphoneReady;
    export var recordVideo;
    export var recordAudio;
</script>
<div class = "row w-100 mt-4">
    <div class = "col-lg-6 fs-5">
        {#if !recordVideo}
            <i class = "text-secondary">Not using the camera</i>
        {:else}
            <i class="fa-solid fa-camera me-1 fs-5"></i>&nbsp;Camera: 
            {#if cameraReady == "Camera Ready"}
                <span class = "text-success"> Ready </span>
            {:else}
                <span class = "text-danger"> No Permissions </span>
            {/if}
        {/if}
    </div>
    <div class = "col-lg-6 fs-5">
        {#if !recordAudio}
            <i class = "text-secondary">Not using the microphone</i>
        {:else}
            <i class="fa-solid fa-microphone me-1 fs-5"></i>&nbsp;Microphone:
            {#if microphoneReady == "Microphone Ready"}
                <span class = "text-success"> Ready </span>
            {:else}
                <span class = "text-danger"> No Permissions </span>
            {/if}
        {/if}
    </div>
</div>