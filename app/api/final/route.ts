import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getData, setData } from '../../utils/redis';
import { getAttestandOttpId, cast, toOttpIdPng } from '../../utils/utils';

const getResponse = async (req: NextRequest): Promise<NextResponse|any> => {    
    const body: FrameRequest = await req.json();
    let fromFid = body.untrustedData.fid
    //console.log(body)
    let txnId = body?.untrustedData?.transactionId
    console.log('TxnId: ',txnId)
    let cachedData = JSON.parse(await getData(fromFid))

    const data = await getAttestandOttpId(txnId!)
    if (data instanceof Error) {
        console.error(data.message)    
    } else {
        const attestUid = data.attestUid
        const ottpId = data.ottpId
        console.log("Attest UID:", attestUid)
        console.log("OTPP ID:", ottpId)      
        setData(fromFid, cachedData.toFids, attestUid!,cachedData.project, cachedData.message)       
        if (ottpId != null) {
                        
            cast(fromFid, await getData(fromFid))     
            
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
                            "label": "Share",
                            "action": "link",
                            "target": `https://warpcast.com/~/compose?text=I%20just%20updated%20my%20collaboration%20graph.%20Get%20your%20OTTP%20ID%20to%20link%20up.\n\n&embeds[]=${NEXT_PUBLIC_URL}/api/share?ottpid=${ottpId}`,     
                        },
                        {
                            "label": "Restart",
                            "action": "post"                        
                        }
                    ],                
                    image: {
                        src: `${NEXT_PUBLIC_URL}/ottp-frame-1d.png`,
                    },
                    ogTitle: "Open to the Public",    
                    postUrl: `${NEXT_PUBLIC_URL}/api/restart`,           
                })
            )
        } else {
            cast(fromFid, await getData(fromFid))

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
                            "label": "Restart",
                            "action": "post"                        
                        }
                    ],                
                    image: {
                        src: `${NEXT_PUBLIC_URL}/ottp-frame-1d.png`,
                    },
                    ogTitle: "Open to the Public",
                    postUrl: `${NEXT_PUBLIC_URL}/api/restart`,           
                })
            )
        }
    }
}
export const POST = async(req: NextRequest): Promise<NextResponse> => {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';