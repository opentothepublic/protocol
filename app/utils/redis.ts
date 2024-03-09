import Redis from "ioredis"
import { FrameCache } from "./interface";

const redisClient = new Redis(`redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_ENDPOINT}:${process.env.REDIS_PORT}`);

const inCache = async (fromFid: string): Promise<boolean> => {
    let exists = await redisClient.exists(fromFid)
    return exists ? true : false
}

const delCache = async (fromFid: string): Promise<boolean> => {
    await redisClient.del(fromFid)
    let exists = await inCache(fromFid)
    return !exists ? true : false
}

const createCacheObj = async (fromFid: string) => {
    const cacheObj = {
      toFids: new Array<string>,
      attestTxn: '',
    }
    await redisClient.set(fromFid, cacheObj.toString())
}

const setData = async (fromFid: string, toFids: string, attestTxn: string) => {
    let cacheObj = {
        toFids: toFids,
        attestTxn: attestTxn
    }
    await redisClient.set(fromFid, JSON.stringify(cacheObj))
}

const getData = async (fromFid: string): Promise<string> => {
    return (await redisClient.get(fromFid))!
}

export {redisClient, inCache, delCache, createCacheObj, setData, getData}