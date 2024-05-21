import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getFids, toOttpIdPng, validateCollabUserInput } from '../../utils/utils'
import { createCacheObj, delCache, getData, inCache, setData } from '../../utils/redis';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  const ottpId = req.nextUrl.searchParams.get('ottpId')
  const ottpImageUrl = await toOttpIdPng(parseInt(ottpId!))  
        
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          "label": "Get your work verified onchain",
          "action": 'post',                
        },        
      ],
      image: {
        src: `${NEXT_PUBLIC_URL}/${ottpImageUrl}`,
      },      
      postUrl: `${NEXT_PUBLIC_URL}/api/restart`,
    })
  )
}

export const POST = async(req: NextRequest): Promise<Response> => {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
