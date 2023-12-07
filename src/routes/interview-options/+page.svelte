<script>
</script>

<style>
  .button-container-top {
    display: flex;
    justify-content: space-around;
    padding: 20px; /* Adjust padding as needed */
    margin-bottom: 20px; /* Adjust spacing between top and bottom button containers */
  }

  .button-container-bottom {
    display: flex;
    justify-content: center;
    padding: 10px; /* Adjust padding as needed */
  }

  .custom-button {
    height: 100px; /* Adjust height as needed */
    width: 250px;
    margin: 0 30px; /* Adjust spacing between buttons as needed */
  }

  .header {
    font-size: 28px;
    text-align: center;
    margin-bottom: 1px;
  }
</style>

<div class="w-100 flex-center" style="height: 120vh;">
  <div class="container">
    <div class="header" style="height: 100px;"> Please chose an interview type:</div>

    <!-- Top button container -->
    <div class="button-container-top">
      <button class="btn nc-light-blue custom-button">Start Interview</button>
      <button class="btn nc-light-orange custom-button">Past Interviews</button>
    </div>

    <!-- Bottom button container -->
    <div class="button-container-bottom">
      <button class="btn nc-dark-orange custom-button">Update Resume</button>
    </div>
  </div>
</div>
