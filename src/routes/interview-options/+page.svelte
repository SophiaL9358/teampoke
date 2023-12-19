<script>
	import Navbar from "../Navbar.svelte";

</script>

<style>
  button {
    padding: 50px 75px 50px 75px;
    margin: 0 30px; /* Adjust spacing between buttons as needed */
  }
  .custom-button:hover {
    transition: 200ms;
    background-color: white;
  }

  .header {
    font-size: 28px;
    text-align: center;
    margin-bottom: 1px;
  }
</style>
<Navbar back = true />
<div class="w-100 flex-center mt-5 ">
  <div class="container">
    <div class="header" style="height: 100px;"> Please chose an interview type:</div>

    <!-- Top button container -->
    <div class="flex-center mb-5">
      <a href = "/practice"><button class="poke-btn bg-contrast-light-blue fs-4">Random Questions</button></a>
      <button class="poke-btn bg-google-blue fs-4">AI, Self-Paced Questions</button>
    </div>

    <!-- Bottom button container -->
    <div class="flex-center">
      <a href = "/practice/job"><button class="poke-btn bg-contrast-light-orange fs-4">Job Specific Questions</button></a>
      <button class="poke-btn bg-contrast-orange fs-4">Resume Questions</button>
    </div>
  </div>
</div>
<br>
<br>