<script>
	import Footer from "./Footer.svelte";
	import BetterAuth from "./betterAuth.svelte";
    import {user_sub, user_name} from "$lib/global.js"

    const continueLocally = () => {
        // local storage => user_sub, user_name
        if (localStorage.getItem("user_sub") == null) {
            var tempName = prompt("Please enter your name:")
            var tempSub = Math.trunc(Math.random()*(999999999))

            localStorage.setItem("user_name", tempName)
            localStorage.setItem("user_sub", tempSub)
        }
        user_sub.set(localStorage.getItem("user_sub"))
        user_name.set(localStorage.getItem("user_name"))
        document.getElementById("changePage").click()
    }
            

</script>
<a target ="_blank" href = "https://www.arcfc.org/">
    <img src = "https://cdn.firespring.com/images/5adbf42d-0a16-4ec5-ae1b-0ec931f8247a.png" id = "logo" alt = "Arc of Frederick County Logo"/>
</a>
<section class = "flex-center flex-column text-center" style = "height: 100vh;">
    <span class = "d-flex"><h1>Mock Interview Practice</h1><img src = "/pokeco_ex_logo.png" alt = "pokeco logo" style = "height: 60px;" class = "ms-2"/></span>
    <span class = "mb-5">Questions? Email <a href="mailto:poke.co2023@gmail.com">poke.co2023@gmail.com</a></span>
    <BetterAuth/>

    <button class = "poke-btn bg-random-questions text-light" on:click = {continueLocally}>
        Contine Locally
    </button>

    <a href = "/home">
        <button class = "poke-btn bg-resume-questions text-dark mt-3">
            Contine As Guest
        </button>
    </a>
    <br><br><br>
    
</section>
<a href = "/home"><button id = "changePage" class = "hide">Change Page</button></a>

<style>
    button {
        width: 250px;
    }
    #logo {
        position: absolute;
        height: 130px;
        bottom: 7px;
        left: 7px;
        
    }
    section {
        padding: 100px 25px 100px 25px !important;

    }
</style>
