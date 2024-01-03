<script>
	import Navbar from "../Navbar.svelte";
      import { user_sub, user_name } from "$lib/global.js";
	import { onMount } from "svelte";

      console.log($user_sub);
      var guest = false
      onMount(() => {
            if ($user_sub == "") {
                  guest = true

            }
      })
</script>
<Navbar/>
<br>
<div class = "container-fluid px-5 pt-2 pb-4 text-center">
      <h4>Welcome
      {#if guest} 
            Guest!
      {:else}
            {$user_name}!
      {/if}
      </h4>
</div>
<div class = 'w-100 px-5' >
      <div class = "w-100 border-top border-bottom border-2 row py-4">
            <div class = "col-sm-6">
            
                  <h3>Start an Interview</h3>
                  Click one of the colored buttons to select an interview. 
            </div>
            <div class = "col-sm-6">
                  <a href = "/practice"><button class = "poke-btn text-light w-100 bg-random-questions" > 
                        Random Questions 
                        <i class="fa-solid fa-question"></i>
                  </button></a> 
                  <a href = "/practice/job"><button class = "poke-btn text-light w-100 mt-3 bg-job-questions" > 
                        Job-Specific Questions 
                        <i class="fa-solid fa-user"></i>
                  </button></a> 
                  {#if !guest}
                        <a href = "/practice/resume"><button class = "poke-btn text-dark w-100 mt-3 bg-resume-questions">
                              Resume-Specific Questions 
                              <i class="fa-regular fa-file"></i>
                        </button></a> 
                  {/if}
            </div>
      </div>
      {#if !guest}
            <div class = "w-100 border-top border-bottom border-2 row py-4">
                  <div class = "col-sm-6">
                  
                        <h3>Edit/Check your Profile</h3>
                        Click one of the colored buttons to select an interview. 
                  </div>
                  <div class = "col-sm-6">
                        <a href = "/past-interviews"><button class = "poke-btn text-light w-100" style="background-color:#F9564F;"> 
                              See Past Interviews 
                        </button></a> 
                        <a href = "/resume"><button class = "poke-btn text-dark w-100 mt-3 bg-resume"> 
                              Upload Resume
                        </button></a> 
                  </div>
            </div>
      {/if}
      
</div>
<br>
<br>

<style>
</style>