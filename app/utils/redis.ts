import Redis from "ioredis"
import { FrameCache, VerifyFrameCache } from "./interface";

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
      project: '',
      message: '' 
    }
    await redisClient.set(fromFid  as unknown as string, cacheObj.toString())
}

const setData = async (fromFid: number, toFids: string, attestTxn: string, project: string, message: string) => {
    let cacheObj: FrameCache = {
        toFids: toFids,
        attestTxn: attestTxn,
        project: project,
        message: message
    }
    await redisClient.set(fromFid  as unknown as string, JSON.stringify(cacheObj))
}

const getData = async (fromFid: number): Promise<string> => {
    return (await redisClient.get(fromFid as unknown as string))!
}

const setVData = async (fromFname: string, toFnames: string, vid: string, vData: string) => {
    const vDataJSON = JSON.parse(vData)
    let cacheObj: VerifyFrameCache = {
        fromFname: fromFname,
        origAtId: vDataJSON.attestTxn,
        project: vDataJSON.project,
        text: vDataJSON.message,
        toFids: vDataJSON.toFids,
        toFnames: toFnames
      }
    await redisClient.set(vid, JSON.stringify(cacheObj))
}

const getVData = async (vid: string): Promise<string> => {
    return (await redisClient.get(vid))!
}

export { inCache, delCache, createCacheObj, setData, getData, setVData, getVData}