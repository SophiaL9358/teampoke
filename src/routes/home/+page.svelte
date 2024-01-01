<script>
	import Navbar from "../Navbar.svelte";
      import { user_sub, user_name } from "$lib/global.js";
	import { onMount } from "svelte";

      console.log($user_sub);
      onMount(() => {
            if ($user_sub == "") {
                  alert("This home page has options that requires you to be signed in! Redirecting to login page...")
                  document.location.href = "/"
            }
      })
</script>
<Navbar/>
<br>
<div class = "container-fluid px-5 pt-2 pb-4 text-center">
      <h4>Welcome {$user_name}!</h4>
</div>
<div class = 'w-100 px-5' >
      <div class = "w-100 border-top border-bottom border-2 row py-4">
            <div class = "col-sm-6">
            
                  <h3>Start an Interview</h3>
                  Click one of the colored buttons to select an interview. 
            </div>
            <div class = "col-sm-6">
                  <a href = "/practice"><button class = "poke-btn text-light w-100" style="background-color:#034078;"> 
                        Random Questions 
                        <i class="fa-solid fa-question"></i>
                  </button></a> 
                  <a href = "/practice/job"><button class = "poke-btn text-light w-100 mt-3" style="background-color:#2B7F80;"> 
                        Job-Specific Questions 
                        <i class="fa-solid fa-user"></i>
                  </button></a> 
                  <a href = "/practice/resume"><button class = "poke-btn text-dark w-100 mt-3" style="background-color:#80ED99;">
                        Resume-Specific Questions 
                        <i class="fa-regular fa-file"></i>
                  </button></a> 
            </div>
      </div>
      <div class = "w-100 border-top border-bottom border-2 row py-4">
            <div class = "col-sm-6">
            
                  <h3>Edit/Check your Profile</h3>
                  Click one of the colored buttons to select an interview. 
            </div>
            <div class = "col-sm-6">
                  <a href = "/past-interviews"><button class = "poke-btn text-light w-100" style="background-color:#F9564F;"> 
                        See Past Interviews 
                  </button></a> 
                  <a href = "/resume"><button class = "poke-btn text-dark w-100 mt-3" style="background-color:#F3C677;"> 
                        Upload Resume
                  </button></a> 
            </div>
      </div>
      
</div>
<br>
<br>

<style>
</style>