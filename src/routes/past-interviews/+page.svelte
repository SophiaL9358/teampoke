<script>
	import Navbar from "../Navbar.svelte";
    import {user_sub, storage} from "$lib/global.js";
	import { deleteObject, getBlob, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
	import { writable } from "svelte/store";
	import jquery from "jquery";
    
    var downloadLink;
    var none = false;
    var interviews = []
    var show;
    const listRef = ref(storage, $user_sub+"/")

    function startDownload(fileName){
        getBlob(ref(storage, $user_sub+'/'+fileName)).then((blob)=> {
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = fileName;
            downloadLink.click();
        });
     
    }

    function getInterviews(){
        interviews=[]
        show = false;
        listAll(listRef).then((res) => {
            res.items.forEach((itemRef) => {
                var time = itemRef.name.split("|")[2]
                time = time.substring(0, time.length-4);
                interviews.push({name: itemRef.name.split("|")[0], 
                                date: itemRef.name.split("|")[1], 
                                time: time, filename: itemRef.name})
            });
            if (interviews.length ==0 ){
                none= true;
            } else {
                show = true;
            }
            
        })
    }
    
    function deleteFile(filename, name){
        if (confirm("Are you sure you want to delete \""+name+"\"?")){
            deleteObject(ref(storage, $user_sub+"/"+filename)).then(()=>{getInterviews();});
        }  
    }

    async function editFile(filename, date, time){
        var name = prompt("Please type the new interview name (enter nothing to cancel):");
        if(name!=""){
            console.log(time);
            var newName = name+"|"+date+"|"+time+".mp4"
            getBlob(ref(storage, $user_sub+'/'+filename)).then( async (blob)=> {
                await uploadBytes(ref(storage, $user_sub+'/'+newName), blob).then((e) => {
                    console.log("video uploaded!")
                    deleteObject(ref(storage, $user_sub+"/"+filename)).then(()=>{getInterviews();});
                });
                
            });
            
            console.log("UPLOADED")
        }
        

    }
    
    
    getInterviews();


    

</script>
<Navbar back = true />
<br>
<section class = "w-100 text-center pb-5 mt-5">
    <h2>Past Interviews</h2>
    {#if none}
        <b>You currently have no interviews stored. Click on the blue "Start Interview" button on the homepage to record one!</b>
    {:else if !show}
        Loading...
    {/if}
    <div class = "w-100 d-flex justify-content-center text-center pt-4">
        
        <table>    
            {#if show}
                <tr style = "background-color: #d3d3d3;">
                    <th>Interview (Click link to download)</th>
                    <th>Date</th>
                    <th>Edit</th>
                </tr>
                {#each interviews as interview, i}
                    <tr>
                        <td class = "name-cell"><a on:click = {()=>{startDownload(interview.filename)}} target="_blank">{interview.name}</a></td>
                        <td class = "date-cell">{interview.date}&nbsp;&nbsp;{interview.time}</td>
                        <td class = "delete-cell">
                            <button class = "btn btn-outline-primary edit-btn" on:click = {() =>{editFile(interview.filename, interview.date, interview.time)}}>
                                Edit Name &nbsp;<i class="fa-solid fa-pen-to-square"></i>
                            </button>&nbsp;
                            <button class = "btn btn-outline-danger delete-btn" on:click = {() =>{deleteFile(interview.filename, interview.name)}}>
                                Delete &nbsp;<i class="text-danger fa-solid fa-trash-can"></i>
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
    }
    th, td {
        border: 1px solid gray;
        padding: 10px;
    }
    .delete-btn:hover >i {
        color: white !important;
    }
    .name-cell {
        width: 50%;
    }
    a:hover {
        cursor: pointer;
    }

</style>