<script>
    /** @type {import('./$types').LayoutData} */
    export let data;
	import Navbar from "../Navbar.svelte";
   


    let files;
    let filename;
    let img;
   
    const onChange = () => {
        if (files && files[0]) {
            filename = files[0].name;
            console.log(filename);
            console.log(files[0])
            console.log("HEI")
        } else {
            console.log("Didn't work");
        }
        console.log("HEI!!")
    }



</script>


<Navbar back = true guest = true/>
<body class="">
   
    <section class = "w-100 flex-center flex-column text-center mt-5" >


        <!-- https://gist.github.com/dahnielson/59566b3d91cc8cf09c13d1419604a8a2 -->
        <div class = "flex-center text-center w-100">
            <button class = "poke-btn bg-contrast-light-orange">
                <label for="files" class="upload-btn ">
                    Upload Resume
                </label>
            </button>
           
            <input id="files" style="visibility:hidden; display: none;" type="file" bind:files accept="application/pdf,application/msword,
            application/vnd.openxmlformats-officedocument.wordprocessingml.document">
          </div>
            {#if files && files[0]}
                <p>
                    {files[0].name}
                </p>
                <embed src={files[0].mozFullPath} width="800px" height="2100px" />
            {/if}
            

    </section>


</body>
<style>


</style>
