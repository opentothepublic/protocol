import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { redisClient } from '../../utils/redis';

const getResponse = async (): Promise<NextResponse> => {
    let attestTxn = await redisClient.get('attestTxn')    
    console.log(attestTxn)
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
                    "target": `https://base-sepolia.easscan.org/attestation/view/${attestTxn}`
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

export const POST = async(): Promise<NextResponse> => {
  return getResponse();
}

export const dynamic = 'force-dynamic';