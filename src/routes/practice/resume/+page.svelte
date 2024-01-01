<script>
	import { onMount } from 'svelte';
    import { ref, getDownloadURL, uploadBytes, getBlob } from "firebase/storage";
    import DetectRTC from "detectrtc/DetectRTC";
    import {user_sub, storage, app, db} from "$lib/global.js";
	import Navbar from '../../Navbar.svelte';
    import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
	import Video from '../video.svelte';

    var resumeText = "";
    var resumeSections = [];

    onMount(() => {
        getBlob(ref(storage, $user_sub+"/Resume/resume.pdf")).then(async (file)=> {
            let buffer = await fetch(URL.createObjectURL(file)).then(r => r.arrayBuffer());
            getPdfText(buffer).then((text) =>{
                resumeText = text;
                while (resumeText.length > 1){
                    var end = 100;
                    if (resumeText.length < end) {
                        end= resumeText.length;
                    }
                    console.log(end);
                    resumeSections.push(resumeText.substring(0, end));
                    resumeText = resumeText.substring(end);
                }
            })
            console.log(resumeSections)
        })
        console.log(resumeSections, 'test')
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


    const getResumeQuestion = async (questionStore) => {      
        var index = Math.floor(Math.random() * resumeSections.length)%resumeSections.length;
        console.log(index);  

        var req = "RESUME QUESTION,"+resumeSections[index];
        console.log(req);
        const response = await fetch("../api", {
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
        console.log(data.result)
        questionStore.set(data.result)
    }
</script>
<Navbar/>
<Video getQuestion={getResumeQuestion}>
    <input type = "checkbox" id = "showResume"/> <label for = "showResume" class = "text-dark">Show Resume Text</label>
    {resumeText}
</Video>

<style>
    input[type="checkbox"]{
        scale:1.5;
        margin: 5px 10px;
    }
</style>
