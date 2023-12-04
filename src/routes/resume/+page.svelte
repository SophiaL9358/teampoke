<script>
    /** @type {import('./$types').LayoutData} */
    export let data;
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
   


    let files;
    let filename;


    const firebaseConfig = {
        apiKey: "AIzaSyDIMSd2qMl2vltWtTDgNjRFlgTWl73jMXw",
        authDomain: "mock-interview-app-403217.firebaseapp.com",
        projectId: "mock-interview-app-403217",
        storageBucket: "mock-interview-app-403217.appspot.com",
        messagingSenderId: "1083819190018",
        appId: "1:1083819190018:web:046cef3647a6736bd0841b",
        measurementId: "G-K0RYJF8CBX"
    };


    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
   
    const onChange = () => {
        if (files && files[0]) {
            filename = files[0].name;
            console.log(filename);
        } else {
            console.log("Didn't work");
        }
    }


</script>





<style>


</style>


<body class="">
   
    <section class = "w-100 flex-center flex-column text-center" style = "height: 100vh;">


        <!-- https://gist.github.com/dahnielson/59566b3d91cc8cf09c13d1419604a8a2 -->
        <div class = "flex-center text-center w-100">
            <button class = "poke-btn bg-light-green">
                <label for="files" class="upload-btn ">
                    Upload Resume
                </label>
            </button>
           
            <input id="files" style="visibility:hidden; display: none;" type="file" bind:files accept="application/pdf,application/msword,
            application/vnd.openxmlformats-officedocument.wordprocessingml.document">
          </div>
            {#if files && files[0]}
                <p>
                    {files[0].name}
                </p>
            {/if}
    </section>


</body>