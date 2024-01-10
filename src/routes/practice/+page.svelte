<script>
	import { onMount } from 'svelte';
	import Navbar from '../Navbar.svelte';
	import Video from './video.svelte';

    // 16 questions
    var questions = `Tell me about yourself.
What attracted you to our company?
What jobs have you had in the past?
Have you ever had a volunteer job?
Do you have any specific trainings that would help you if you got the job you are applying for.
Tell me about your strengths.
What are your weaknesses?
Why are you leaving your current job?
Describe your ideal supervisor.
Describe your ideal work environment.
Do you like to work as part of a team or more by yourself?
How do you manage stress at work?
Why should we hire you?
What days of the weeks can you work?
What time are you available to work/what shifts are you interested in?
Do you have any questions for me?`;

    const getRandomQuestion = async (questionStore, numQuestions) => {
        var questionsCopy = questions;
        var split = questionsCopy.split("\n");

        var res = []
        while (res.length < numQuestions) {
            var randomIndex =Math.trunc(Math.random()*(split.length));
            var singleItem = split.slice(randomIndex, randomIndex+1)

            res.push(singleItem[0])
            split = split.slice(0, randomIndex).concat(split.slice(randomIndex+1, split.length))
        }        
        questionStore.set(res)
    }

</script>
<Video getQuestion={getRandomQuestion} title="Random Question"></Video>