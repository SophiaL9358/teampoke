<script>
    export var back = false;
</script>

<section class = "w-100 bg-contrast-blue flex-center px-5 fs-5" style = "height: 80px">
    {#if back}
        <div class = "text-light">
            <i class="fa-solid fa-arrow-left-long"></i>&nbsp;&nbsp;Back
        </div>
    {/if}
    <div class = "ms-auto">
        <button class = "btn btn-outline-light px-4 fs-5">
            Logout
        </button>
    </div>
</section>