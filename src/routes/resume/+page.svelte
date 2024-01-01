<script>
    /** @type {import('./$types').LayoutData} */
    export let data;
	import Navbar from "../Navbar.svelte";   
    import {user_sub, storage, app} from "$lib/global.js";
	import { getBlob, getBytes, ref, uploadBytes } from "firebase/storage";
	import { onMount } from "svelte";

    let files;
    var storagePath = $user_sub+"/Resume/resume.pdf";

    onMount(() => {
        if ($user_sub == "") {
            alert("The resume upload page requires you to be signed in! Redirecting to login page...")
            document.location.href = "/"
        }

        getBlob(ref(storage, storagePath)).then((file)=>{
            var myiFrame = document.getElementById("myiFrame");
            myiFrame.src=URL.createObjectURL(file);
            console.log(file.name)
            files = [file]
        })
    })

    const onFileSelected = async (e) => {
        const fileList = e.target.files;
        files = fileList;
        if (fileList?.length > 0) {
            var myiFrame = document.getElementById("myiFrame");
            myiFrame.src = URL.createObjectURL(fileList[0])
            console.log(fileList[0]);
            await uploadBytes(ref(storage, storagePath), fileList[0]).then((e) => {console.log("video uploaded!")});
        }
    }

</script>



<body>
    <Navbar back = true />
    <div class = "row w-100">
        <div class = "col-md-4 p-4 text-center flex-column fs-5">
            <!-- {#if files}
                Name: {files[0].name}
                <br>
                Uploaded: 12/17/23 (change)
                <br>
            {/if} -->
            Click the button below to upload your resume!
            <br>
            <br>
            <button class = "bg-contrast-light-orange poke-btn">
                <label for="file-selector" class="uploadFileBtn">
                        Upload Resume   
                </label>
            </button>
            <input type = "file" class = "text-break hide" id = "file-selector" accept=".pdf" on:change={onFileSelected} />    
        </div>
        <div class = "col-md-8 text-center">
            <iframe title = "resume" id = "myiFrame" class = "w-100" style = "height:calc(100vh - 110px); margin-top: 10px;"/>
        </div>
    </div>
    
</body>

<style>


</style>
