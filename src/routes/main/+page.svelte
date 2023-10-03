<script>
	import jquery from 'jquery';
    jquery(function(){
        
        var video = jquery("#streamVid");

        if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
            video.srcObject = stream;
            })
            .catch(function (err0r) {
            console.log("Something went wrong!");
            });
        }
    });
    
</script>
<div class = "row w-100">
    <div class = "col-md-3 p-4 d-flex justify-content-center flex-column align-content-center" style = "height: 100vh;">
        <i>Job Name</i>
        <textarea placeholder = "ie. Computer Science" class = "w-100" rows = "5"></textarea>
        <br><br>
        <i>Key Points on Resume!</i>
        <textarea placeholder = "ie. NIST Internship" class = "w-100" rows = "5"></textarea>
    </div>
    <div class = "col-md-9 p-4 pt-5 d-flex flex-column align-items-center">
        <!--

            <form class = "w-100">
            <span class = "w-100"><input type = "text"  placeholder = "Enter your answer here!" /> 
                <button >Enter</button></span>
        </form>
        <br>
        -->
        
        <span id = 'mainQuestion' class ="text-center fs-4">
            Tell me about a time where you showed leadership and problem solving?
        </span>
        
        <br>
        <video id = "streamVid" autoplay = "true" >
            <track kind = "captions">
        </video>
        <br>
        <div class = "border border-3 w-75 text-center p-3">
            Lorem ipsum x 10000000000
        </div>
    </div> 
</div>

<style>
video {
    width: 500px;
    background-color: gray;
    border: 3px black solid;
}

.col-md-3 {
    border: 2px rgb(173, 230, 189) solid;
    background-color:rgb(231, 250, 235);
}

textarea {
    border-radius: 10px;
}
</style>