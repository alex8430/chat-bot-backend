const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

const model = process.env.MODEL || "llama2";
const textToSpeechEndpoint = process.env.TEXT_TO_SPEECH_API;

const llmApiEndpoint = process.env.LLM_API_ENDPOINT;
const botDetailsData  = require("./botDetails");
const res = require('express/lib/response');
const userMappingWithBot = [];

app.use(express.json());
app.use(cors());

const askBot = async(prompt, model)=>{
    // Make a POST request to your local LLM API.
    const requestData = {
        model: model, // Make sure 'model' is defined or replace it with the actual model name.
        prompt:prompt,
    };
    const botResponse =  await axios.post(`${llmApiEndpoint}/generate`,{ ...requestData });
    var response = '';
    botResponse.data.split('\n').forEach((line) => {
        if (line.trim() !== '') {
            try {
                const chunk = JSON.parse(line);
                if (chunk.response) {
                response += chunk.response;
                }
            } catch (error) {
                console.error('Error parsing chunk:', error);
            }
        }
    });
    return response
}

app.post('/chat-with-llm', async (req, res) => {
  try {
    const { answer } = req.body;
    const response = await askBot(answer, model);
    let answerStatus = "accepted";
    // Send the LLM's response back to the client.
    res.json({ status: answerStatus, data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/sendMessageV2', async (req, res) => {
    try {
      const { botName, username, botData, botVoice } = req.body;
      console.log(botVoice);
      messageLen = botData.message_history.length;
      const response = await askBot(botData.message_history[messageLen-1].content[0].value, botName);
      var botAudio={};
      if(botVoice.allowToSpeak){
        botAudio = await getSpeechFromText(textToSpeechEndpoint,response,botVoice.lang,botVoice.source);
      }
      res.json({ new_message: [{value: response, data_type:'string', botAudio: botAudio}]});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });


app.post('/train-llm', async (req, res) => {
    try {
        const { pdfContent, question } = req.body;
        const query = question + "Here is the PDF content: " + pdfContent;
        const requestData = {
            model: model, // Make sure 'model' is defined or replace it with the actual model name.
            prompt: query,
        };
        let response=''; // Declare the response variable in a higher scope.
        axiosResponse = await axios.post(llmApiEndpoint, { ...requestData });

        axiosResponse.data.split('\n').forEach((line) => {
            try {
                const chunk = JSON.parse(line);
                if (chunk.response) {
                response += chunk.response;
                }
            } catch (error) {
                console.error('Error parsing chunk:', error);
            }
            });
  
      // Assuming success for demonstration purposes.
      const trainingStatus = 'Training completed successfully';
      // Send the training status back to the client along with the response data.
      res.json({ status: trainingStatus, data: response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred during training' });
    }
  });

app.get('/botDetailsV2', (req, res) => {
try {
    const { botName, username } = req.query;
    var botDetails = userMappingWithBot.find((bot) => bot.username === username);
    if (!botDetails) {
        var botDetail = botDetailsData.find((bot)=>bot.name===botName);
        if(!botName){
            botDetail = botDetailsData[0];
        }
        if(!botDetail) res.status(500).send(`${botName} this bot Does not exist`);
        else{
            botDetail['username']=username;
            botDetails = botDetail;
            userMappingWithBot.push(botDetail);
        }
    }

    // Return the bot details to the client.
    res.json(botDetails);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
}
});

app.get('/botList', async (req, res) => {
    try {
        const botResponse =  await axios.get(`${llmApiEndpoint}/tags`);
        var botList = [];
        botResponse.data.models.map((ele)=>{
            const temp = {...ele}
            temp['id'] = ele.name+ele.modified_at;
            botList.push(temp);
        })
        res.json({data:botList});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
    });

const getSpeechFromText = async(url,msg,lang,source)=>{
        const data = new URLSearchParams();
        data.append('msg', msg);
        data.append('lang', lang);
        data.append('source', source);
        const response =  await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
}

  
app.listen(PORT, () => {
    console.log("LLM running on: "+ llmApiEndpoint);
  console.log(`Server is running on port ${PORT}`);
});
