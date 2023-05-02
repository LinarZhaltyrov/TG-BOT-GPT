export default {
    apps: [
        {
            name: "GPT-BOT",
            script: "./src/main.js",

            // Env Specific Config
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};