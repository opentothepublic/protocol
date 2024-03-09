import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, parseEther } from 'viem';
import { base } from 'viem/chains';
import type { FrameTransactionResponse } from '@coinbase/onchainkit/frame';
import easAbi from '../../contracts/easAbi';

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
    const body: FrameRequest = await req.json();
    const schemaUID = process.env.SCHEMAUID as string
    const easContractAddress = process.env.EASCONTRACTADDRESS as `0x{string}`
    let dataObj: any = {}
    dataObj.toFID = '2095'
    dataObj.message = 'Building @OTTP Frame'
    dataObj.project = '@OTTP'

    const data = encodeFunctionData({
        abi: easAbi,
        functionName: 'attest',
        args: [{
            schema: schemaUID,
            data: {
                recipient: "0x0000000000000000000000000000000000000000",            
                revocable: true, // Be aware that if your schema is not revocable, this MUST be false
                data: [
                    { name: "fromFID", value: (body.untrustedData.fid).toString(), type: "string" },
                    { name: "data", value: dataObj, type: "string" }	        
                ],
            },
        }],
    });

  const txData: FrameTransactionResponse = {
    chainId: `eip155:${base.id}`, // Remember Base Sepolia might not work on Warpcast yet
    method: 'eth_sendTransaction',
    params: {
      abi: [],
      data,
      to: easContractAddress,
      value: parseEther('0.00004').toString(), // 0.00004 ETH
    },
  };
  return NextResponse.json(txData);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';