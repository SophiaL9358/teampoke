<script>
	import Navbar from "../Navbar.svelte";
    import {user_sub, storage} from "$lib/global.js";
	import { listAll, ref } from "firebase/storage";
    
    

    var interviews = [
        {name: "Practice #4 - October 6th, 2023", date:"12/6/23"}
    ]
    var show = false;
    const listRef = ref(storage, $user_sub+"/")
    var test;
    console.log("start", user_sub)
    listAll(listRef)
    .then((res) => {
        test = res;
        res.items.forEach((itemRef) => {
            console.log(itemRef.name);
            interviews.push({name: itemRef.name, date: "placeholder"})
            

            console.log(interviews)
            
        // All the items under listRef.
        });
        interviews.push({name: "test", date:"dfs"})
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
    interviews.push({name: "test", date:"dfs"})
    show = true;
    console.log(test);

    console.log("end")
</script>
<Navbar back = true />
<br>
<section class = "w-100 text-center pb-5 mt-5">
    <h2>Past Interviews</h2>
    <div class = "w-100 d-flex justify-content-center pt-5">
        <table>
            <tr style = "background-color: #d3d3d3;">
                <th>Interview (Click link to download)</th>
                <th>Date</th>
                <th>Delete</th>
            </tr>
            {#if show}
                {#each interviews as interview, i}
                    <tr>
                        <td class = "name-cell"><a href = "https://youtube.com" target="_blank">{interview.name}</a></td>
                        <td class = "date-cell">{interview.date}</td>
                        <td class = "delete-cell">
                            <button class = "btn btn-outline-danger delete-btn">
                                Delete &nbsp;<i class="text-danger fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                {/each }
            {/if}
        </table>
    </div>
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

</style>