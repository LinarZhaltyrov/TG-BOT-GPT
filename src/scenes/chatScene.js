import { Scenes } from "telegraf"
import { message } from "telegraf/filters"
import { code } from "telegraf/format"
import { oggConverter } from "../services/ogg-converter.js"
import { openai } from "../services/openai.js"

const { enter, leave } = Scenes.Stage

const chatGPTScene = new Scenes.BaseScene("newchat")

chatGPTScene.enter(ctx => ctx.reply("Привет, отправь голосовое сообщение, либо напиши боту свой вопрос"))
chatGPTScene.leave(ctx => ctx.reply("Вы покинули режим ChatGPT. Пока Пока"))

chatGPTScene.command('exit', leave())

chatGPTScene.on(message('voice'), async (ctx) => {
    try {
        await ctx.reply(code('Голосовое сообщение принято.'))

        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userID = String(ctx.message.from.id)

        const oggFilePath = await oggConverter.getOggFile(link, userID)
        const mp3FilePath = await oggConverter.convertOggToMP3(oggFilePath, userID)

        const textFromVoice = await openai.transcription(mp3FilePath)

        await ctx.reply(code(`Думаю. Ожидайте ответа. Ваш запрос: ${textFromVoice}`))

        ctx.scene.session.myData.messages.push({
            role: openai.roles.USER,
            content: textFromVoice
        })

        const GPTAnswer = await openai.chat(ctx.scene.session.myData.messages)
        console.log(`Ответ от бота на голосовой запрос получен: ${!!GPTAnswer.content}`);
        ctx.scene.session.myData.messages.push({
            role: openai.roles.ASSISTANT,
            content: GPTAnswer.content
        })
        await ctx.reply(GPTAnswer.content)
    } catch (err) {
        await ctx.reply(code(`Упс! Произошла ошибка.`))
        console.log('Error in voice message:', err.message);
    }
})

chatGPTScene.on(message('text'), async (ctx) => {
    try {
        await ctx.reply(code('Сообщение принято. Ожидайте ответа'))

        ctx.scene.session.myData.messages.push({
            role: openai.roles.USER,
            content: ctx.message.text
        })

        const GPTAnswer = await openai.chat(ctx.scene.session.myData.messages)
        console.log(`Ответ от бота на текстовый запрос получен: ${!!GPTAnswer.content}`);
        ctx.scene.session.myData.messages.push({
            role: openai.roles.ASSISTANT,
            content: GPTAnswer.content
        })

        await ctx.reply(GPTAnswer.content)
    } catch (err) {
        await ctx.reply(code(`Упс! Произошла ошибка.`))
        console.log('Error in text message:', err.message);
    }
})


export default chatGPTScene