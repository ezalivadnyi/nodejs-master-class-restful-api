import dotenv from 'dotenv';
dotenv.config();

const env = {
    ENVIRONMENT_NAME: process.env.ENVIRONMENT_NAME,
    PORT_HTTP: process.env.PORT_HTTP,
    PORT_HTTPS: process.env.PORT_HTTPS,
    HOST: process.env.HOST,
    HASHING_SECRET: process.env.HASHING_SECRET,
    MAX_CHEKS_PER_USER: process.env.MAX_CHEKS_PER_USER,
    WORKERKS_LOOP_INTERVAL_MILISECONDS: process.env.WORKERKS_LOOP_INTERVAL_MILISECONDS ? +process.env.WORKERKS_LOOP_INTERVAL_MILISECONDS : 10000,

    TWILIO: {
        FROM_PHONE: process.env.TWILIO_FROM_PHONE,
        ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    }
}

export default env