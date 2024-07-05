/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';
import { getVertexAI, getGenerativeModel, FunctionDeclarationSchemaType } from "firebase/vertexai-preview";

async function _main() {
  const app = initializeApp(firebaseConfig);

  // Initialize App Check
  // This line can be removed if you do not want to enable App Check for
  // your project. App Check is recommended to limit unauthorized usage.
  // initializeAppCheck(app, {
  //   provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
  // });

  // Get VertexAI instance
  const vertexAI = getVertexAI(app);
  // Get a Gemini model
  const model = getGenerativeModel(
    vertexAI,
    { model: "gemini-1.5-flash-preview-0514" }
  );


  // Call generateContent with a string or Content(s)
  const generateContentResult = await model.generateContent("what is a cat?");
  // const generateContentResult = await model.generateContent("how can import firebase vertexai using script tag?");
  console.log(generateContentResult.response.text());


  document.querySelector('#output').textContent = generateContentResult.response.text();
}

async function main() {
  const app = initializeApp(firebaseConfig);

  const functions = {
    findPostsByCategory({ category }: { category: any[] } ) {
      console.log('gotta search by category', { category });


      if (category.indexOf('java') > -1) {
        return {
          posts: []
        }
      }

      return {
        posts: [
          {
            title: 'some nodejs post',
            url: 'https://codesilva.github.io'
          },
          {
            title: 'some nodejs post',
            url: 'https://codesilva.github.io'
          },
          {
            title: 'some nodejs post',
            url: 'https://codesilva.github.io'
          }
        ]
      };
    }
  }
  const vertexAI = getVertexAI(app);
  // Get a Gemini model
  const model = getGenerativeModel(
    vertexAI,
    {
      model: "gemini-1.5-flash-preview-0514",
      tools: [
        {
          functionDeclarations: [
            {
              name: "findPostsByCategory",
              description: "Find posts by category",
              parameters: {
                type: FunctionDeclarationSchemaType.OBJECT,
                description: "Get the exchange rate for currencies between countries",
                properties: {
                  category: {
                    type: FunctionDeclarationSchemaType.ARRAY,
                    description: "The categories for searching blog post",
                  }
                },
                required: ['categories'],
              },
            }
          ],
        }
      ]
    }
  );

  const chat = model.startChat();
  // const prompt = 'I wanna find posts relate to NodeJS and Debugging';
  // const prompt = 'Quero encontrar post relacionados a NodeJS e Depuração';
  const prompt = window.prompt('pesquise');

  const result = await chat.sendMessage(prompt);

  const call = result.response.functionCalls()?.[0];

  if (call) {
    // Call the executable function named in the function call
    // with the arguments specified in the function call and
    // let it call the hypothetical API.
    const apiResponse = await functions[call.name](call.args);

    // Send the API response back to the model so it can generate
    // a text response that can be displayed to the user.
    const result = await chat.sendMessage([{
      functionResponse: {
        name: 'findPostsByCategory',
        response: apiResponse
      }
    }]);

    // Log the text response.
    console.log(result.response.text());
  }

}

main();
