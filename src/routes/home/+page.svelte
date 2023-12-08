<script>
	import Navbar from "../Navbar.svelte";
      import { user_sub } from "$lib/global.js";

      console.log($user_sub);
</script>
<Navbar/>
<div class ="text-center w-100 my-5">
      <h2>Welcome!</h2>
</div>
<div class = 'w-100 flex-center' >
      
      <a href = "/practice"><button class = "poke-btn bg-contrast-light-blue fs-4" style = "height: 350px; width: 300px; "> Start Interview </button></a>
      <a href = "/past-interviews"><button class = "poke-btn bg-contrast-light-orange fs-4 mx-5" style = "height: 350px; width: 300px; "> Past Interviews </button></a>
      <a href = "/resume"><button class = "poke-btn bg-contrast-orange fs-4" style = "height: 350px; width: 300px; "> Update Resume </button></a>
</div>

<style>
</style>