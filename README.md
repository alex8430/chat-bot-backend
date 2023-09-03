# Textbase Bot Backend Server

This repository contains the backend server code for the Textbase Bot project. The backend server interacts with the language model, handles user requests, and provides responses to the UI frontend.

## Setup Instructions

### Prerequisites
- Node.js installed on your local machine.
- Dependencies listed in `package.json` installed.
- open-source llm-model or any other you can use OpenAI (but in this project i used this mode to setup)
- [if using ollama take reference from here]  (https://ollama.ai/)
- [ollama github repository] (https://github.com/jmorganca/ollama)

### Installation

1. Clone this repository to your local machine:
   ```shell
   git clone git@github.com:alex8430/chat-bot-backend.git

2. Install project dependencies:
    ```
    npm install
### Running Locally
1. The server will run on port 3000 by default. You can access it at http://localhost:3000.

2. To connect the backend to the Textbase UI, set the appropriate environment variables, including MODEL, TEXT_TO_SPEECH_API, LLM_API_ENDPOINT, and others.

### API Endpoints
1. /sendMessageV2 (POST)
- Sends messages to the chatbot.
- Generates responses based on user queries.
2. /train-llm (POST)
- Initiates training of the language model with custom data.
- Provides a status and response upon completion.
3. /botDetailsV2 (GET)
- Retrieves details about the chatbot.
- Supports querying bot information based on username.
4. /botList (GET)
- Retrieves a list of available chatbot models.
- Converts the list for use in the UI.
