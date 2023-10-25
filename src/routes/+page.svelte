<script>
	import Footer from "./Footer.svelte";
	import GoogleAuthButton from "./GoogleAuthButton.svelte";


</script>
<a target ="_blank" href = "https://www.arcfc.org/">
    <img src = "https://cdn.firespring.com/images/5adbf42d-0a16-4ec5-ae1b-0ec931f8247a.png" id = "logo" alt = "Arc of Frederick County Logo"/>
</a>
<section class = "w-100 bg-light-yellow flex-center flex-column w-100 text-center" style = "height: 100vh;">
    <h1>Mock Interview Practice</h1>
    <span class = "mb-5">Questions? Email <a href="mailto:poke.co2023@gmail.com">poke.co2023@gmail.com</a></span>
    
    <GoogleAuthButton />
    <a href = "/practice">
        <button class = "poke-btn bg-light-green">
            Contine As Guest
        </button>
    </a>
    <br><br><br>
</section>

<style>
    #logo {
        position: absolute;
        height: 150px;
        bottom: 20px;
        left: 20px;
        
    }
    section {
        padding: 100px 0px 100px 0px !important;

    }
</style>
