import { unlink } from "fs/promises"

export async function removeFile(path) {
    try {
        await unlink(path)
    } catch (err) {
        console.log('Error in remove file:', err.message);
    }
}