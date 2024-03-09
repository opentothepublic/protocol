import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getTaggedData, onchainAttestation } from '../../utils/utils';
import { AttestData } from '../../utils/interface';
import { getData, setData } from '../../utils/redis';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
    const body: FrameRequest = await req.json();
    if (body.untrustedData.buttonIndex !== 1) {
        let inputText: string = body.untrustedData.inputText        
        let project: string[] = getTaggedData(inputText)
        let fromFid = body.untrustedData.fid
        let cachedData: string = await getData(fromFid.toString())
        console.log(cachedData) 
        let cachedDataJson = await JSON.parse(cachedData)
        console.log(cachedDataJson)
        let toFids = cachedDataJson.toFids
        console.log(toFids)
        let data: any = {}
        //data.toFID = cachedData.toFids
        data.toFID = toFids
        data.message = inputText
        data.project = project
        
        console.log(data)
        let attestDataObj: AttestData = {
            fromFID: (body.untrustedData.fid).toString(),
            data: JSON.stringify(data)
        }
    
        let txnId = await onchainAttestation(attestDataObj)
        await setData(fromFid.toString(), cachedDataJson.toFids, txnId!)
        console.log(await getData(fromFid.toString()))
        
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