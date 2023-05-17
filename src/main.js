import { Telegraf, session, Scenes } from "telegraf"
import config from "config"
import chatScene from './scenes/chatScene.js'

console.log('ENV:', config.get('ENV'));

const SESSION_DATA = {
    messages: []
}


const { enter, leave } = Scenes.Stage

const bot = new Telegraf(config.get('TG_BOT_API_TOKEN'))

const stage = new Scenes.Stage([chatScene]);

bot.use(session())
bot.use(stage.middleware())
bot.use((ctx, next) => {
	ctx.scene.session.myData ??= SESSION_DATA
	return next()
})


bot.command('start', async (ctx) => {
    await ctx.reply('Этот бот может принимать голосовые и текстовые сообщения. Ваш запрос будет отправлен в ChatGPT, после обработки вы получите ответ.')
})

bot.command("newchat", async (ctx) => {
   await ctx.scene.enter("newchat")
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))