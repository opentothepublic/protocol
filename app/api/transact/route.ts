import { FrameRequest } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, parseEther } from 'viem';
import { base } from 'viem/chains';
import type { FrameTransactionResponse } from '@coinbase/onchainkit/frame';
import easAbi from '../../contracts/easAbi';
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { NEXT_PUBLIC_SCHEMAUID } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
    const body: FrameRequest = await req.json();
    const schemaUID = NEXT_PUBLIC_SCHEMAUID as string
    const easContractAddress = process.env.EASCONTRACTADDRESS as `0x{string}`
    let dataObj: any = {}
    dataObj.toFID = '2095'
    dataObj.message = 'Building @OTTP Frame'
    dataObj.project = '@OTTP'
    const fromFid = body.untrustedData.fid.toString()

    const schemaEncoder = new SchemaEncoder("string fromFID,string data")
        const encodedData = schemaEncoder.encodeData([
	        { name: "fromFID", value: fromFid, type: "string" },
	        { name: "data", value: JSON.stringify(dataObj), type: "string" }	        
        ])
    console.log(encodedData)

    const functionData = {
      schema: schemaUID,
      data: {
        recipient: "0x0000000000000000000000000000000000000000",
        expirationTime: 0,
        revocable: true,
        refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
        data: encodedData,
        value: 0,
      }
    }
    //console.log(functionData)
    
      const data = encodeFunctionData({
        abi: easAbi,
        functionName: 'attest',
        args: [functionData],
      })
      //console.log("Data : ", data)
      const txData: FrameTransactionResponse = {
        chainId: `eip155:${base.id}`, // Remember Base Sepolia might not work on Warpcast yet
        method: 'eth_sendTransaction',
        params: {
          abi: [],
          data,
          to: easContractAddress,
          value: parseEther('0.00004').toString(), // 0.00004 ETH
        },
      }
      //console.log("txData : ", txData)
      return NextResponse.json(txData);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';