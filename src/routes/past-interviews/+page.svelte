<script>
	import Navbar from "../Navbar.svelte";
    import {user_sub, storage, formatTime} from "$lib/global.js";
	import { deleteObject, getBlob, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
	import { writable } from "svelte/store";
	import jquery from "jquery";
	import { onMount } from "svelte";
    import getBlobDuration from "get-blob-duration";
    
    var downloadLink;
    var none = false;
    var interviews = []
    var show;
    const listRef = ref(storage, $user_sub+"/Videos/")

    onMount(() => {
        if ($user_sub == "") {
            alert("The past interview page requires you to be signed in! Redirecting to login page...")
            document.location.href = "/"
        }
        getInterviews();
    })

    function startDownload(fileName){
        getBlob(ref(storage, $user_sub+'/Videos/'+fileName)).then((blob)=> {
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = fileName;
            downloadLink.click();
        });
     
    }

    function getInterviews(){
        interviews=[]
        show = false;
        listAll(listRef).then((res) => {
            var count = 0;
            if (res.items.length == 0) {
                none = true;
                return
            }
            res.items.forEach((itemRef) => {
                var path = $user_sub+"/Videos/"+itemRef.name
                var setInterview = new Promise((resolve, reject) => {getBlob(ref(storage, path)).then(async (blob) => {
                    console.log()
                    var length = await getBlobDuration(blob)
                    var split = itemRef.name.split("|")
                    
                    var seconds = parseInt(split[1].split(".")[0])
                    var date = new Date(seconds)
                    var resDate = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
                    var resTime = (date.getHours()%12)+":";
                    if (date.getMinutes() < 10 ){
                        resTime += "0"
                    } 
                    resTime += date.getMinutes()
                    if (date.getHours() < 13) {
                        resTime+= " AM"
                    } else {
                        resTime += " PM"
                    }

                    interviews.push({name: split[0], 
                                raw_date: seconds,
                                date: resDate, 
                                time: resTime, filename: itemRef.name,
                                raw_len: length, 
                                len: formatTime(length)
                            })
                    count++
                    if (res.items.length == count) resolve()
                    })
                });
                
                setInterview.then(() => {
                    interviews.sort((a, b) => {return b.raw_date - a.raw_date})
                    show = true
                    
                })
                
            })
            
            
        }).catch((e) => {
            console.log("Something went wrong! Error:", e)
            none= "error"
        })
    }
    
    function deleteFile(filename, name){
        if (confirm("Are you sure you want to delete \""+name+"\"?")){
            deleteObject(ref(storage, $user_sub+"/Videos/"+filename)).then(()=>{getInterviews();});
        }  
    }

    async function editFile(filename, raw_date){
        var name = prompt("Please type the new interview name (enter with the text area blank to cancel):\n*Upon entering the new name, please wait a few seconds for the change to take place");
        if(name!="" && name != null){
            var newName = name+"|"+raw_date+".webm"
            getBlob(ref(storage, $user_sub+'/Videos/'+filename)).then( async (blob)=> {
                await uploadBytes(ref(storage, $user_sub+'/Videos/'+newName), blob).then((e) => {
                    console.log("video uploaded!")
                    deleteObject(ref(storage, $user_sub+"/Videos/"+filename)).then(()=>{getInterviews();});
                });
                
            }).catch((e) => {
                console.log("Something went wrong! Error:",e)
            })
            
            console.log("UPLOADED")
        }
        

    }
    async function previewFile(filename) {
        var link = await getDownloadURL(ref(storage, $user_sub+'/Videos/'+filename))
        return link
    }
    
    
</script>
<Navbar/>
<br>
<section class = "w-100 text-center pb-5 mt-2 flex-center flex-column">
    <h2>Past Interviews</h2>
    
    {#if none == "error"}
        <b>An error occurred. Please try logging in again. If the error persists, please contact the developers at poke.co2023@gmail.com!</b>
    {:else if none}
        <b class = "w-75">You currently have no interviews stored. Click on one of the interview options in the "Start Interview" section on the homepage to record one!</b>
    {:else if !show}
        Loading...
    {:else}
        <span class = "text-secondary">
            Sorted by date
        </span>
        <p class = "text-secondary">
            <span class = "text-success">
                <i class="fa-regular fa-eye"></i> = Preview Video
            </span>, 
            <span class = "text-primary">
                <i class="fa-regular fa-pen-to-square"></i> = Edit Name
            </span>, 
            <span class = "text-danger">
                <i class="fa-regular fa-trash-can"></i> = Delete
            </span>
         </p>
    {/if}
    <div class = "w-100 d-flex justify-content-center text-center mt-2">
        
        <table>    
            {#if show}
                <tr style = "background-color: #d3d3d3;">
                    <th>Interview (Click link to download)</th>
                    <th>Length</th>
                    <th>Date</th>
                    <th>Edit</th>
                </tr>
                {#each interviews as interview, i}
                    <tr>
                        <td style = "width: 40%;" >
                            <button on:click = {()=>{startDownload(interview.filename)}} target="_blank" class = "downloadItem flex-center btn text-primary fs-5 w-100">
                                <span class="material-symbols-outlined">
                                    download
                                </span> &nbsp;
                                <span id = "interviewName">{interview.name}</span>
                            </button>
                        </td>
                        <td class = "">{interview.len}</td>
                        <td class = "">{interview.time}&nbsp;  {interview.date}</td>
                        <td class = "">
                            {#await previewFile(interview.filename)}
                                Loading...
                            {:then link}
                            <a href = {link} target = "_blank" class = "my-1 mx-1">
                                <button class = "btn btn-outline-success edit-btn">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </a>
                            {/await }
                            
                            <button class = "btn btn-outline-primary edit-btn my-1 mx-1" on:click = {() =>{editFile(interview.filename, interview.raw_date)}}>
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class = "btn btn-outline-danger delete-btn my-1 mx-1" on:click = {() =>{deleteFile(interview.filename, interview.name)}}>
                                <i class="text-danger fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                {/each }
            {/if}
        </table>
    </div>
    <button id = "downloadBtn" class = "btn mt-3 hide"><a bind:this= {downloadLink}>download</a></button>
</section>
<style>
    table {
        width: 80%;
    }
    tr {
        z-index: 2;
        transition: 200ms;
    }
    th, td {
        border: 1px solid gray;
        padding: 10px;
    }
    .delete-btn:hover >i {
        color: white !important;
    }
    .downloadItem {
        text-decoration: none;
        transition: 200ms;
    }
    .downloadItem:hover {
        cursor: pointer;
    }
    .downloadItem:hover > #interviewName {
        text-decoration: underline;
    }
    
    tr:hover {
        background-color: rgb(241, 241, 241);
    }
</style>