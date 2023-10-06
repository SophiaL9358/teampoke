import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const animal = req.body.animal || '';
  if (animal.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid input",
      }
    });
    return;
  }
  try {
    let completion;
    if (animal == "FIRST QUESTION") {
      completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: generateFirstQuestion(),
        temperature: 0.6,
        max_tokens: 1024
      });
    } else {
      completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: generatePrompt(animal),
        temperature: 1,
        max_tokens: 1024
      });
    }
    
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
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
  Example: Walk me through your resume.
  Example: How did you hear about this position?
  Example: `;
}


function generatePrompt(animal) {
  console.log(animal);
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
    console.log(animal);

  return `Suggest interview questions based on an answer a person has given.
  
  Answer: Communications has always been a passion for me because I love to interact with others and help them when they have trouble with a product so they can get the best experience possible.
Question: Awesome! Please elaborate further on how you help others when they have a question.
Answer: Biology is a passion for me because it's so mysterious and I want to demystify it.
Question: Great! Please explain what kind of experience you have in biology.
Answer: I love computer science because it gives me a creative outlet to problem-solve and bring real world impact.
Question: That's great! Can you tell me about a specific project that shows problem solving?
Answer: ${animal}
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
