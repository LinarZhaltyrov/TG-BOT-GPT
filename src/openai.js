import { Configuration, OpenAIApi } from "openai"
import config from "config"
import { createReadStream } from "fs"
import { removeFile } from "./utils.js"


class OpenAI {
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,
        })
        this.openai = new OpenAIApi(configuration);
    }

    roles = {
        USER: 'user',
        SYSTEM: 'system',
        ASSISTANT: 'assistant'
    }

    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages,

            })
            
            return response.data.choices[0].message
        } catch (err) {
            console.log('Error in openai chat:', err.message);
        }
    }

    async transcription(mp3FilePath) {
        try {
            const response =  await this.openai.createTranscription(
                createReadStream(mp3FilePath),
                'whisper-1'
            )
            await removeFile(mp3FilePath)
            return response.data.text
        } catch (err) {
            console.log('Error in openAI transcription:', err.message);
        }
    }
}

export const openai = new OpenAI(config.get('OPEN_AI_TOKEN'))