import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getData, setData } from '../../utils/redis';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
    const body: FrameRequest = await req.json();
    let fromFid = body.untrustedData.fid.toString()
    let txnId = body?.untrustedData?.transactionId
    let cachedData = JSON.parse(await getData(fromFid))
    await setData(fromFid, cachedData.toFids, txnId!)        
    
    return new NextResponse(
        getFrameHtmlResponse({
            buttons: [
                {
                    "label": "Share",
                    "action": "link",
                    "target": "https://example.com"
                },
                {
                    "label": "View",
                    "action": "link",
                    //"target": `https://base-sepolia.easscan.org/attestation/view/${cachedData.attestTxn}`
                    "target": `https://base-sepolia.easscan.org/attestation/view/${txnId}`
                },
                {
                    "label": "Restart",
                    "action": "post"                        
                }
            ],                
            image: {
                src: `${NEXT_PUBLIC_URL}/ottp-frame-1d.png`,
            },
            ogTitle: "OTTP: Shoutout!",    
            postUrl: `${NEXT_PUBLIC_URL}/api/restart`,           
        })
    )
}

export const POST = async(req: NextRequest): Promise<NextResponse> => {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';