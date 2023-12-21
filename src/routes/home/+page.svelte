<script>
	import Navbar from "../Navbar.svelte";
      import { user_sub } from "$lib/global.js";

      console.log($user_sub);
</script>
<Navbar/>
<div class ="text-center w-100 my-5">
</div>
<!-- <div class = 'w-100 flex-center' >
      
      <a href = "/practice"><button class = "poke-btn fs-4 test3 text-light" style = "background-color:#034078;"> 
            Start Interview
            <br><br>
            <i class="fa-solid fa-circle-user" style="font-size:5em;"></i>
      </button></a>
      <a href = "/past-interviews"><button class = "poke-btn bg-contrast-light-orange fs-4 mx-5 test3" style = "background-color:#80ED99;"> Past Interviews </button></a>
      <a href = "/resume"><button class = "poke-btn bg-contrast-orange fs-4 test3 text-light" style = "background-color:#2B7F80;"> Update Resume </button></a>
</div>
<br><br> -->
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
                  <a href = ""><button class = "poke-btn text-dark w-100 mt-3" style="background-color:#80ED99;">
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
<!-- <div class = 'w-100 flex-center flex-column' >
      
      <a href = "/interview-options"><button class = "poke-btn fs-4 text-light test2" style="background-color:#001F54;"> 
            Start Interview 
      </button></a>
      <a href = "/past-interviews"><button class = "poke-btn bg-contrast-light-orange fs-4 my-3 text-light test2"  style = "background-color:#034078"> Past Interviews </button></a>
      <a href = "/resume"><button class = "poke-btn bg-contrast-orange fs-4 test2" style = "background-color: #91C4F2;"> Update Resume </button></a>
</div> -->

<style>
      .test1 {
            height: 300px;
            padding: 20px 0;
      }
      .test2 {
            width: 60vw;
            padding: 20px 0;
      }
      .test3{
            height: 350px;
            width: 300px;
      }
</style>