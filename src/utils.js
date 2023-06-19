import { unlink } from "fs/promises"
import { exec, execSync } from "child_process"
import config from "config"

export async function removeFile(path) {
    try {
        await unlink(path)
    } catch (err) {
        console.log('Error in remove file:', err.message);
    }
}

export async function restartCommand() {
    try {
        execSync(`echo ${config.get('SUDO_PASS')} | "sudo su"`)
        const result = execSync("pm2 restart GPT-BOT").toString()
        return result
    } catch (err) {
        console.log('Error in restart command shell', err.message);
    }
}