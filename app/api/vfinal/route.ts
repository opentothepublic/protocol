import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getData, setData } from '../../utils/redis'
import { getNewAttestId } from '../../utils/utils';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
    const body: FrameRequest = await req.json();
    let fromFid = body.untrustedData.fid
    //console.log(body)
    let txnId = body?.untrustedData?.transactionId
    console.log('TxnId: ',txnId)
    let cachedData = JSON.parse(await getData(fromFid))

    const attestUid = await getNewAttestId(txnId!)
    console.log(attestUid)
    setData(fromFid, cachedData.toFids, attestUid!, cachedData.project, cachedData.message)        
    
    return new NextResponse(
        getFrameHtmlResponse({
            buttons: [                
                {
                    "label": "View",
                    "action": "link",
                    "target": `https://base.easscan.org/attestation/view/${attestUid}`                    
                    //"target": `https://basescan.org//tx/${txnId}`
                },
                {
                    "label": "Create",
                    "action": "link",
                    "target": "https://warpcast.com/ottp/0xfab58542"                   
                }
            ],                
            image: {
                src: `${NEXT_PUBLIC_URL}/ottp-frame-1b-3.png`,
            },
            ogTitle: "Open to the Public",    
        })
    )
}

export const POST = async(req: NextRequest): Promise<NextResponse> => {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';