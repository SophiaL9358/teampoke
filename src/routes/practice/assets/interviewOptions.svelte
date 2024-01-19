<script>
	import { onMount } from "svelte";
    import { user_sub } from "$lib/global.js";

    export let TTSChecked;
    export let TimerCheck;
    export let VideoChecked;
    export let AudioChecked;
    export let RecordCheck;
    export let duringInterview = false;

    let loaded = false;
    onMount(() => {
        if ($user_sub == ""){
            document.getElementById("RecordVideo").disabled = true
            RecordCheck = false
        }
        loaded = true;
    })
    $: if (loaded && !VideoChecked && !AudioChecked) {
        document.getElementById("RecordVideo").disabled = true
        RecordCheck = false
    } else if (loaded && $user_sub != "") {
        document.getElementById("RecordVideo").disabled = false
    }
</script>
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
    {#if !duringInterview}
        <div class="form-check form-switch mt-2">
            <input class="form-check-input" bind:checked={VideoChecked} type="checkbox" role="switch" id="VideoChecked">
            <label class="form-check-label" for="VideoChecked">Record the video</label>
        </div>   
        <div class="form-check form-switch mt-2">
            <input class="form-check-input" bind:checked={AudioChecked} type="checkbox" role="switch" id="AudioCheck">
            <label class="form-check-label" for="AudioCheck">Record the audio</label>
        </div>  
    {/if}
    <!-- <i class = "w-100 text-center mt-3">-- Recording Options --</i> -->
    <div class="form-check form-switch mt-2">
        <input class="form-check-input" bind:checked = {RecordCheck} type="checkbox" role="switch" id="RecordVideo">
        <label class="form-check-label" for="RecordVideo">Save the interview to your account</label>
    </div>
    {#if $user_sub == ""}
        <span class = "text-secondary">
            *Because you're not signed in, saving the video is disabled
        </span>
    {:else if RecordCheck && !VideoChecked}
        <span class = "text-secondary">
            *Only the audio will be saved
        </span>
    {:else if RecordCheck && !AudioChecked}
        <span class = "text-secondary">
            *Only the video will be saved
        </span>
    {/if} 
</div>

<style>
    input[type="checkbox"] {
        scale: 1.1;
        border-color: #2A7F80;
    }
    input:checked{
        background-color: #2A7F80;
    }

</style>