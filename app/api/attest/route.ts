import { FrameRequest, FrameTransactionResponse, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL, NEXT_PUBLIC_SCHEMAUID, NEXT_PUBLIC_CHAINID } from '../../config';
import { getTaggedData } from '../../utils/utils';
import { getData, setData } from '../../utils/redis';
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { encodeFunctionData, parseEther } from 'viem';
import easAbi from '../../contracts/easAbi';
import { base } from 'viem/chains';


const getResponse = async (req: NextRequest): Promise<NextResponse> => {
    const body: FrameRequest = await req.json();
    if (body.untrustedData.buttonIndex !== 1) {
        
        let inputText: string = body.untrustedData.inputText        
        let project: string[] = getTaggedData(inputText)
        let fromFid = body.untrustedData.fid
        let cachedData = JSON.parse(await getData(fromFid))
        setData(fromFid, cachedData.toFids, '', project.toString(), inputText)        
        let data: any = {
            toFID: cachedData.toFids,
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
    
    } else {
        return new NextResponse(
            getFrameHtmlResponse({
                buttons: [
                    {
                        "label": "Next",
                        "action": "post",                
                    }
                ],
                image: {
                    src: `${NEXT_PUBLIC_URL}/ottp-frame-1a.png`,
                },
                input: {text: 'Tag collaborators e.g. @df @v'},        
                ogTitle: "OTTP: Shoutout!",
                postUrl: `${NEXT_PUBLIC_URL}/api/next`,                   
            })
        )
    }
}

export const POST = async(req: NextRequest): Promise<Response> => {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';