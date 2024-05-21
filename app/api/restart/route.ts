import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

const getResponse = (): NextResponse => {
    return new NextResponse(
        getFrameHtmlResponse({
            buttons: [
                {
                    "label": "Next",
                    "action": "post"   
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

export const POST = (): Response => {
  return getResponse();
}

export const dynamic = 'force-dynamic';