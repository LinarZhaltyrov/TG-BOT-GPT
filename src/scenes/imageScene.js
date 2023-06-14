import { Scenes } from "telegraf"
import { message } from "telegraf/filters"
import { code } from "telegraf/format"
import { oggConverter } from "../services/ogg-converter.js"
import { openai } from "../services/openai.js"

const { enter, leave } = Scenes.Stage

const createImageScene = new Scenes.BaseScene("createimage")

createImageScene.enter(ctx => ctx.reply("Привет, отправь голосовое сообщение, либо напиши что должно быть на изображении."))
createImageScene.leave(ctx => ctx.reply("Пока Пока"))

createImageScene.command('exit', leave())

createImageScene.on(message('voice'), async (ctx) => {
    try {
        await ctx.reply(code('Голосовое сообщение принято.'))

        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userID = String(ctx.message.from.id)

        const oggFilePath = await oggConverter.getOggFile(link, userID)
        const mp3FilePath = await oggConverter.convertOggToMP3(oggFilePath, userID)

        const textFromVoice = await openai.transcription(mp3FilePath)

        await ctx.reply(code(`Творю искусство. Немного подождите. Ваш запрос: ${textFromVoice}`))

        // ctx.scene.session.myData.messages.push({
        //     role: openai.roles.USER,
        //     content: textFromVoice
        // })

        // const GPTAnswer = await openai.chat(ctx.scene.session.myData.messages)

        // ctx.scene.session.myData.messages.push({
        //     role: openai.roles.ASSISTANT,
        //     content: GPTAnswer.content
        // })
        // await ctx.reply(GPTAnswer.content)

        const imageCreatorResp = await openai.createImage(textFromVoice)

        await ctx.reply(imageCreatorResp)

    } catch (err) {
        console.log('Error in voice message image generator:', err.message);
    }
})

createImageScene.on(message('text'), async (ctx) => {
    try {
        await ctx.reply(code('Сообщение принято. Начинаю творить'))

        // ctx.scene.session.myData.messages.push({
        //     role: openai.roles.USER,
        //     content: ctx.message.text
        // })
        // console.log(ctx.scene.session.myData.messages[0].content);
        // const imageCreatorResp = await openai.createImage(ctx.scene.session.myData.messages[0].content)

        console.log(ctx.message.text);
        const imageCreatorResp = await openai.createImage(ctx.message.text)

        await ctx.reply(imageCreatorResp)
    } catch (err) {
        console.log('Error in text message image generator:', err.message);
    }
})


export default createImageScene