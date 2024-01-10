<script>
	import { onMount } from 'svelte';
    import { ref, getDownloadURL, uploadBytes, getBlob } from "firebase/storage";
    import DetectRTC from "detectrtc/DetectRTC";
    import {user_sub, storage, app, db} from "$lib/global.js";
	import Navbar from '../../Navbar.svelte';
    import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
	import Video from '../video.svelte';

    var resumeText = "";
    var resumeWords = []; // not just words
    var resumeCheck = false;
    var resumeExists = true;

    onMount(() => {
        if ($user_sub == "") {
            alert("The resume practice page requires you to be signed in! Redirecting to login page...")
            document.location.href = "/"
        }

        getBlob(ref(storage, $user_sub+"/Resume/resume.pdf")).then(async (file)=> {
            let buffer = await file.arrayBuffer()
            getPdfText(buffer).then((text) =>{
                resumeText = text;
                resumeWords = resumeText.split(" ")
                console.log(resumeWords)
            })
            
        }).catch((e) => {
            resumeExists = false;
        })
    })

    async function getPdfText(data) {
        let pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/+esm").then(m => m.default);
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.worker.min.js";

        let doc = await pdfjsLib.getDocument({data}).promise;
        let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
            return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('');
        });
        return (await Promise.all(pageTexts)).join('');
    }


    const getResumeQuestion = async (questionStore, numQuestions) => {      
        var wordAmt = 15
        var res = [];

        for (var j = 0; j < numQuestions; j ++ ){
            var index = Math.floor(Math.random() * resumeWords.length)%(resumeWords.length-wordAmt);
            var text = ""
            for (var i = index; i < index + wordAmt; i ++) {
                text += resumeWords[i] + " "
            }

            var req = "RESUME QUESTION|"+text;
            const response = await fetch("../../api", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ req }),
                });

            const data = await response.json();
            if (response.status !== 200) {
                throw data.error || new Error(`Request failed with status ${response.status}`);
            }
            res.push(data.result)
        }
        
        console.log(res)
        questionStore.set(res)
    }
    
    const insertInStartQuestion = () => {
        if (!resumeExists) {
            alert ("Please upload your resume first! Click the \"Upload Resume\" button in the \"Edit/Check your Profile\" section on the home page.")
            return false
        }
        return true
    }
</script>
<Video getQuestion={getResumeQuestion} insertInStartQuestion= {insertInStartQuestion} title="Resume-Specific">
    {#if !resumeExists}
        <div class = "text-danger mt-2">Your resume is not uploaded, Upload your resume at: </div>
        <a href = "/resume"><button class = "poke-btn text-dark w-100 bg-resume"> 
            Upload Resume
        </button></a> 
    {:else}
        <span class = "mt-1 mb-2">
            <input type = "checkbox" id = "showResume" bind:checked = {resumeCheck}/> <label for = "showResume" class = "text-dark">Show Resume Text</label>
        </span>
        {#if resumeCheck}
            {resumeText}
            <br>
        {/if}
    {/if}
    
</Video>

<style>
    input[type="checkbox"]{
        scale:1.5;
        margin: 5px 10px;
    }
</style>
