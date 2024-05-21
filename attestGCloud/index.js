const { EAS, SchemaEncoder } = require('@ethereum-attestation-service/eas-sdk');
const { Redis } = require('@upstash/redis')
const { ethers } = require('ethers')
require('dotenv').config()

const redisClient = new Redis({
    url: `https://${process.env.REDIS_ENDPOINT}`,
    token: `${process.env.REDIS_TOKEN}`,
  })

const onchainAttestation = async (attestObj) => {
    try {
        const easContractAddress = process.env.EASCONTRACTADDRESS
        const schemaUID = process.env.SCHEMAUID
        const eas = new EAS(easContractAddress)
        const provider = new ethers.JsonRpcProvider('https://sepolia.base.org')    
        const signer = new ethers.Wallet(process.env.PVTKEY, provider)
        eas.connect(signer)
        
        const schemaEncoder = new SchemaEncoder("string fromFID,string data")
        const encodedData = schemaEncoder.encodeData([
            { name: "fromFID", value: attestObj.fromFID, type: "string" },
            { name: "data", value: attestObj.data, type: "string" }	        
        ])

        const tx = await eas.attest({
            schema: schemaUID,
            data: {
                recipient: "0x0000000000000000000000000000000000000000",            
                revocable: true, // Be aware that if your schema is not revocable, this MUST be false
                data: encodedData,
            },
        })
        const newAttestationUID = await tx.wait()        
        return newAttestationUID
    } catch (err) {
        console.log(err)        
    }    
}

const setData = async (fromFid, toFids, attestTxn) => {
    let cacheObj = {
        toFids: toFids,
        attestTxn: attestTxn
    }
    await redisClient.set(fromFid, JSON.stringify(cacheObj))
}

const getData = async (fromFid) => {
    return (await redisClient.get(fromFid))
}

exports.onChainAttestation = async (req, res) => {
    const { fromFID, data } = req.body
    if (!fromFID || !data) {
        console.error('Attestation data was not specified correctly');
        return res.status(500).send('Attestation data was not specified correctly');
    }
    try {
        const toFids = data.toFID
        let attestDataObj = {
            fromFID: fromFID,
            data: JSON.stringify(data)
        }
        
        let txnId = await onchainAttestation(attestDataObj)
        console.log(txnId)
        await setData(fromFID, toFids, txnId)
        console.log(await getData(fromFID))

        res.status(200).send("Attestation data set")
    } catch (error) {      
        console.error("Error: ", error);
        res.status(500).send(error);
    }
}