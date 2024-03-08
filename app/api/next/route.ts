import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getFids, validateCollabUserInput } from '../../utils/utils';

var fids: string[] = []

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  const body: FrameRequest = await req.json();
  let inputText: string = body.untrustedData.inputText

  if(validateCollabUserInput(inputText)){
    getFids(inputText)
            .then((frameFids) => fids = frameFids)
            .catch((error) => console.error(error))
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
            {
                "label": "Back",
                "action": 'post',                
            },
            {
                "label": "Attest",
                "action": 'post',                
            }
        ],
        image: {
          src: `${NEXT_PUBLIC_URL}/ottp-frame-1b.png`,
        },
        input: {text: 'What did you create @fcg'},                
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
