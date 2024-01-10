import { Configuration, OpenAIApi } from "openai";
import { json } from "@sveltejs/kit";
import {OPENAI_API_KEY} from "$env/static/private"


const configuration = new Configuration({
  apiKey: OPENAI_API_KEY, // TODO: change to env variable
});
const modelName = "gpt-3.5-turbo-instruct"
const temperature = 0.6;

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
            model: modelName,
            prompt: generateFirstQuestion(),
            temperature: temperature,
            max_tokens: 1024
        });
    } else if (input.startsWith("POSITION QUESTION")) {
        var splitInput = input.split("|");
        completion = await openai.createCompletion({
            model: modelName,
            prompt: generatePositionQuestion(splitInput[1], splitInput[2]),
            temperature: temperature,
            max_tokens: 1024
        });
    }else if (input.startsWith("RESUME QUESTION")){
      var splitInput = input.split("|");
      completion = await openai.createCompletion({
          model: modelName,
          prompt: generateResumeQuestion(splitInput[1]),
          temperature: temperature,
          max_tokens: 1024
      });
    }else if (input.startsWith("FOLLOWUP QUESTION")) {
      completion = await openai.createCompletion({
        model: modelName,
        prompt: generatePrompt(input),
        temperature: temperature,
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

function generatePositionQuestion(position, numQuestions) {
  return `You are interviewing a person.
  Provide a string of ${numQuestions} clear, short, and professional interview questions based technical aspects of the job delimited by triple quotations.
  
  Use the following steps to create each question:
  1. Randomly choose one of these words: "How", "What" "Provide", "Tell", "Name", "Why", or "Do".
  2. Create a question starting with that word. Maximum of 15 words.

  Do not repeat questions. Return the string with the questions separated only by a |.

  Example of a result with 3 questions for the job "Doctor": "What motivated you to become a doctor?|How do you stay updated on medical advancements?"
  
  """${position}"""`;
  }

  function generateResumeQuestion(resumeSnip) {
    return `You are interviewing a person.
    Generate a simple and clear interview question based an applicant's resume delimited by triple quotations.
    
    Example:
    Resume: h Netlify. Engineering a remote controlled Lego rover with an onboard Raspberry Pi, programming inpython, using a motor hat, photoresistor sensor, and temperature sensor.
    Question: Please elaborate more on the sensors used in your lego rover project

    Use the following steps to create the question:
    1. Randomly choose one of these words: "How", "What" "Provide", "Tell", "Name", "Why", or "Do".
    2. Create a question starting with that word. Maximum of 15 words.
    
    Resume: """${resumeSnip}"""
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
