import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getTaggedData } from '../../utils/utils';
import { getData } from '../../utils/redis';
import axios from 'axios'

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
    const body: FrameRequest = await req.json();
    if (body.untrustedData.buttonIndex !== 1) {
        
        let inputText: string = body.untrustedData.inputText        
        let project: string[] = getTaggedData(inputText)
        let fromFid = body.untrustedData.fid.toString()
        let cachedData = JSON.parse(await getData(fromFid))
        //console.log(cachedData)       

        let data: any = {
            toFID: cachedData.toFids,
            message: inputText,
            project: project        
        }        
        console.log(data)
        
        axios.post(`${process.env.GCLOUD_FUNCTION}`, {
                fromFID: fromFid,               
                data: data
            }, {
            headers: {
               'Content-Type': 'application/json'
            }
        })
        
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