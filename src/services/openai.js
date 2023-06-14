import { Configuration, OpenAIApi } from "openai"
import config from "config"
import { createReadStream } from "fs"
import { removeFile } from "../utils.js"


class OpenAI {
    roles = {
        USER: 'user',
        SYSTEM: 'system',
        ASSISTANT: 'assistant'
    }

    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,
        })
        this.openai = new OpenAIApi(configuration);
    }

    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo-0613',
                messages,

            })

            return response.data.choices[0].message
        } catch (err) {
            console.log('Error in openai chat:', err.message);
        }
    }

    async transcription(mp3FilePath) {
        try {
            const response = await this.openai.createTranscription(
                createReadStream(mp3FilePath),
                'whisper-1'
            )
            await removeFile(mp3FilePath)
            return response.data.text
        } catch (err) {
            console.log('Error in openAI transcription:', err.message);
        }
    }

    async createImage(message) {
        try {
            const response = await this.openai.createImage({
                prompt: message,
                n: 1,
                size: "1024x1024",
            })

            const image_url = response.data.data[0].url
            return image_url
        } catch (err) {
            if (err.response) {
                console.log('Error in openAI generate image:', err.response.status);
                console.log('Error in openAI generate image:', err.response.data);
            } else {
                console.log('Error in openAI generate image:', err.message);
            }
        }
    }
}

export const openai = new OpenAI(config.get('OPEN_AI_TOKEN'))