import { Telegraf, session } from "telegraf"
import { message } from "telegraf/filters"
import { code } from "telegraf/format"
import config from "config"
import { oggConverter } from "./ogg-converter.js"
import { openai } from "./openai.js"

console.log('ENV:', config.get('ENV'));

const SESSION_DATA = {
    messages: []
}


const bot = new Telegraf(config.get('TG_BOT_API_TOKEN'))

bot.use(session())

bot.command('start', async (ctx) => {
    ctx.session = SESSION_DATA
    await ctx.reply('Этот бот может принимать голосовые и текстовые сообщения. Ваш запрос будет отправлен в ChatGPT, после обработки вы получите ответ.')
})

bot.command('newchat', async (ctx) => {
    ctx.session = SESSION_DATA
    await ctx.reply('Начнем новый чат, отправьте голосовое или текстовое сообщение')
})

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= SESSION_DATA
    try {
        await ctx.reply(code('Сообщение принято.'))

        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userID = String(ctx.message.from.id)

        const oggFilePath = await oggConverter.getOggFile(link, userID)
        const mp3FilePath = await oggConverter.convertOggToMP3(oggFilePath, userID)

        const textFromVoice = await openai.transcription(mp3FilePath)

        await ctx.reply(code(`Думаю. Ожидайте ответа. Ваш запрос: ${textFromVoice}`))

        ctx.session.messages.push({
            role: openai.roles.USER,
            content: textFromVoice
        })

        const GPTAnswer = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: GPTAnswer.content
        })
        await ctx.reply(GPTAnswer.content)
    } catch (err) {
        console.log('Error in voice message:', err.message);
    }
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= SESSION_DATA
    try {
        await ctx.reply(code('Сообщение принято. Ожидайте ответа'))

        ctx.session.messages.push({
            role: openai.roles.USER,
            content: ctx.message.text
        })

        const GPTAnswer = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: GPTAnswer.content
        })
        await ctx.reply(GPTAnswer.content)
    } catch (err) {
        console.log('Error in text message:', err.message);
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))