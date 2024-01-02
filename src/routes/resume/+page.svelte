<script>
    /** @type {import('./$types').LayoutData} */
    export let data;
	import Navbar from "../Navbar.svelte";   
    import {user_sub, storage, app} from "$lib/global.js";
	import { deleteObject, getBlob, getBytes, ref, uploadBytes } from "firebase/storage";
	import { onMount } from "svelte";

    let files;
    var storagePath = $user_sub+"/Resume/resume.pdf";
    var showResume = false;
    var myiFrame;

    onMount(() => {
        if ($user_sub == "") {
            alert("The resume upload page requires you to be signed in! Redirecting to login page...")
            document.location.href = "/"
        }

        getBlob(ref(storage, storagePath)).then((file)=>{
            showResume = true
            myiFrame.src=URL.createObjectURL(file);
            console.log(file.name)
            files = [file]
        }).catch((e) => {console.log("Resume is not uploaded."); showResume = false})
    })

    const onFileSelected = async (e) => {
        const fileList = e.target.files;
        files = fileList;
        if (fileList?.length > 0) {
            myiFrame.src = URL.createObjectURL(fileList[0])
            console.log(fileList[0]);
            showResume = true
            await uploadBytes(ref(storage, storagePath), fileList[0]).then((e) => {console.log("Resume uploaded!")});
        }
    }
    const deleteResume = () => {
        if (showResume){
            deleteObject(ref(storage, storagePath)).then(()=>{
                myiFrame.src = ""
                showResume = false

            })
        }
        
    }

 
</script>



<Navbar back = true />
<div class = "w-100 px-4">
    <div class = "row">
        <div class = "col-lg-4 mt-4 px-3 text-center flex-column fs-5">
            Click the button below to upload your resume!
            <br>
            <button class = "bg-resume poke-btn mt-4">
                <label for="file-selector" class="uploadFileBtn">
                        Upload Resume   
                </label>
            </button>
            <button class = "btn text-dark fs-5 poke-btn mt-2 text-decoration-underline" on:click = {deleteResume}>Clear Resume</button>
    
            <input type = "file" class = "text-break hide" id = "file-selector" accept=".pdf" on:change={onFileSelected} />  
            {#if showResume}
                <hr>
                <div class = "text-secondary">With your resume is uploaded, click 
                    <br>
                    <a href = "/practice/resume"><button class = "poke-btn text-dark bg-resume-questions fs-5" >
                        Resume-Specific Questions 
                        <i class="fa-regular fa-file"></i>
                    </button></a> 
                    in the Start an Interview Section to practice questions related to your resume!</div>
            {/if}  
            <br>
        </div>
        <div class = "col-lg-8 text-center flex-center flex-column">
            {#if !showResume}
                <br>
                <b>Your resume will appear here!</b> 
            {/if}
            <iframe src = "" bind:this = {myiFrame} title = "resume" id = "myiFrame" class = "w-100" style = "height:calc(100vh - 110px); margin-top: 10px;"/>
            
        </div>
        
    </div>
    
</div>
    
        <!-- {#if files}
            Name: {files[0].name}
            <br>
            Uploaded: 12/17/23 (change)
            <br>
        {/if} -->
<style>


</style>
