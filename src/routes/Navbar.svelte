<script>
    import { logoutAndReturn, user_sub } from "$lib/global.js";
    export var back = false;
    export var guest = false;

    if ($user_sub == "") {
        guest = true;
    }
</script>

<section class = "w-100 bg-contrast-blue flex-center px-5 fs-5" style = "height: 80px">
    {#if guest}
        <div class = "text-light me-auto">
            <a href = "/"><i class="fa-solid fa-arrow-left-long "></i>&nbsp;&nbsp;Back to Login</a>
        </div>
    {/if}
    {#if back && !guest}
        <div class = "text-light">
            <a href = "/home"><i class="fa-solid fa-arrow-left-long"></i>&nbsp;&nbsp;Back To Home</a>
        </div>
    {/if}
    {#if !guest}
        <div class = "ms-auto">
            <button class = "btn btn-outline-light px-4 fs-5" on:click = {logoutAndReturn}>
                Logout
            </button>
        </div>
    {/if}
</section>

<style>
    a {
        color: white;
        text-decoration: none;
    }
</style>