import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getFids, validateCollabUserInput } from '../../utils/utils'
import { createCacheObj, delCache, getData, inCache, setData } from '../../utils/redis';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  const body: FrameRequest = await req.json();
  let inputText: string = body.untrustedData.inputText
  //let fromFid: string = body.untrustedData.fid.toString()
  let fromFid: number = body.untrustedData.fid
  
  if(validateCollabUserInput(inputText)){

    const fidsPromise = getFids(inputText)
    await inCache(fromFid) ? await delCache(fromFid) : await createCacheObj(fromFid)
    const fids = await fidsPromise      
    await setData(fromFid, fids.toString(), '')
    console.log(await getData(fromFid))              
        
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            "label": "Back",
            "action": 'post',                
          },
          {
            "label": "Attest",
            "action": 'tx',     
            "target": `${NEXT_PUBLIC_URL}/api/attest`,      
            "postUrl": `${NEXT_PUBLIC_URL}/api/final`,           
          }
        ],
        image: {
          src: `${NEXT_PUBLIC_URL}/ottp-frame-1b.png`,
        },
        input: {text: 'Describe & tag project e.g. @fwg'},                
        postUrl: `${NEXT_PUBLIC_URL}/api/attest`,          
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
        postUrl: `${NEXT_PUBLIC_URL}/api/next`
      })
    )
  }
}

export const POST = async(req: NextRequest): Promise<Response> => {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
