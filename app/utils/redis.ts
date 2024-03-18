import Redis from "ioredis"
import { FrameCache } from "./interface";

const redisClient = new Redis(`redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_ENDPOINT}:${process.env.REDIS_PORT}`);

const inCache = async (fromFid: number): Promise<boolean> => {
    let exists = await redisClient.exists(fromFid as unknown as string);
    return exists ? true : false
}

const delCache = async (fromFid: number): Promise<boolean> => {
    await redisClient.del(fromFid as unknown as string);
    let exists = await inCache(fromFid)
    return !exists ? true : false
}

const createCacheObj = async (fromFid: number) => {
    const cacheObj = {
      toFids: new Array<string>,
      attestTxn: '',
    }
    await redisClient.set(fromFid  as unknown as string, cacheObj.toString())
}

const setData = async (fromFid: number, toFids: string, attestTxn: string) => {
    let cacheObj: FrameCache = {
        toFids: toFids,
        attestTxn: attestTxn
    }
    await redisClient.set(fromFid  as unknown as string, JSON.stringify(cacheObj))
}

const getData = async (fromFid: number): Promise<string> => {
    return (await redisClient.get(fromFid as unknown as string))!
}

export { inCache, delCache, createCacheObj, setData, getData}