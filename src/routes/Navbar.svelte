<script>
    import { logoutAndReturn, user_sub } from "$lib/global.js";
	import { onMount } from "svelte";
    export var back = false;
    export var guest = false;
    

    if ($user_sub == "") {
        guest = true;
        
    } else if (window.location.pathname != '/home'){
        back = true;
    }
</script>

<section class = "w-100 flex-center px-5 fs-5" style = "height: 70px; margin-bottom: 10px; background-color: #2B7F80;">
    {#if guest}
        <div class = "text-light me-auto">
            <a href = "/"><i class="fa-solid fa-arrow-left-long "></i>&nbsp;&nbsp;Back to Login</a>
        </div>
    {:else if back}
        <div class = "text-light me-auto">
            <a href = "/home"><i class="fa-solid fa-arrow-left-long"></i>&nbsp;&nbsp;Back To Home</a>
        </div>
    {/if}
    
    {#if !guest}
        <div class = "ms-auto h-100">
            <button class = "btn px-3 fs-5 h-100" id = "logoutBtn" on:click = {logoutAndReturn}>
                Logout
            </button>
        </div>
    {/if}
</section>

<style>
    #logoutBtn {
        color: white;
        transition: 200ms;
        
    }
    #logoutBtn:hover {
        border-color: white;
        border-radius: 0em;
        border-width: 0px 1px;
        background-color: white;
        color: black;
    }
    a {
        color: white;
        text-decoration: none;
    }
</style>