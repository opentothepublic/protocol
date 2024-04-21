import { FrameRequest, FrameTransactionResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { createCacheObj, delCache, getData, getVData, inCache, setData } from '../../utils/redis';
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { encodeFunctionData, parseEther } from 'viem';
import easAbi from '../../contracts/easAbi';
import { base } from 'viem/chains';


const getResponse = async (req: NextRequest): Promise<NextResponse> => {
    const body: FrameRequest = await req.json()
    //console.log(body)
    let fromFid: number = body.untrustedData.fid

      const vid = req.nextUrl.searchParams.get('v')
      const vData = JSON.parse(await getVData(vid!))
      //console.log(vData);
      await inCache(fromFid) ? await delCache(fromFid) : await createCacheObj(fromFid)
      await setData(fromFid, vData.toFids, '', vData.project, vData.text)
      console.log(await getData(fromFid))              
    
        let inputText: string = 'Attestation verified'
        let project: string[] = vData.project
        
        //let cachedData = JSON.parse(await getData(fromFid))
        
        let data: any = {
            toFID: vData.toFids,
            message: inputText,
            project: project      
        }        
        console.log(data)

        const schemaEncoder = new SchemaEncoder("uint256 fromFID,string data")
        const encodedData = schemaEncoder.encodeData([
	        { name: "fromFID", value: fromFid, type: "uint256" },
	        { name: "data", value: JSON.stringify(data), type: "string" }	        
        ])
        console.log(encodedData)
        
        const functionData = {
            schema: process.env.MAINNET_SCHEMAUID as string,
            data: {
              recipient: "0x0000000000000000000000000000000000000000",
              expirationTime: 0,
              revocable: true,
              refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
              data: encodedData,
              value: 0,
            }
        }
        
        const transactiondata = encodeFunctionData({
            abi: easAbi,
            functionName: 'attest',
            args: [functionData],
        })
        //console.log("Data : ", data)
        
        const txData: FrameTransactionResponse = {
            //chainId: `eip155:${NEXT_PUBLIC_CHAINID}`,
            chainId: `eip155:${base.id}`, 
            method: 'eth_sendTransaction',
            params: {
                abi: [],
                data: transactiondata,
                to: process.env.EASCONTRACTADDRESS  as `0x{string}`,
                value: parseEther('0').toString(),
            },
        }
        console.log("txData : ", txData)
        return NextResponse.json(txData);
    }

export const POST = async(req: NextRequest): Promise<Response> => {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';