<!-- <script>
// @ts-nocheck
    import { setDoc, doc } from 'firebase/firestore';
    import jquery from 'jquery';
    import { onMount } from 'svelte';
    import { user_sub } from "$lib/global.js";

    /*
    * Create form to request access token from Google's OAuth 2.0 server.
    */
    var fragmentString;
    var params;
    var userResponse; // sub (unique id), name, given_name, email
    onMount(() => {
        fragmentString = location.hash.substring(1);
            params = {};
            var regex = /([^&=]+)=([^&]*)/g, m;
            while (m = regex.exec(fragmentString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        if (params.state) {
            trySampleRequest();
            //jquery("#changePage").trigger("click");
        }
        
        /*if (Object.keys(params).length > 0) {
            localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
            if (params['state'] && params['state'] == 'try_sample_request') {
                trySampleRequest();
            }
        }*/
        
    })


function oauth2SignIn() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var windowHref = (window.location.href).toString();
    console.log()
    var params = {'client_id': '1083819190018-jmgb2p9eucom10vu675d19nkbcc1e35o.apps.googleusercontent.com', // TODO: Change id...
                'redirect_uri': windowHref,
                'response_type': 'token',
                'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly',
                'include_granted_scopes': 'true',
                'state': 'pass-through value'};

    // Add form parameters as hidden input values.
    for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    console.log("done")
    form.submit();
    console.log("confused")
}

async function trySampleRequest() {
    // var params = JSON.parse(localStorage.getItem('oauth2-test-params')); // TODO: This saves it, so once you sign in, you only have to sign in once!
    console.log(params)
    if (params && params['access_token']) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET',
          'https://www.googleapis.com/oauth2/v3/userinfo?' +
          'access_token=' + params['access_token']);
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
          userResponse = JSON.parse(xhr.response); // sub (unique id), name, given_name, email
          // console.log(xhr.response);
          createUser(); // TODO: what if user already exists?
        } else if (xhr.readyState === 4 && xhr.status === 401) {
          // Token invalid, so prompt for user permission.
          oauth2SignIn();
          
        }
      };
      
      xhr.send(null);
    } else {
      oauth2SignIn();
    }
  }

    async function createUser() {
        user_sub.set(userResponse.sub);
        jquery("#changePage").trigger('click');
        //document.location.href = "/home";
    }


</script>

<svelte:head>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>
<button on:click = {trySampleRequest} class = "poke-btn bg-google-blue text-light mb-3">Google Login</button>
<a href = "/home"><button style = "display: none;" id = "changePage">Change Pages</button></a>

<style>
    /* For centering the google sign in button */
    .parent_container {  
        display: flex;
        width: 100%;
        justify-content: start;
    }
    .g_id_signin {
        padding-bottom: 2em;
    }
    
</style> -->