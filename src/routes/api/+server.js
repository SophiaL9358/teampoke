import { Configuration, OpenAIApi } from "openai";
import { json } from "@sveltejs/kit";
import {OPENAI_API_KEY} from "$env/static/private"


const configuration = new Configuration({
  apiKey: OPENAI_API_KEY, // TODO: change to env variable
});
const openai = new OpenAIApi(configuration);

export async function POST ({ request }) { // submit vote (i know this isnt right)
    const { req } = await request.json();

  if (!configuration.apiKey) {
    return json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }
  

  const input = req || '';
  
  if (input.trim().length === 0) {
    return json({
      error: {
        message: "Please enter a valid input",
      }
    });
    return;
  }
  try {
    let completion;
    console.log(input)
    if (input == "FIRST QUESTION") {
        console.log("hwat?")
        completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generateFirstQuestion(),
            temperature: 0.6,
            max_tokens: 1024
        });
      console.log("hwat?")
    } else if (input.startsWith("POSITION QUESTION")) {
        var splitInput = input.split(",");
        completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generatePositionQuestion(splitInput[1]),
            temperature: 0.6,
            max_tokens: 1024
        });
    }else {
      completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: generatePrompt(input),
        temperature: 1,
        max_tokens: 1024
      });
    }
    
    return json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      return json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generateFirstQuestion() {
  return `Generate a beginning interview question
  
  Example: Tell me about yourself.
  Example: Why do you want this position?
  Example: How did you hear about this position?
  Example: `;
}

function generatePositionQuestion(position) {
    return `Generate a specialized interview question based on the position the applicant is applying to.
    
    Job: Marine Biology
    Question: In your opinion, what's one of the most effective strategies for preserving endangered marine species?
    Job: Civil Engineer
    Question: What made you decide to become a civil engineer?
    Job: ${position}
    Question: `;
  }

function generatePrompt(input) {
  console.log(input);
  const capitalizedAnimal =
  input[0].toUpperCase() + input.slice(1).toLowerCase();
    console.log(input);

  return `Suggest interview questions based on an answer a person has given.
  
  Answer: Communications has always been a passion for me because I love to interact with others and help them when they have trouble with a product so they can get the best experience possible.
Question: Awesome! Please elaborate further on how you help others when they have a question.
Answer: Biology is a passion for me because it's so mysterious and I want to demystify it.
Question: Great! Please explain what kind of experience you have in biology.
Answer: I love computer science because it gives me a creative outlet to problem-solve and bring real world impact.
Question: That's great! Can you tell me about a specific project that shows problem solving?
Answer: ${input}
Question:`;
}

/*

MY RESPONSE::



*/

/*

Type: General
Question: Tell me about a time where you showed leadership.
Type: Computer science
Question: What is inheritance?
Type: Communications
Question: How would you successfully manage multiple clients at once?
Type: ${capitalizedAnimal}
Question:`;

*/
