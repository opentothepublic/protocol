import Redis from "ioredis"

const redisClient = new Redis(`redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_ENDPOINT}:${process.env.REDIS_PORT}`);

export {redisClient}