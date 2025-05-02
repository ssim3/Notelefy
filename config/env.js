import { config } from "dotenv";

config({path : `.env.${process.env.NODE_ENV || 'production'}.local`});

export const { PORT, BOT_TOKEN, NODE_ENV, DB_URI, JWT_SECRET, JWT_EXPIRES_IN, ARCJET_ENV, ARCJET_KEY, QSTASH_TOKEN, QSTASH_URL, SERVER_URL } = process.env;