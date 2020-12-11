const env: NodeJS.ProcessEnv = {
    ENVIRONMENT_NAME: process.env.ENVIRONMENT_NAME,
    PORT_HTTP: process.env.PORT_HTTP,
    PORT_HTTPS: process.env.PORT_HTTPS,
    HOST: process.env.HOST,
    HASHING_SECRET: process.env.HASHING_SECRET,
    MAX_CHEKS_PER_USER: process.env.MAX_CHEKS_PER_USER,

    TWILIO_FROM_PHONE: process.env.TWILIO_FROM_PHONE,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
}

export default env