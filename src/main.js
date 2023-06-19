import { Telegraf, session, Scenes } from "telegraf"
import config from "config"
import chatScene from './scenes/chatScene.js'
import imageScene from './scenes/imageScene.js'
import { restartCommand } from './utils.js'

console.log('ENV:', config.get('ENV'));

const SESSION_DATA = {
    messages: []
}


const { enter, leave } = Scenes.Stage

const bot = new Telegraf(config.get('TG_BOT_API_TOKEN'))

const stage = new Scenes.Stage([chatScene, imageScene]);

bot.use(session())
bot.use(stage.middleware())
bot.use((ctx, next) => {
    ctx.scene.session.myData ??= SESSION_DATA
    return next()
})


bot.command('start', async (ctx) => {
    await ctx.reply(`Этот бот может принимать голосовые и текстовые сообщения. 
    Ваш запрос будет отправлен в ChatGPT, после обработки вы получите ответ. 
    Вы можете общаться с ботом, а так же создавать изображения по описанию.`)
})

bot.command('help', async (ctx) => {
    await ctx.reply(`У днного бота есть несколько режмов работы; 
    \n 1) GPTChat - для входа в этот режим используй комманду /newchat 
    \n 2) Создание изображений по описанию - для входя в этот режим используй комману /createimage 
    \n\n для выхода из режима используй комманду /exit`)
})

bot.command("newchat", async (ctx) => {
    await ctx.scene.enter("newchat")
})

bot.command("createimage", async (ctx) => {
    await ctx.scene.enter("createimage")
})

bot.command("restart", async (ctx) => {
    const commandResult = await restartCommand()

    if (!commandResult) {
        return await ctx.reply(`Произошла ошибка при выполнении команды`)
    }

    await ctx.reply(`Перезапускаю бота`)
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))