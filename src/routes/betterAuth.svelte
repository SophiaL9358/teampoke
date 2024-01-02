<script>
    import { onMount } from 'svelte';
    import {user_sub, user_name} from "$lib/global.js"

    function decodeJwtResponse(token) {
        let base64Url = token.split('.')[1]
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload)
    }

    onMount(() => {
        // Define the handleSignInWithGoogle function
        // @ts-ignore
        window.handleSignInWithGoogle = async function (response) {     
            const decodedRes = decodeJwtResponse(response.credential)
            user_sub.set(decodedRes.sub)
            user_name.set(decodedRes.given_name)
            document.getElementById("changePage").click()
        };

        // Load the Google Sign-In library
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = function () {
            // Initialize the Google Sign-In library
            window.google.accounts.id.initialize({
                client_id: '1083819190018-jmgb2p9eucom10vu675d19nkbcc1e35o.apps.googleusercontent.com',
                callback: window.handleSignInWithGoogle,
                context: 'signin_with',
                ux_mode: 'popup',
                nonce: '',
                auto_select: true,
                itp_support: true
            });
            window.google.accounts.id.renderButton(document.getElementById('g_id_onload'), {
                type: 'standard',
                theme: 'filled_blue',
                text: 'signin_with',
                size: 'large',
                logo_alignment: 'left',
                shape: 'pill'
            });
        };
        document.body.appendChild(script);
        console.log("what");
    });
</script>

<div id="g_id_onload" />
<a href = "/home"><button id = "changePage" class = "hide">Change Page</button></a>
<style>
    /* For centering the google sign in button */
    #g_id_onload {
        scale: 1.1;
        padding-bottom: 1em;
    }
    
</style>