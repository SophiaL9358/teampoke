<script>
	import { onMount } from 'svelte';
    import {user_sub, storage, app, db} from "$lib/global.js";
	import Navbar from '../../Navbar.svelte';
    import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
	import Video from '../video.svelte';

    var savedJob = "";

    onMount(async () => {
        // get saved job
        if ($user_sub != ""){
            const docResponse = await getDoc(doc(db, "Users/"+$user_sub ));
            if (docResponse.exists() && docResponse.savedJob != "" && docResponse.savedJob != undefined){
                savedJob = docResponse.data().savedJob;
                document.getElementById("jobName").value=savedJob
            } else if (!docResponse.exists()){
                await setDoc(doc(db, "Users/"+$user_sub ), {});
            }
        }
    })

    const getJobQuestion = async (questionStore, numQuestions) => {    
        var req = "POSITION QUESTION|"+savedJob+"|"+numQuestions
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

        console.log(data.result.split("|"))
        questionStore.set(data.result.split("|"))
    }
    const insertInStartQuestion = async () =>{ // before it disappears
        
        var jobName = document.getElementById("jobName")
        if (jobName.value == "") {
            alert("Please put a job name!")
            return false;
        }
        if (savedJob != jobName.value) {
            savedJob = jobName.value
            if ($user_sub != "" ) {
                await updateDoc(doc(db, "Users/"+$user_sub), {
                savedJob: savedJob
            });
            }
 
        }
        return true;
    }
    const insertInEndQuestion = () => {
        document.getElementById("jobName").value = savedJob;
    }

</script>
<Video getQuestion={getJobQuestion} insertInStartQuestion ={insertInStartQuestion} insertInEndQuestion = {insertInEndQuestion} title="Job-Specific">
    <span class ="d-flex w-100 text-nowrap mt-2 mb-3">
        <b>Job Name:</b>&nbsp;&nbsp;
        <input id ="jobName" type = "text" class = "w-100" value = "" placeholder="Name for Job" />
    </span>
</Video>