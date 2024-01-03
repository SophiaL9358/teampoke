<script>
    import { logoutAndReturn, user_sub } from "$lib/global.js";
	import { onMount } from "svelte";
    export var back = false;
    export var guest = false;
    export var doBeforeExiting = () => {};

    if ($user_sub == "") {
        guest = true;
        
    } 
    onMount(()=> {
        if (window.location.pathname != '/home' && window.location.pathname != '/home/'){
            back = true;
        }
    })

    const goBack = () => {
        doBeforeExiting();
        document.getElementById("goToHome").click()
    }
    const goLogin = () => {
        doBeforeExiting();
        document.getElementById("goToLogin").click()
    }
</script>

<section class = "w-100 flex-center px-5 fs-5" style = "height: 70px; margin-bottom: 10px; background-color: #2B7F80;">
    {#if !back && guest}
        <div class = "text-light me-auto">
            <button class = "btn fs-5 text-light" on:click = {goLogin}><i class="fa-solid fa-arrow-left-long " ></i>&nbsp;&nbsp;Back to Login</button>
        </div>
    {:else if back}
        <div class = "text-light me-auto">
            <button class = "btn fs-5 text-light" on:click = {goBack}><i class="fa-solid fa-arrow-left-long"></i>&nbsp;&nbsp;Back To Home</button>
        </div>
    {/if}
    
    {#if !guest}
        <div class = "ms-auto h-100">
            <button class = "btn px-3 fs-5 h-100" id = "logoutBtn" on:click = {() => {doBeforeExiting(); logoutAndReturn();}}>
                Logout
            </button>
        </div>
    {/if}
</section>

<a href = "/home"><button class = "hide" id = "goToHome">change to home</button></a>
<a href = "/"><button class = "hide" id = "goToLogin">change to home</button></a>

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
    a:hover {
        cursor: pointer;
    }
</style>