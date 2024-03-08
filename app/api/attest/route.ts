import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getTaggedData, onchainAttestation } from '../../utils/utils';
import { AttestData } from '../../utils/interface';
import { redisClient } from '../../utils/redis';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
    const body: FrameRequest = await req.json();
    if (body.untrustedData.buttonIndex !== 1) {
        let inputText: string = body.untrustedData.inputText        
        let project: string[] = getTaggedData(inputText)
        
        let data: any = {}
        data.toFID = await redisClient.get('fids')
        data.message = inputText
        data.project = project
        
        console.log(data)
        let attestDataObj: AttestData = {
            fromFID: (body.untrustedData.fid).toString(),
            data: JSON.stringify(data)
        }
    
        onchainAttestation(attestDataObj)
            .then(async(txnId) => {    
                await redisClient.set('attestTxn', txnId as string)
                console.log(await redisClient.get('attestTxn'))
            })
            .catch((e) => console.error(e))
        
        return new NextResponse(
            getFrameHtmlResponse({
                buttons: [
                    {
                        "label": "Next",
                        "action": "post",                        
                    },                    
                ],                
                image: {
                    src: `${NEXT_PUBLIC_URL}/ottp-frame-1c.gif`,
                },
                ogTitle: "OTTP: Shoutout!",    
                postUrl: `${NEXT_PUBLIC_URL}/api/final`,            
            })
        )
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