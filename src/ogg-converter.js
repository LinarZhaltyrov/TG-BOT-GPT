import axios from "axios"
import { createWriteStream } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import ffmpeg from "fluent-ffmpeg"
import installer from "@ffmpeg-installer/ffmpeg"
import { removeFile } from "./utils.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }

    async getOggFile(url, fileName) {
        try {
            const oggFilePath = resolve(__dirname, '../voices', `${fileName}.ogg`)
            const file = await axios({
                method: 'get',
                url,
                responseType: 'stream',
            })

            const result = new Promise((resolve) => {
                const stream = createWriteStream(oggFilePath)
                file.data.pipe(stream)
                stream.on('finish', () => {
                    return resolve(oggFilePath)
                })
            })

            return result
        } catch (err) {
            console.log('Error in get OGG file from TG', err.massege);
        }
    }

    async convertOggToMP3(inputFilePath, outputFileName) {
        try {
            const outputFilePath = resolve(__dirname, '../voices', `${outputFileName}.mp3`)
            const result = new Promise((resolve, reject) => {
                ffmpeg(inputFilePath)
                .inputOption('-t 30')
                .output(outputFilePath)
                .on('end', () => {
                    removeFile(inputFilePath)
                    resolve(outputFilePath)
                })
                .on('error', (err) => reject(err.massege))
                .run()
            })

            return result
        } catch (err) {
            console.log('Error in convert ogg to mp3', err.massege);
        }
    }
}

export const oggConverter = new OggConverter()